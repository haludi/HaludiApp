using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class LoginViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
    
    public class LoginRespondViewModel
    {
        public string Token { get;}

        public LoginRespondViewModel(string token)
        {
            Token = token;
        }
    }
}