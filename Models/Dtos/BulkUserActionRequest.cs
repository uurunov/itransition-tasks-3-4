namespace UurunovApp.Models.Dtos;

public class BulkUserActionRequest
{
    public List<string> UserIds { get; set; } = new();
}