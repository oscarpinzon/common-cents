using CommonCents.Api.Contracts.Household;
using CommonCents.Application.Interfaces;
using CommonCents.Application.Services;
using CommonCents.Application.Models;
using CommonCents.Domain;
using CommonCents.Infrastructure.InMemory;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IExpenseRepository, InMemoryExpenseRepository>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/household/expenses", async (
    AddExpenseRequest request,
    IExpenseService expenseService,
    CancellationToken cancellationToken) =>
{
    if (request.Amount <= 0)
    {
        return Results.BadRequest(new { error = "Amount must be greater than zero." });
    }

    if (!Enum.TryParse<Payer>(request.PaidBy, ignoreCase: true, out var payer))
    {
        return Results.BadRequest(new { error = "PaidBy must be 'Me' or 'Partner'." });
    }

    await expenseService.AddExpenseAsync(
        amount: request.Amount,
        description: request.Description,
        date: request.Date,
        paidBy: payer,
        cancellationToken);

    return Results.Created("/api/household/expenses", null);
});

// Get current month summary
app.MapGet("/api/household/summary", async (
    IExpenseService expenseService,
    CancellationToken cancellationToken) =>
{
    var summary = await expenseService.GetCurrentMonthSummaryAsync(cancellationToken);
    return Results.Ok(summary);
});

app.Run();
