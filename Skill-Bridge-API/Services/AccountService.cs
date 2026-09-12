using Skill_Bridge_API.Repository.Interfaces;
using Skill_Bridge_API.Models.DTOs.Auth;
using Skill_Bridge_API.Services.Interfaces;
using Skill_Bridge_API.Models.DTOs.Shared;

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

        public async Task<ApiResponseDTO<LoginResponseDTO>> LoginAsync(LoginRequestDTO data)
        {
            ApiResponseDTO<LoginResponseDTO> apiResponse = new ApiResponseDTO<LoginResponseDTO>();
            var user = await _repo.GetUserByEmail(data.Email);
            if (user == null)
            {
                apiResponse.Message = "Invalid Email Id";
                return apiResponse;
            }
            if (!user.IsActive)
            {
                apiResponse.Message = "Your account is inactive";
                return apiResponse;
            }
            var isValidPass = BCrypt.Net.BCrypt.Verify(data.Password, user.PasswordHash);
            if (!isValidPass)
            {
                apiResponse.Message = "Invalid Password";
                return apiResponse;
            }
             var userData=new LoginResponseDTO()
             {
                 UserId = user.UserId,
                 Name = user.Name,
                 Email = user.Email,
                 Role = user.Role
             };
            userData.Token = _jwt.GenerateToken(userData);
            apiResponse.Data = userData;
            apiResponse.Success = true;
            apiResponse.Message = "Login Success";
            return apiResponse;
        }
        public async Task<ApiResponseDTO<object>> RegisterAsync(RegisterRequestDTO dto)
        {
            dto.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var user = await _repo.GetUserByEmail(dto.Email);
            ApiResponseDTO<object> response=new ApiResponseDTO<object>();
            if (user != null)
            {
                response.Message = "Email id already registered ! please login...";
                return response;
            }
            int n = await _repo.RegisterUser(dto);
            if (n <= 0)
            {
                response.Message = "Unable to Registered ! Please try again after some time...";
                return response;
            }
            response.Success = true;
            response.Message = "User Registered Successfully";
            return response;
        }
    }
}
