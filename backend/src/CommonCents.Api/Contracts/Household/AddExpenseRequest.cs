namespace CommonCents.Api.Contracts.Household;

public sealed record AddExpenseRequest(
    decimal Amount,
    string Description,
    DateOnly Date,
    string PaidBy);
