using CommonCents.Domain;
using Microsoft.EntityFrameworkCore;

namespace CommonCents.Infrastructure.Persistence;

public class CommonCentsDbContext(DbContextOptions<CommonCentsDbContext> options) : DbContext(options)
{
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Settlement> Settlements => Set<Settlement>();

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
        
        modelBuilder.Entity<Settlement>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.Property(s => s.From)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(s => s.To)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(s => s.Amount)
                .HasColumnType("numeric(18,2)");

            entity.Property(s => s.Date);
            entity.Property(s => s.Note);
            entity.Property(s => s.CreatedAtUtc);
            entity.Property(s => s.HouseholdId);
        });
    }
}
