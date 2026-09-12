namespace Skill_Bridge_API.Models.DTOs.Student
{
    public class StudentProfileDTO
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        // Students table
        public int StudentId { get; set; }
        public int? CollegeId { get; set; }
        public int? DepartmentId { get; set; }
        public string? RollNo { get; set; }
        public int? GraduationYear { get; set; }
        public decimal? CGPA { get; set; }
        public int? CareerGoalId { get; set; }
        public string? ResumeUrl { get; set; }
        public string? GithubUrl { get; set; }
        public string? LinkedInUrl { get; set; }
    }
}
