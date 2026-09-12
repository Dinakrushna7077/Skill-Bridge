using Skill_Bridge_API.Models.DTOs.Shared;
using Skill_Bridge_API.Models.DTOs.Student;

namespace Skill_Bridge_API.Services.Interfaces
{
    public interface IStudentService
    {
        Task<ApiResponseDTO<StudentProfileDTO>> GetStudentProfileAsync(int userId);

        Task<ApiResponseDTO<object>> UpdateStudentProfileAsync(StudentProfileUpdateDTO dto);
        Task<ApiResponseDTO<IEnumerable<StudentSkillsDTO>>>GetStudentSkillsAsync(int userId);

        Task<ApiResponseDTO<object>>AddStudentSkillAsync(StudentSkillRequestDTO dto);

        Task<ApiResponseDTO<object>>UpdateStudentSkillAsync(StudentSkillRequestDTO dto);

        Task<ApiResponseDTO<object>>DeleteStudentSkillAsync(int userId,int skillId);
    }
}
