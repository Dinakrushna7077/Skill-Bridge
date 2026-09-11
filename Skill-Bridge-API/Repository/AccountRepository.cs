using Dapper;
using Skill_Bridge_API.Data;
using Skill_Bridge_API.Models.DTOs.Auth;
using Skill_Bridge_API.Repository.Interfaces;
using System.Data;

namespace Skill_Bridge_API.Repository
{
    public class AccountRepository : DapperContext, IAccountRepository
    {
        public AccountRepository(IConfiguration config) : base(config) { }
        public async Task<UserDTO?> GetUserByEmail(string email)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();

                param.Add("@action", "GetUser");
                param.Add("@email", email);
                var con = GetConnection();
                return await con.QueryFirstOrDefaultAsync<UserDTO>("Account", param, commandType: CommandType.StoredProcedure);
            }
            catch
            {
                return new UserDTO();
            }
        }

        public async Task<int> RegisterUser(RegisterRequestDTO request)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();

                param.Add("@action", "Register");
                param.Add("@name", request.Name);
                param.Add("@email", request.Email);
                param.Add("@phoneNumber", request.PhoneNumber);
                param.Add("@passwordHash", request.Password);
                param.Add("@role", request.Role);
                var con = GetConnection();
                int x = await con.ExecuteAsync("Account", param, commandType: CommandType.StoredProcedure);
                return await Task.FromResult(x);
            }
            catch
            {
                return -10;
            }
        }
    }
}
