using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using UurunovApp.Models;
using UurunovApp.Models.Dtos;
using UurunovApp.Services;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace UurunovApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    private readonly SignInManager<ApplicationUser> _signInManager;
    public AuthController(UserManager<ApplicationUser> userManager, IEmailSender emailSender, IConfiguration configuration, SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _emailSender = emailSender;
        _configuration = configuration;
        _signInManager = signInManager;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        if (user.Status == UserStatus.Blocked)
        {
            return Unauthorized(new { message = "Your account is blocked. Please contact support." });
        }

        var result = await _signInManager.PasswordSignInAsync(user, request.Password, isPersistent: true, lockoutOnFailure: false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        user.LastLoginTime = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
        
        return Ok(new { user!.Name, user.Email, user.Status });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var frontendBaseUrl = _configuration["App:FrontendBaseUrl"];
        var confirmationLink = $"{frontendBaseUrl}/email-confirmation?userId={user.Id}&token={encodedToken}";

        _ = _emailSender.SendEmailAsync(user.Email!, "Confirm your email", $"<p>Please confirm your account by clicking <a href=\"{confirmationLink}\">here</a>.</p>");

        return Ok(new { message = "User registered successfully. Please check your email to confirm your account." });
    }

    [AllowAnonymous]
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null) return BadRequest(new { message = "Invalid confirmation link." });

        string decodedToken;
        try
        {
            decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch
        {
            return BadRequest(new { message = "Invalid or malformed confirmation link." });
        }

        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
        if (!result.Succeeded) return BadRequest(new { message = "Confirmation failed. The link may have expired." });

        if (user.Status != UserStatus.Blocked)
        {
            user.Status = UserStatus.Active;
            await _userManager.UpdateAsync(user);
        }

        return Ok(new { message = "Email confirmed successfully." });
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        return Ok(new { user!.Name, user.Email, user.Status });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Logged out successfully." });
    }
}