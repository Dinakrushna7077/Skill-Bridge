using Skill_Bridge_API.Models.DTOs.Shared;
using Skill_Bridge_API.Models.DTOs.Student;
using Skill_Bridge_API.Repository.Interfaces;
using Skill_Bridge_API.Services.Interfaces;

namespace Skill_Bridge_API.Services
{
    public class StudentService:IStudentService
    {
        private readonly IStudentRepository _repo;

        public StudentService(IStudentRepository repo)
        {
            _repo = repo;
        }

        public async Task<ApiResponseDTO<StudentProfileDTO>> GetStudentProfileAsync(int userId)
        {
            var profile = await _repo.GetStudentProfile(userId);

            if (profile == null)
            {
                return new ApiResponseDTO<StudentProfileDTO>
                {
                    Success = false,
                    Message = "Student profile not found",
                    Data = null
                };
            }

            return new ApiResponseDTO<StudentProfileDTO>
            {
                Success = true,
                Message = "Student profile fetched successfully",
                Data = profile
            };
        }

        public async Task<ApiResponseDTO<object>> UpdateStudentProfileAsync(StudentProfileUpdateDTO dto)
        {
            int result = await _repo.UpdateStudentProfile(dto);

            if (result <= 0)
            {
                return new ApiResponseDTO<object>
                {
                    Success = false,
                    Message = "Unable to update student profile"
                };
            }

            return new ApiResponseDTO<object>
            {
                Success = true,
                Message = "Student profile updated successfully"
            };
        }
        public async Task<ApiResponseDTO<IEnumerable<StudentSkillsDTO>>>GetStudentSkillsAsync(int userId)
        {
            var skills = await _repo.GetStudentSkills(userId);

            return new ApiResponseDTO<IEnumerable<StudentSkillsDTO>>
            {
                Success = true,
                Message = "Student skills fetched successfully",
                Data = skills
            };
        }
        public async Task<ApiResponseDTO<object>>AddStudentSkillAsync(StudentSkillRequestDTO dto)
        {
            if (dto.Proficiency < 1 || dto.Proficiency > 5)
            {
                return new ApiResponseDTO<object>
                {
                    Success = false,
                    Message = "Proficiency must be between 1 and 5"
                };
            }

            int result = await _repo.AddStudentSkill(dto);

            if (result <= 0)
            {
                return new ApiResponseDTO<object>
                {
                    Success = false,
                    Message = "Unable to add skill"
                };
            }

            return new ApiResponseDTO<object>
            {
                Success = true,
                Message = "Skill added successfully"
            };
        }
        public async Task<ApiResponseDTO<object>>UpdateStudentSkillAsync(StudentSkillRequestDTO dto)
        {
            if (dto.Proficiency < 1 || dto.Proficiency > 5)
            {
                return new ApiResponseDTO<object>
                {
                    Success = false,
                    Message = "Proficiency must be between 1 and 5"
                };
            }

            int result = await _repo.UpdateStudentSkill(dto);

            if (result <= 0)
            {
                return new ApiResponseDTO<object>
                {
                    Success = false,
                    Message = "Skill not found"
                };
            }

            return new ApiResponseDTO<object>
            {
                Success = true,
                Message = "Skill updated successfully"
            };
        }
        public async Task<ApiResponseDTO<object>>DeleteStudentSkillAsync(int userId,int skillId)
        {
            int result = await _repo.DeleteStudentSkill(userId,skillId);

            if (result <= 0)
            {
                return new ApiResponseDTO<object>
                {
                    Success = false,
                    Message = "Skill not found"
                };
            }

            return new ApiResponseDTO<object>
            {
                Success = true,
                Message = "Skill deleted successfully"
            };
        }

    }
}
