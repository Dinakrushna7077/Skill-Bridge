namespace Skill_Bridge_API.Models.DTOs.Student
{
    public class StudentSkillsDTO
    {
        public int StudentSkillId { get; set; }
        public int SkillId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int Proficiency { get; set; }
        public decimal? YearsExperience { get; set; }
        public string Source { get; set; } = string.Empty;
        public bool Verified { get; set; }
    }
}
