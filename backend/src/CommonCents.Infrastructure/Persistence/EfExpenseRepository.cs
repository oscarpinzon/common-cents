using CommonCents.Application.Interfaces;
using CommonCents.Domain;
using Microsoft.EntityFrameworkCore;

namespace CommonCents.Infrastructure.Persistence;

public class EfExpenseRepository : IExpenseRepository
{
    private readonly CommonCentsDbContext _dbContext;

    public EfExpenseRepository(CommonCentsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        await _dbContext.Expenses.AddAsync(expense, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Expense>> GetByHouseholdAndMonthAsync(
        Guid householdId,
        int year,
        int month,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Expenses
            .Where(e => e.HouseholdId == householdId &&
                        e.Date.Year == year &&
                        e.Date.Month == month)
            .OrderBy(e => e.Date)
            .ThenBy(e => e.CreatedAtUtc);

        var list = await query.ToListAsync(cancellationToken);
        return list;
    }

    public async Task<IReadOnlyList<Expense>> GetRecentAsync(
        Guid householdId,
        int count,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Expenses
            .Where(e => e.HouseholdId == householdId)
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAtUtc)
            .Take(count);

        var list = await query.ToListAsync(cancellationToken);
        return list;
    }
}
