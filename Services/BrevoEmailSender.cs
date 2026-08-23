using System.Net.Http.Json;
namespace UurunovApp.Services;

public class BrevoEmailSender : IEmailSender
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public BrevoEmailSender(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("api-key", _configuration["Email:BrevoApiKey"]);

        var payload = new
        {
            sender = new { name = "UurunovApp", email = _configuration["Email:FromAddress"] },
            to = new[] { new { email = toEmail } },
            subject = subject,
            htmlContent = htmlContent
        };

        var response = await client.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", payload);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Email send failed: {response.StatusCode} - {body}");
        }
    }
}