namespace UurunovApp.Models;

public enum UserStatus { Unverified, Active, Blocked }

public class ApplicationUser : Microsoft.AspNetCore.Identity.IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public UserStatus Status { get; set; } = UserStatus.Unverified;
    public DateTime? LastLoginTime { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}