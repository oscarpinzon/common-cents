namespace CommonCents.Application.Models;

public sealed record HouseholdSummaryDto(
    int Year,
    int Month,
    decimal Total,
    IReadOnlyList<ExpenseDto> RecentExpenses);
