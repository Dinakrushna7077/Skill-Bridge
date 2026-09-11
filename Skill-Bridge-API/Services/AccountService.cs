

using Skill_Bridge_API.Repository.Interfaces;
using Skill_Bridge_API.Models.DTOs.Auth;
using Skill_Bridge_API.Services.Interfaces;

namespace Skill_Bridge_API.Services
{
    public class AccountService:IAccountService
    {
        private readonly IAccountRepository _repo;
        private readonly JwtService _jwt;
        public AccountService(IAccountRepository repo,JwtService jwt)
        {
            _repo = repo;
            _jwt=jwt;
        }

        public async Task<(LoginResponseDTO Data, bool Success, string Message)> LoginAsync(LoginRequestDTO data)
        {
            LoginResponseDTO response = new LoginResponseDTO();
            var user = await _repo.GetUserByEmail(data.Email);
            if (user == null)
            {
                return (response, false, "Invalid Email Id");
            }
            if (!user.IsActive)
            {
                return (response, false, "Your account is inactive");
            }
            var isValidPass = BCrypt.Net.BCrypt.Verify(data.Password, user.PasswordHash);
            if (!isValidPass)
            {
                return (response, false, "Invalid Password...");
            }
            return (new LoginResponseDTO()
            {
                Name = user.Name,
                Email = user.Email,
                UserId = user.UserId,
                Role = user.Role,
                Token=_jwt.GenerateToken(response)
            },
            true,
            "");
        }
        public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequestDTO dto)
        {
            dto.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var user = await _repo.GetUserByEmail(dto.Email);
            if (user != null)
            {
                return (false, "Email id already registered ! please login...");
            }
            int n = await _repo.RegisterUser(dto);
            if (n <= 0)
            {
                return (false, "Unable to Registered ! Please try again after some time...");
            }
            return (true, "User Registered Successfully");
        }
    }
}
