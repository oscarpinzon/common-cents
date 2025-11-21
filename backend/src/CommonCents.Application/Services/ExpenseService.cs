using CommonCents.Application.Interfaces;
using CommonCents.Application.Models;
using CommonCents.Domain;

namespace CommonCents.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _repository;

    public ExpenseService(IExpenseRepository repository)
    {
        _repository = repository;
    }

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

        await _repository.AddAsync(expense, cancellationToken);
    }

    public async Task<HouseholdSummaryDto> GetCurrentMonthSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var (year, month, _) = DateTime.UtcNow;

        var expenses = await _repository.GetByHouseholdAndMonthAsync(
            HouseholdConstants.DemoHouseholdId,
            year,
            month,
            cancellationToken);

        var total = expenses.Sum(e => e.Amount);

        var recent = (await _repository.GetRecentAsync(
                HouseholdConstants.DemoHouseholdId,
                count: 10,
                cancellationToken))
            .Select(e => new ExpenseDto(
                e.Id,
                e.Amount,
                e.Description,
                e.Date,
                e.PaidBy.ToString()))
            .ToList();

        return new HouseholdSummaryDto(
            Year: year,
            Month: month,
            Total: total,
            RecentExpenses: recent);
    }
}
