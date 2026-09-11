using Skill_Bridge_API.Models.DTOs.Auth;

namespace Skill_Bridge_API.Repository.Interfaces
{
    public interface IAccountRepository
    {
        Task<UserDTO?> GetUserByEmail(string email);
        Task<int> RegisterUser(RegisterRequestDTO request);
    }
}
