using CommonCents.Domain;

namespace CommonCents.Application.Models;

public sealed record ActivityItemDto(
    DateTime OccurredAtUtc,
    ActivityItemType Type,
    string? Description,
    Payer? PaidBy,
    Payer? From,
    Payer? To,
    decimal Amount,
    decimal NetAfterThisItem);
