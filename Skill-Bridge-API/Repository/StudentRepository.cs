using Dapper;
using Skill_Bridge_API.Data;
using Skill_Bridge_API.Models.DTOs.Student;
using Skill_Bridge_API.Repository.Interfaces;
using System.Data;

namespace Skill_Bridge_API.Repository
{
    public class StudentRepository:DapperContext, IStudentRepository
    {
        public StudentRepository(IConfiguration configuration) : base(configuration){}

        public async Task<StudentProfileDTO?>GetStudentProfile(int uid)
        {
            var con = GetConnection();
            DynamicParameters param = new DynamicParameters();
            param.Add("@action", "GetProfile");
            param.Add("@userId", uid);

            return await con.QueryFirstOrDefaultAsync<StudentProfileDTO>("Student",param,commandType: CommandType.StoredProcedure);
        }
        public async Task<int> UpdateStudentProfile(StudentProfileUpdateDTO dto)
        {
            var con = GetConnection();
            DynamicParameters param=new DynamicParameters();
            param.Add("@action", "UpdateProfile");
            param.Add("@userId", dto.UserId);

            param.Add("@name", dto.Name);
            param.Add("@phoneNumber", dto.PhoneNumber);

            param.Add("@collegeId", dto.CollegeId);
            param.Add("@deptId", dto.DepartmentId);
            param.Add("@rollNo", dto.RollNo);
            param.Add("@graduationYear", dto.GraduationYear);
            param.Add("@cgpa", dto.CGPA);
            param.Add("@careerGoalId", dto.CareerGoalId);
            param.Add("@resumeUrl", dto.ResumeUrl);
            param.Add("@githubUrl", dto.GithubUrl);
            param.Add("@linkedinUrl", dto.LinkedInUrl);
            int x= await con.ExecuteAsync("Student",param,commandType: CommandType.StoredProcedure);
            return await Task.FromResult(x);

        }

        public async Task<IEnumerable<StudentSkillsDTO>> GetStudentSkills(int userId)
        {
            using var con = GetConnection();

            DynamicParameters param = new DynamicParameters();

            param.Add("@action", "GetSkills");
            param.Add("@userId", userId);

            return await con.QueryAsync<StudentSkillsDTO>(
                "Student",
                param,
                commandType: CommandType.StoredProcedure
            );
        }
        public async Task<int> AddStudentSkill(StudentSkillRequestDTO dto)
        {
            using var con = GetConnection();

            DynamicParameters param = new DynamicParameters();

            param.Add("@action", "AddSkill");
            param.Add("@userId", dto.UserId);
            param.Add("@skillId", dto.SkillId);
            param.Add("@proficiency", dto.Proficiency);
            param.Add("@yearsExperience", dto.YearsExperience);

            return await con.ExecuteAsync(
                "Student",
                param,
                commandType: CommandType.StoredProcedure
            );
        }
        public async Task<int> UpdateStudentSkill(StudentSkillRequestDTO dto)
        {
            using var con = GetConnection();

            DynamicParameters param = new DynamicParameters();

            param.Add("@action", "UpdateSkill");
            param.Add("@userId", dto.UserId);
            param.Add("@skillId", dto.SkillId);
            param.Add("@proficiency", dto.Proficiency);
            param.Add("@yearsExperience", dto.YearsExperience);

            return await con.ExecuteAsync(
                "Student",
                param,
                commandType: CommandType.StoredProcedure
            );
        }
        public async Task<int> DeleteStudentSkill(int userId,int skillId)
        {
            using var con = GetConnection();

            DynamicParameters param = new DynamicParameters();

            param.Add("@action", "DeleteSkill");
            param.Add("@userId", userId);
            param.Add("@skillId", skillId);

            return await con.ExecuteAsync(
                "Student",
                param,
                commandType: CommandType.StoredProcedure
            );
        }
    }
}
