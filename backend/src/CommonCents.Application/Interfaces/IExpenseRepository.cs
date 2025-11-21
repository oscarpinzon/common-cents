using CommonCents.Domain;

namespace CommonCents.Application.Interfaces;

public interface IExpenseRepository
{
    Task AddAsync(Expense expense, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Expense>> GetByHouseholdAndMonthAsync(
        Guid householdId,
        int year,
        int month,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Expense>> GetRecentAsync(
        Guid householdId,
        int count,
        CancellationToken cancellationToken = default);
}
