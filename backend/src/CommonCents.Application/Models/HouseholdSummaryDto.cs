namespace CommonCents.Application.Models;

public sealed record HouseholdSummaryDto(
    int Year,
    int Month,
    decimal Total,
    decimal TotalPaidByMe,
    decimal TotalPaidByPartner,
    decimal NetOwedToMe,
    decimal NetOwedToPartner,
    IReadOnlyList<ActivityCycleDto> RecentActivityCycles);
