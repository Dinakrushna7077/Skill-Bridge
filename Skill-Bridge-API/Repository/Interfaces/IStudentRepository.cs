using Skill_Bridge_API.Models.DTOs.Student;

namespace Skill_Bridge_API.Repository.Interfaces
{
    public interface IStudentRepository
    {
        Task<int> UpdateStudentProfile(StudentProfileUpdateDTO dto);
        Task<StudentProfileDTO?> GetStudentProfile(int uid);
        Task<IEnumerable<StudentSkillsDTO>> GetStudentSkills(int userId);

        Task<int> AddStudentSkill(StudentSkillRequestDTO dto);

        Task<int> UpdateStudentSkill(StudentSkillRequestDTO dto);

        Task<int> DeleteStudentSkill(int userId,int skillId);
    }
}
