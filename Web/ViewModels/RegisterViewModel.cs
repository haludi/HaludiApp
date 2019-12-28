using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class RegisterViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
    
    public class RegisterRespondViewModel
    {
        public string Token { get;}

        public RegisterRespondViewModel(string token)
        {
            Token = token;
        }
    }
}