using CommonCents.Application.Interfaces;
using CommonCents.Application.Models;
using CommonCents.Domain;

namespace CommonCents.Application.Services;

public class HouseholdLedgerService(
    IExpenseRepository expenseRepository,
    ISettlementRepository settlementRepository)
    : IHouseholdLedgerService
{
    public async Task AddExpenseAsync(
        decimal amount,
        string description,
        DateOnly date,
        Payer paidBy,
        CancellationToken cancellationToken = default)
    {
        var expense = new Expense(
            id: Guid.NewGuid(),
            householdId: HouseholdConstants.DemoHouseholdId,
            amount: amount,
            description: description,
            date: date,
            paidBy: paidBy,
            createdAtUtc: DateTime.UtcNow);

        await expenseRepository.AddAsync(expense, cancellationToken);
    }

    public async Task AddSettlementAsync(
        DateOnly date,
        Payer from,
        Payer to,
        decimal amount,
        string? note = null,
        CancellationToken cancellationToken = default)
    {
        var settlement = new Settlement(
            Id: Guid.NewGuid(),
            HouseholdId: HouseholdConstants.DemoHouseholdId,
            Date: date,
            From: from,
            To: to,
            Amount: amount,
            Note: note,
            CreatedAtUtc: DateTime.UtcNow);

        await settlementRepository.AddAsync(settlement, cancellationToken);
    }

    public async Task<HouseholdSummaryDto> GetCurrentMonthSummaryAsync(CancellationToken ct)
    {
        var householdId = HouseholdConstants.DemoHouseholdId;

        var (year, month, _) = DateTime.UtcNow;

        var expenses = await expenseRepository.GetByHouseholdAndMonthAsync(
            householdId,
            year,
            month,
            ct);

        var settlements = await settlementRepository.GetByHouseholdAsync(
            householdId,
            ct);

        // 1. Basic totals
        var totalPaidByMe = expenses
            .Where(e => e.PaidBy == Payer.Me)
            .Sum(e => e.Amount);

        var totalPaidByPartner = expenses
            .Where(e => e.PaidBy == Payer.Partner)
            .Sum(e => e.Amount);

        var total = totalPaidByMe + totalPaidByPartner;
        var fairShareEach = total / 2m;

        var meDeltaFromExpenses = totalPaidByMe - fairShareEach;

        var mePaidPartner = settlements
            .Where(s => s.From == Payer.Me && s.To == Payer.Partner)
            .Sum(s => s.Amount);

        var partnerPaidMe = settlements
            .Where(s => s.From == Payer.Partner && s.To == Payer.Me)
            .Sum(s => s.Amount);

        var meNet = meDeltaFromExpenses - partnerPaidMe + mePaidPartner;

        decimal netOwedToMe;
        decimal netOwedToPartner;

        if (meNet > 0)
        {
            netOwedToMe = meNet;
            netOwedToPartner = 0;
        }
        else
        {
            netOwedToMe = 0;
            netOwedToPartner = Math.Abs(meNet);
        }

        // 2. Build cycles from full timeline of expenses + settlements
        var cycles = BuildActivityCycles(expenses, settlements);

        return new HouseholdSummaryDto(
            Year: year,
            Month: month,
            Total: total,
            TotalPaidByMe: totalPaidByMe,
            TotalPaidByPartner: totalPaidByPartner,
            NetOwedToMe: netOwedToMe,
            NetOwedToPartner: netOwedToPartner,
            RecentActivityCycles: cycles);
    }

    private static IReadOnlyList<ActivityCycleDto> BuildActivityCycles(
        IReadOnlyList<Expense> expenses,
        IReadOnlyList<Settlement> settlements)
    {
        // Combine expenses + settlements into one timeline
        var events =
            new List<(DateTime occurredAtUtc, ActivityItemType kind, Expense? expense, Settlement? settlement)>();

        events.AddRange(expenses.Select(e => (
            occurredAtUtc: e.CreatedAtUtc,
            kind: ActivityItemType.Expense,
            expense: e,
            settlement: default(Settlement?)))!);

        events.AddRange(settlements.Select(s => (
            occurredAtUtc: s.CreatedAtUtc,
            kind: ActivityItemType.Settlement,
            expense: default(Expense?),
            settlement: s))!);

        events = events
            .OrderBy(e => e.occurredAtUtc)
            .ToList();

        var cycles = new List<ActivityCycleDto>();

        if (events.Count == 0)
        {
            return cycles;
        }

        var currentItems = new List<ActivityItemDto>();
        var currentCycleStart = events.First().occurredAtUtc;
        var runningNet = 0m;

        foreach (var e in events)
        {
            decimal amount;
            decimal delta;

            switch (e.kind)
            {
                case ActivityItemType.Expense when e.expense is not null:
                {
                    var exp = e.expense;
                    amount = exp.Amount;

                    // 50/50 split: Me perspective
                    var half = exp.Amount / 2m;
                    delta = exp.PaidBy == Payer.Me
                        ? +half // partner owes me half
                        : -half; // I owe partner half
                    break;
                }
                case ActivityItemType.Settlement when e.settlement is not null:
                {
                    var s = e.settlement;
                    amount = s.Amount;

                    delta = s.From switch
                    {
                        // Explicitly handle settlement directions (me-perspective):
                        // - I paid partner => my relative advantage increases
                        // - Partner paid me => my relative advantage decreases
                        Payer.Me when s.To == Payer.Partner => +s.Amount,
                        Payer.Partner when s.To == Payer.Me => -s.Amount,
                        _ => 0m
                    };
                    break;
                }
                default:
                    continue;
            }

            runningNet += delta;

            var item = new ActivityItemDto(
                OccurredAtUtc: e.occurredAtUtc,
                Type: e.kind,
                Description: e.expense?.Description ?? e.settlement?.Note ?? string.Empty,
                PaidBy: e.expense?.PaidBy,
                From: e.settlement?.From,
                To: e.settlement?.To,
                Amount: amount,
                NetAfterThisItem: runningNet);

            currentItems.Add(item);
            
            if (Math.Abs(runningNet) >= 0.01m) continue;

            cycles.Add(new ActivityCycleDto(
                IsSettled: true,
                StartedAtUtc: currentCycleStart,
                SettledAtUtc: e.occurredAtUtc,
                NetAtEnd: runningNet,
                Items: currentItems.ToList()));

            currentItems.Clear();
            // next cycle will start at the next event (if any)
            // we'll set currentCycleStart when we see it
            if (events.IndexOf(e) + 1 < events.Count)
            {
                currentCycleStart = events[events.IndexOf(e) + 1].occurredAtUtc;
            }
        }

        // Remaining open cycle
        if (currentItems.Count > 0 && Math.Abs(runningNet) >= 0.01m)
        {
            cycles.Add(new ActivityCycleDto(
                IsSettled: false,
                StartedAtUtc: currentCycleStart,
                SettledAtUtc: null,
                NetAtEnd: runningNet,
                Items: currentItems.ToList()));
        }

        return cycles;
    }
}
