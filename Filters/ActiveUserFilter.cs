using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using UurunovApp.Models;

namespace UurunovApp.Filters;

public class ActiveUserFilter : IAsyncActionFilter
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public ActiveUserFilter(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var endpoint = context.HttpContext.GetEndpoint();
        
        if (endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>() != null)
        {
            await next();
            return;
        }

        if (context.HttpContext.User.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Not authenticated." });
            return;
        }

        var user = await _userManager.GetUserAsync(context.HttpContext.User);

        if (user == null || user.Status == UserStatus.Blocked)
        {
            await _signInManager.SignOutAsync();
            context.Result = new UnauthorizedObjectResult(new { message = "Your account no longer has access."});
            return;
        }

        await next();
    }
}