namespace Skill_Bridge_API.Models.DTOs.Shared
{
    public class ApiResponseDTO<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }
}
