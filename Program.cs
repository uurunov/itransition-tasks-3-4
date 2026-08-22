using System.Numerics;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.MapGet("/app/uurunov_dev_gmail_com", (string? x, string? y) =>
{
    if (x != null && y != null)
    {
        string regexPattern = @"^[0-9]+$";

        bool isXValid = Regex.Match(x, regexPattern).Success;
        bool isYValid = Regex.Match(y, regexPattern).Success;

        if (isXValid && isYValid && BigInteger.TryParse(x, out BigInteger resultX) && resultX > 0 && BigInteger.TryParse(y, out BigInteger resultY) && resultY > 0)
        {
            return $"{resultX / BigInteger.GreatestCommonDivisor(resultX, resultY) * resultY}";
        }
    }

    return "NaN";
});

app.MapGet("/test-email", async (IConfiguration config, IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Add("api-key", config["Email:BrevoApiKey"]);

    var payload = new
    {
        sender = new { name = "Test", email = config["Email:FromAddress"] },
        to = new[] { new { email = "ulugbekurunov1997@gmail.com" } },
        subject = "Somee + Brevo API test",
        htmlContent = "<p>If you see this, the Brevo HTTP API works from Somee.</p>"
    };

    try
    {
        var response = await client.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", payload);
        var body = await response.Content.ReadAsStringAsync();
        return $"Status: {response.StatusCode}, Body: {body}";
    }
    catch (Exception ex)
    {
        return $"Failed: {ex.Message}";
    }
});

app.Run();
