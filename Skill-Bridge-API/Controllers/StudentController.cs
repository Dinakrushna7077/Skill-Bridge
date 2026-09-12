using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Skill_Bridge_API.Models.DTOs.Student;
using Skill_Bridge_API.Services.Interfaces;
using System.Security.Claims;

namespace Skill_Bridge_API.Controllers
{
    [Route("api/student")]
    //[Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _service;
        public StudentController(IStudentService service)
        {
            _service = service;
        }
        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetStudentProfile(int userId)
        {
            var response = await _service.GetStudentProfileAsync(userId);

            if (!response.Success)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateStudentProfile(StudentProfileUpdateDTO dto)
        {

            var response = await _service.UpdateStudentProfileAsync(dto);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
        [HttpPost("skills")]
        public async Task<IActionResult> AddStudentSkill(StudentSkillRequestDTO dto)
        {
            var response = await _service.AddStudentSkillAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
        [HttpPut("skills")]
        public async Task<IActionResult> UpdateStudentSkill(StudentSkillRequestDTO dto)
        {
            var response = await _service.UpdateStudentSkillAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
        [HttpDelete("skills/{userId}/{skillId}")]
        public async Task<IActionResult> DeleteStudentSkill(int userId,int skillId)
        {
            var response = await _service.DeleteStudentSkillAsync(
                userId,
                skillId);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }
        [HttpGet("skills/{userId}")]
        public async Task<IActionResult> GetStudentSkills(int userId)
        {
            var response = await _service.GetStudentSkillsAsync(userId);

            return Ok(response);
        }
    }
}
