using CommonCents.Application.Interfaces;
using CommonCents.Domain;
using Microsoft.EntityFrameworkCore;

namespace CommonCents.Infrastructure.Persistence;

public class EfSettlementRepository(CommonCentsDbContext db) : ISettlementRepository
{
    public async Task AddAsync(Settlement settlement, CancellationToken cancellationToken = default)
    {
        await db.Settlements.AddAsync(settlement, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Settlement>> GetByHouseholdAsync(
        Guid householdId,
        CancellationToken cancellationToken = default)
    {
        return await db.Settlements
            .Where(s => s.HouseholdId == householdId)
            .OrderBy(s => s.Date)
            .ThenBy(s => s.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}
