using Skill_Bridge_API.Models.DTOs.Auth;
using Skill_Bridge_API.Models.DTOs.Shared;

namespace Skill_Bridge_API.Services.Interfaces
{
    public interface IAccountService
    {
        Task<ApiResponseDTO<LoginResponseDTO>> LoginAsync(LoginRequestDTO data);
        Task<ApiResponseDTO<object>> RegisterAsync(RegisterRequestDTO dto);

    }
}
