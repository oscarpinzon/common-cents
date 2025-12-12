namespace CommonCents.Application.Models;

public sealed record ActivityCycleDto(
    bool IsSettled,
    DateTime StartedAtUtc,
    DateTime? SettledAtUtc,
    decimal NetAtEnd,
    IReadOnlyList<ActivityItemDto> Items);
