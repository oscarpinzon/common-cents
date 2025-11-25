using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CommonCents.Api.Json;

public sealed class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    private const string Format = "yyyy-MM-dd";

    public override DateOnly Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new JsonException("Date value is null or empty.");
        }

        if (!DateOnly.TryParseExact(value, Format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
        {
            throw new JsonException($"Invalid date format. Expected {Format}.");
        }

        return date;
    }

    public override void Write(
        Utf8JsonWriter writer,
        DateOnly value,
        JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(Format, CultureInfo.InvariantCulture));
    }
}
