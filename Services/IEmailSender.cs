namespace UurunovApp.Services;

public interface IEmailSender
{
    Task SendEmailAsync(string toEmail, string subject, string htmlContent);
}