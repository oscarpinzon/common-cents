namespace CommonCents.Domain;

public sealed record Settlement(
    Guid Id,
    Guid HouseholdId,
    DateOnly Date,
    Payer From,
    Payer To,
    decimal Amount,
    string? Note,
    DateTime CreatedAtUtc);
