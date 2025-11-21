using CommonCents.Application.Interfaces;
using CommonCents.Domain;

namespace CommonCents.Infrastructure.InMemory;

// TODO: Replace with persistent implementation
public class InMemoryExpenseRepository : IExpenseRepository
{
    // MVP-only: shared in-memory storage (not thread-safe)
    private static readonly List<Expense> _expenses = [];

    public Task AddAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        _expenses.Add(expense);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<Expense>> GetByHouseholdAndMonthAsync(
        Guid householdId,
        int year,
        int month,
        CancellationToken cancellationToken = default)
    {
        var result = _expenses
            .Where(e => e.HouseholdId == householdId &&
                        e.Date.Year == year &&
                        e.Date.Month == month)
            .OrderBy(e => e.Date)
            .ThenBy(e => e.CreatedAtUtc)
            .ToList()
            .AsReadOnly();

        return Task.FromResult<IReadOnlyList<Expense>>(result);
    }

    public Task<IReadOnlyList<Expense>> GetRecentAsync(
        Guid householdId,
        int count,
        CancellationToken cancellationToken = default)
    {
        var result = _expenses
            .Where(e => e.HouseholdId == householdId)
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAtUtc)
            .Take(count)
            .ToList()
            .AsReadOnly();

        return Task.FromResult<IReadOnlyList<Expense>>(result);
    }
}
