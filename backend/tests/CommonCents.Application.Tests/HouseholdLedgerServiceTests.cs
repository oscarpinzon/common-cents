using CommonCents.Application.Interfaces;
using CommonCents.Application.Models;
using CommonCents.Application.Services;
using CommonCents.Domain;
using FluentAssertions;
using NSubstitute;

namespace CommonCents.Application.Tests;

public class HouseholdLedgerServiceTests
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly ISettlementRepository _settlementRepository;
    private readonly HouseholdLedgerService _sut;

    public HouseholdLedgerServiceTests()
    {
        _expenseRepository = Substitute.For<IExpenseRepository>();
        _settlementRepository = Substitute.For<ISettlementRepository>();
        _sut = new HouseholdLedgerService(_expenseRepository, _settlementRepository);
    }

    #region Net Balance Calculations - Expenses Only

    [Fact]
    public async Task GetCurrentMonthSummary_WhenMePaysMore_PartnerOwesMe()
    {
        // Arrange: Me paid $100, Partner paid $0
        // Fair share each = $50, so Partner owes Me $50
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me)
        };
        SetupRepositories(expenses, []);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.TotalPaidByMe.Should().Be(100m);
        result.TotalPaidByPartner.Should().Be(0m);
        result.Total.Should().Be(100m);
        result.NetOwedToMe.Should().Be(50m);
        result.NetOwedToPartner.Should().Be(0m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_WhenPartnerPaysMore_IOwPartner()
    {
        // Arrange: Me paid $0, Partner paid $100
        // Fair share each = $50, so I owe Partner $50
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Partner)
        };
        SetupRepositories(expenses, []);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.TotalPaidByMe.Should().Be(0m);
        result.TotalPaidByPartner.Should().Be(100m);
        result.Total.Should().Be(100m);
        result.NetOwedToMe.Should().Be(0m);
        result.NetOwedToPartner.Should().Be(50m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_WhenBothPayEqually_NoOneOwesAnyone()
    {
        // Arrange: Me paid $50, Partner paid $50
        var expenses = new List<Expense>
        {
            CreateExpense(50m, Payer.Me),
            CreateExpense(50m, Payer.Partner)
        };
        SetupRepositories(expenses, []);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.TotalPaidByMe.Should().Be(50m);
        result.TotalPaidByPartner.Should().Be(50m);
        result.Total.Should().Be(100m);
        result.NetOwedToMe.Should().Be(0m);
        result.NetOwedToPartner.Should().Be(0m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_MultipleExpenses_CalculatesCorrectNet()
    {
        // Arrange: Me paid $80 + $20 = $100, Partner paid $60
        // Total = $160, fair share = $80
        // Me overpaid by $20, so Partner owes Me $20
        var expenses = new List<Expense>
        {
            CreateExpense(80m, Payer.Me),
            CreateExpense(20m, Payer.Me),
            CreateExpense(60m, Payer.Partner)
        };
        SetupRepositories(expenses, []);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.TotalPaidByMe.Should().Be(100m);
        result.TotalPaidByPartner.Should().Be(60m);
        result.Total.Should().Be(160m);
        result.NetOwedToMe.Should().Be(20m);
        result.NetOwedToPartner.Should().Be(0m);
    }

    #endregion

    #region Net Balance Calculations - With Settlements

    [Fact]
    public async Task GetCurrentMonthSummary_SettlementFromPartnerToMe_ReducesWhatPartnerOwes()
    {
        // Arrange: Me paid $100 (Partner owes me $50)
        // Then Partner settles $30 to Me
        // Net: Partner still owes me $20
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me)
        };
        var settlements = new List<Settlement>
        {
            CreateSettlement(30m, Payer.Partner, Payer.Me)
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.NetOwedToMe.Should().Be(20m);
        result.NetOwedToPartner.Should().Be(0m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_SettlementFromMeToPartner_ReducesWhatIOwe()
    {
        // Arrange: Partner paid $100 (I owe Partner $50)
        // Then I settle $30 to Partner
        // Net: I still owe Partner $20
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Partner)
        };
        var settlements = new List<Settlement>
        {
            CreateSettlement(30m, Payer.Me, Payer.Partner)
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.NetOwedToMe.Should().Be(0m);
        result.NetOwedToPartner.Should().Be(20m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_ExactSettlement_ZerosOutBalance()
    {
        // Arrange: Me paid $100 (Partner owes me $50)
        // Partner settles exactly $50
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me)
        };
        var settlements = new List<Settlement>
        {
            CreateSettlement(50m, Payer.Partner, Payer.Me)
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.NetOwedToMe.Should().Be(0m);
        result.NetOwedToPartner.Should().Be(0m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_OverSettlement_FlipsWhoOwesWhom()
    {
        // Arrange: Me paid $100 (Partner owes me $50)
        // Partner settles $80 (overpays by $30)
        // Net: I now owe Partner $30
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me)
        };
        var settlements = new List<Settlement>
        {
            CreateSettlement(80m, Payer.Partner, Payer.Me)
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.NetOwedToMe.Should().Be(0m);
        result.NetOwedToPartner.Should().Be(30m);
    }

    #endregion

    #region Activity Cycle Detection

    [Fact]
    public async Task GetCurrentMonthSummary_NoExpensesOrSettlements_ReturnsEmptyCycles()
    {
        // Arrange
        SetupRepositories([], []);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.RecentActivityCycles.Should().BeEmpty();
    }

    [Fact]
    public async Task GetCurrentMonthSummary_SingleExpense_CreatesOpenCycle()
    {
        // Arrange
        var now = DateTime.UtcNow;
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me, now)
        };
        SetupRepositories(expenses, []);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.RecentActivityCycles.Should().HaveCount(1);
        var cycle = result.RecentActivityCycles[0];
        cycle.IsSettled.Should().BeFalse();
        cycle.SettledAtUtc.Should().BeNull();
        cycle.Items.Should().HaveCount(1);
        cycle.Items[0].Type.Should().Be(ActivityItemType.Expense);
        cycle.Items[0].NetAfterThisItem.Should().Be(50m); // Partner owes me $50 (half of $100)
    }

    [Fact]
    public async Task GetCurrentMonthSummary_ExpenseAndExactSettlement_CreatesSettledCycle()
    {
        // Arrange: Me pays $100, then Partner settles $50
        var baseTime = DateTime.UtcNow;
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me, baseTime)
        };
        var settlements = new List<Settlement>
        {
            CreateSettlement(50m, Payer.Partner, Payer.Me, baseTime.AddMinutes(1))
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.RecentActivityCycles.Should().HaveCount(1);
        var cycle = result.RecentActivityCycles[0];
        cycle.IsSettled.Should().BeTrue();
        cycle.SettledAtUtc.Should().NotBeNull();
        cycle.Items.Should().HaveCount(2);

        // First item: expense, net = +50 (Partner owes me)
        cycle.Items[0].Type.Should().Be(ActivityItemType.Expense);
        cycle.Items[0].NetAfterThisItem.Should().Be(50m);

        // Second item: settlement, net = 0 (settled)
        cycle.Items[1].Type.Should().Be(ActivityItemType.Settlement);
        cycle.Items[1].NetAfterThisItem.Should().Be(0m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_MultipleCycles_DetectsEachCycleCorrectly()
    {
        // Arrange:
        // Cycle 1: Me pays $100, Partner settles $50 (settled)
        // Cycle 2: Partner pays $80, Me settles $40 (settled)
        // Cycle 3: Me pays $60 (open)
        var baseTime = DateTime.UtcNow;
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me, baseTime),
            CreateExpense(80m, Payer.Partner, baseTime.AddMinutes(10)),
            CreateExpense(60m, Payer.Me, baseTime.AddMinutes(20))
        };
        var settlements = new List<Settlement>
        {
            CreateSettlement(50m, Payer.Partner, Payer.Me, baseTime.AddMinutes(5)),
            CreateSettlement(40m, Payer.Me, Payer.Partner, baseTime.AddMinutes(15))
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.RecentActivityCycles.Should().HaveCount(3);

        // Cycle 1: settled
        result.RecentActivityCycles[0].IsSettled.Should().BeTrue();
        result.RecentActivityCycles[0].Items.Should().HaveCount(2);

        // Cycle 2: settled
        result.RecentActivityCycles[1].IsSettled.Should().BeTrue();
        result.RecentActivityCycles[1].Items.Should().HaveCount(2);

        // Cycle 3: open
        result.RecentActivityCycles[2].IsSettled.Should().BeFalse();
        result.RecentActivityCycles[2].Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_ActivityItems_TrackRunningNetCorrectly()
    {
        // Arrange: Me $100, Partner $60, Partner settles $20
        // Net progression: +50, +50-30=+20, +20-20=0
        var baseTime = DateTime.UtcNow;
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me, baseTime),
            CreateExpense(60m, Payer.Partner, baseTime.AddMinutes(1))
        };
        var settlements = new List<Settlement>
        {
            CreateSettlement(20m, Payer.Partner, Payer.Me, baseTime.AddMinutes(2))
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.RecentActivityCycles.Should().HaveCount(1);
        var items = result.RecentActivityCycles[0].Items;

        items[0].NetAfterThisItem.Should().Be(50m);  // Me paid $100 -> Partner owes me $50
        items[1].NetAfterThisItem.Should().Be(20m);  // Partner paid $60 -> I owe $30, net = 50-30 = 20
        items[2].NetAfterThisItem.Should().Be(0m);   // Partner settles $20 -> net = 0
    }

    #endregion

    #region Edge Cases

    [Fact]
    public async Task GetCurrentMonthSummary_SmallAmounts_HandlesDecimalPrecisionCorrectly()
    {
        // Arrange: Test with small amounts and odd numbers
        var expenses = new List<Expense>
        {
            CreateExpense(0.01m, Payer.Me),
            CreateExpense(0.03m, Payer.Partner)
        };
        SetupRepositories(expenses, []);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert
        result.Total.Should().Be(0.04m);
        // Fair share = 0.02 each
        // Me paid 0.01, underpaid by 0.01
        // Partner paid 0.03, overpaid by 0.01
        // So I owe Partner 0.01
        result.NetOwedToPartner.Should().Be(0.01m);
        result.NetOwedToMe.Should().Be(0m);
    }

    [Fact]
    public async Task GetCurrentMonthSummary_NearZeroBalance_TreatsAsSettled()
    {
        // Arrange: Create a balance that ends up very close to 0 (within 0.01 tolerance)
        var baseTime = DateTime.UtcNow;
        var expenses = new List<Expense>
        {
            CreateExpense(100m, Payer.Me, baseTime)
        };
        var settlements = new List<Settlement>
        {
            // Settle 49.995 - this should result in net of 0.005 which is < 0.01 threshold
            CreateSettlement(49.995m, Payer.Partner, Payer.Me, baseTime.AddMinutes(1))
        };
        SetupRepositories(expenses, settlements);

        // Act
        var result = await _sut.GetCurrentMonthSummaryAsync(CancellationToken.None);

        // Assert - The cycle should be marked as settled since net is within threshold
        result.RecentActivityCycles.Should().HaveCount(1);
        result.RecentActivityCycles[0].IsSettled.Should().BeTrue();
    }

    #endregion

    #region Helper Methods

    private static Expense CreateExpense(decimal amount, Payer paidBy, DateTime? createdAt = null)
    {
        return new Expense(
            id: Guid.NewGuid(),
            householdId: HouseholdConstants.DemoHouseholdId,
            amount: amount,
            description: "Test expense",
            date: DateOnly.FromDateTime(DateTime.UtcNow),
            paidBy: paidBy,
            createdAtUtc: createdAt ?? DateTime.UtcNow);
    }

    private static Settlement CreateSettlement(decimal amount, Payer from, Payer to, DateTime? createdAt = null)
    {
        return new Settlement(
            Id: Guid.NewGuid(),
            HouseholdId: HouseholdConstants.DemoHouseholdId,
            Date: DateOnly.FromDateTime(DateTime.UtcNow),
            From: from,
            To: to,
            Amount: amount,
            Note: null,
            CreatedAtUtc: createdAt ?? DateTime.UtcNow);
    }

    private void SetupRepositories(List<Expense> expenses, List<Settlement> settlements)
    {
        _expenseRepository
            .GetByHouseholdAndMonthAsync(
                Arg.Any<Guid>(),
                Arg.Any<int>(),
                Arg.Any<int>(),
                Arg.Any<CancellationToken>())
            .Returns(expenses);

        _settlementRepository
            .GetByHouseholdAsync(
                Arg.Any<Guid>(),
                Arg.Any<CancellationToken>())
            .Returns(settlements);
    }

    #endregion
}
