using CommonCents.Application.Models;
using CommonCents.Domain;

namespace CommonCents.Application.Interfaces;

public interface IHouseholdLedgerService
{
    Task AddExpenseAsync(
        decimal amount,
        string description,
        DateOnly date,
        Payer paidBy,
        CancellationToken cancellationToken = default);

    Task AddSettlementAsync(
        DateOnly date,
        Payer from,
        Payer to,
        decimal amount,
        string? note = null,
        CancellationToken cancellationToken = default);

    Task<HouseholdSummaryDto> GetCurrentMonthSummaryAsync(
        CancellationToken cancellationToken = default);
}
