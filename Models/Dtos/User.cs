namespace UurunovApp.Models.Dtos;
public class UserDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public DateTime? LastLoginTime { get; set; }
    public DateTime? CreatedAt { get; set; }
    public required UserStatus Status { get; set; }
}