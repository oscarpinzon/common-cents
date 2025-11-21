namespace CommonCents.Application.Models;

public sealed record ExpenseDto(
    Guid Id,
    decimal Amount,
    string Description,
    DateOnly Date,
    string PaidBy);
