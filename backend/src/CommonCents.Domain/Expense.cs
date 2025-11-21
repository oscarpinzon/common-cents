namespace CommonCents.Domain;

public class Expense
{
    public Guid Id { get; }
    public Guid HouseholdId { get; }
    public decimal Amount { get; }
    public string Description { get; }
    public DateOnly Date { get; }
    public Payer PaidBy { get; }
    public DateTime CreatedAtUtc { get; }
    
    public Expense(
        Guid id,
        Guid householdId,
        decimal amount,
        string description,
        DateOnly date,
        Payer paidBy,
        DateTime createdAtUtc)
    {
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be greater than zero.");
        
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required.", nameof(description));
        
        Id = id;
        HouseholdId = householdId;
        Amount = amount;
        Description = description.Trim();
        Date = date;
        PaidBy = paidBy;
        CreatedAtUtc = createdAtUtc;
    }
}
