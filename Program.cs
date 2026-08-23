using System.Numerics;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using UurunovApp.Models;
using UurunovApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();
builder.Services.AddDataProtection();
builder.Services.AddIdentityCore<ApplicationUser>(options => {
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 1;
}).AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();
builder.Services.AddScoped<IEmailSender, BrevoEmailSender>();

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

app.MapControllers();
app.Run();