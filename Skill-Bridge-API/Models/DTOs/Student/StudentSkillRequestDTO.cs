namespace Skill_Bridge_API.Models.DTOs.Student
{
    public class StudentSkillRequestDTO
    {
        public int UserId { get; set; }
        public int SkillId { get; set; }
        public int Proficiency { get; set; }
        public decimal? YearsExperience { get; set; }
    }
}
