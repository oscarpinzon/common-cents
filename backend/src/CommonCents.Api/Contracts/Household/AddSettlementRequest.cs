using CommonCents.Domain;

namespace CommonCents.Api.Contracts.Household;

public sealed record AddSettlementRequest(
    DateOnly Date,
    string From,
    string To,
    decimal Amount,
    string? Note);
