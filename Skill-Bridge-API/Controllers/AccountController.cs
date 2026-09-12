using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Skill_Bridge_API.Models.DTOs.Auth;
using Skill_Bridge_API.Services.Interfaces;

namespace Skill_Bridge_API.Controllers
{
    [Route("api/auth")]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _service;

        public AccountController(IAccountService service)
        {
            _service = service;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDTO data)
        {
            var response = await _service.LoginAsync(data);
            if (!response.Success)
            {
                return Unauthorized(response);
            }
            return Ok(response);
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDTO dto)
        {
            var response = await _service.RegisterAsync(dto);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}
