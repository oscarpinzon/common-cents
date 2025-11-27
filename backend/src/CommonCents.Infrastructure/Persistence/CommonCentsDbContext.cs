using CommonCents.Domain;
using Microsoft.EntityFrameworkCore;

namespace CommonCents.Infrastructure.Persistence;

public class CommonCentsDbContext : DbContext
{
    public CommonCentsDbContext(DbContextOptions<CommonCentsDbContext> options)
        : base(options)
    {
    }

    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Amount)
                .HasColumnType("numeric(18,2)");

            // DateOnly is supported by Npgsql EF Core
            entity.Property(e => e.Date);

            entity.Property(e => e.PaidBy)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(e => e.CreatedAtUtc);
            entity.Property(e => e.HouseholdId);
        });
    }
}
