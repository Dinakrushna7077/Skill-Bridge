using Skill_Bridge_API.Models.DTOs.Auth;

namespace Skill_Bridge_API.Services.Interfaces
{
    public interface IAccountService
    {
        Task<(LoginResponseDTO Data, bool Success, string Message)> LoginAsync(LoginRequestDTO data);
        Task<(bool Success, string Message)> RegisterAsync(RegisterRequestDTO dto);

    }
}
