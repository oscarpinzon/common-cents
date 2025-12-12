using CommonCents.Api.Contracts;
using CommonCents.Api.Contracts.Household;
using CommonCents.Api.Json;
using CommonCents.Application.Interfaces;
using CommonCents.Application.Services;
using CommonCents.Application.Models;
using CommonCents.Domain;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.OpenApi.Models;
using CommonCents.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<CommonCentsDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("DefaultConnection is not configured.");
    }

    options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IExpenseRepository, EfExpenseRepository>();
builder.Services.AddScoped<ISettlementRepository, EfSettlementRepository>();
builder.Services.AddScoped<IHouseholdLedgerService, HouseholdLedgerService>();

// JSON options
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.Converters.Add(new DateOnlyJsonConverter());
});

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CommonCents API", Version = "v1" });

    c.MapType<DateOnly>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "date"
    });

    c.SupportNonNullableReferenceTypes();
});

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
        IHouseholdLedgerService householdLedgerService,
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

        await householdLedgerService.AddExpenseAsync(
            amount: request.Amount,
            description: request.Description,
            date: request.Date,
            paidBy: payer,
            cancellationToken);

        return Results.Created("/api/household/expenses", null);
    })
    .Produces(StatusCodes.Status201Created)
    .Produces<ErrorResponse>(StatusCodes.Status400BadRequest);

app.MapPost("/api/household/settlements", async Task<IResult> (
        AddSettlementRequest request,
        IHouseholdLedgerService ledger,
        CancellationToken cancellationToken) =>
    {
        if (request.Amount <= 0)
        {
            return Results.BadRequest(new { error = "Amount must be greater than zero." });
        }

        if (!Enum.TryParse<Payer>(request.From, ignoreCase: true, out var from))
        {
            return Results.BadRequest(new { error = "From must be 'Me' or 'Partner'." });
        }

        if (!Enum.TryParse<Payer>(request.To, ignoreCase: true, out var to))
        {
            return Results.BadRequest(new { error = "To must be 'Me' or 'Partner'." });
        }

        await ledger.AddSettlementAsync(
            date: request.Date,
            from: from,
            to: to,
            amount: request.Amount,
            note: request.Note,
            cancellationToken);

        return Results.Ok();
    })
    .Produces(StatusCodes.Status201Created)
    .Produces<ErrorResponse>(StatusCodes.Status400BadRequest);

app.MapGet("/api/household/summary", async Task<HouseholdSummaryDto> (
    IHouseholdLedgerService householdLedgerService,
    CancellationToken cancellationToken) => await householdLedgerService.GetCurrentMonthSummaryAsync(cancellationToken));

app.Run();
