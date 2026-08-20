using System.Numerics;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);
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

app.Run();
