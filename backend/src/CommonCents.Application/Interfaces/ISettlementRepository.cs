using CommonCents.Domain;

namespace CommonCents.Application.Interfaces;

public interface ISettlementRepository
{
    Task AddAsync(Settlement settlement, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Settlement>> GetByHouseholdAsync(
        Guid householdId,
        CancellationToken cancellationToken = default);
}
