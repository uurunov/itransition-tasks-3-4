using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UurunovApp.Models.Dtos;
using UurunovApp.Models;
using Microsoft.Identity.Client;

namespace UurunovApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
      private readonly SignInManager<ApplicationUser> _signInManager;

    public UserController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
    {
        this._userManager = userManager;
        this._signInManager = signInManager;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? search)
    {
        var query = _userManager.Users;

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.Email!.Contains(search));
        }

        var sortedQuery = query.OrderByDescending(u => u.LastLoginTime);

        var users = await sortedQuery.Select(u => new UserDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email!,
            LastLoginTime = u.LastLoginTime,
            CreatedAt = u.CreatedAt,
            Status = u.Status
        })
        .ToListAsync();
        return Ok(users);
    }

    [HttpPost("block")]
    public async Task<IActionResult> BlockUsers([FromBody] BulkUserActionRequest request)
    {
        await _userManager.Users.Where(u => request.UserIds.Contains(u.Id)).ExecuteUpdateAsync(setter => setter.SetProperty(user => user.Status, UserStatus.Blocked));
        return Ok(new { message = "Successfully blocked users."});
    }

    [HttpPost("unblock")]
    public async Task<IActionResult> UnblockUsers([FromBody] BulkUserActionRequest request)
    {
        await _userManager.Users.Where(u => request.UserIds.Contains(u.Id)).ExecuteUpdateAsync(setter => setter.SetProperty(user => user.Status, user => user.EmailConfirmed ? UserStatus.Active : UserStatus.Unverified));
        return Ok(new { message = "Successfully unblocked users."});
    }

    [HttpPost("delete")]
    public async Task<IActionResult> DeleteUsers([FromBody] BulkUserActionRequest request)
    {
        var currentUserId = _userManager.GetUserId(User);
        await _userManager.Users.Where(u => request.UserIds.Contains(u.Id)).ExecuteDeleteAsync();

        if (currentUserId != null && request.UserIds.Contains(currentUserId))
        {
            await _signInManager.SignOutAsync();
        }

        return Ok(new { message = "Successfully deleted users."});
    }

    [HttpPost("delete-unverified")]
    public async Task<IActionResult> DeleteUsersUnverified()
    {
        var currentUser = await _userManager.GetUserAsync(User);
        await _userManager.Users.Where(u => u.Status == UserStatus.Unverified).ExecuteDeleteAsync();

        if (currentUser != null && currentUser.Status == UserStatus.Unverified)
        {
            await _signInManager.SignOutAsync();
        }

        return Ok(new { message = "Successfully deleted users with status UNVERIFIED."});
    }
}