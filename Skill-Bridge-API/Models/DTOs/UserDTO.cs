namespace Skill_Bridge_API.Models.DTOs
{
    public class UserDTO
    {
        public string Token { get; set; } = string.Empty;
        public long UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
