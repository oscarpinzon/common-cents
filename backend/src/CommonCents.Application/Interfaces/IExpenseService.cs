using CommonCents.Application.Models;
using CommonCents.Domain;

namespace CommonCents.Application.Interfaces;

public interface IExpenseService
{
    Task AddExpenseAsync(
        decimal amount,
        string description,
        DateOnly date,
        Payer paidBy,
        CancellationToken cancellationToken = default);
    
    Task<HouseholdSummaryDto> GetCurrentMonthSummaryAsync(
        CancellationToken cancellationToken = default);
}
