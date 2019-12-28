using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Web.Models;
using Web.Services;
using Web.ViewModels;
using WebCoreApp;

namespace Web.Controllers
{
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly AppSettings _appSettings;

        public UserController(
            IUserService userService,
            IOptions<AppSettings> appSettings)
        {
            _userService = userService;
            _appSettings = appSettings.Value;
        }

        [HttpPost]
        [Route("/api/v1/user/login")]
        public async Task<LoginRespondViewModel> Login([FromBody]LoginViewModel viewModel)
        {
            // IdentityModelEventSource.ShowPII = true;
            User user;
            try
            {
                user = await _userService.Login(viewModel.Email, viewModel.Password);
            }
            catch (AppException e)
            {
                throw new AppRequestException("The email or password are incorrect", e);
            }

            var tokenString = GetToken(user.Id);

            return new LoginRespondViewModel(tokenString);
        }

        private string GetToken(string userId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, userId)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials =
                    new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            return tokenString;
        }

        [Route("/api/v1/user/register")]
        [HttpPost]
        public async Task<RegisterRespondViewModel> Register([FromBody]RegisterViewModel viewModel)
        {
            var user = new User { Email = viewModel.Email };

            try
            {
                user = await _userService.Create(user, viewModel.Password);
            }
            catch (DuplicateUserException e)
            {
                throw new AppRequestException("The email already taken", e);
            }
            
            var token = GetToken(user.Id);
            return new RegisterRespondViewModel(token);
        }
    }
}