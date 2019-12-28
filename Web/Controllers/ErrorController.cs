using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    [ApiController]
    public class ErrorController : ControllerBase
    {
        // [Route("/error-local-development")]
        // public IActionResult ErrorLocalDevelopment([FromServices] IWebHostEnvironment webHostEnvironment)
        // {
        //     var statusCode = StatusCodes.Status500InternalServerError;;
        //     var context = HttpContext.Features.Get<IExceptionHandlerFeature>();
        //
        //     if (context.Error is AppException)
        //     {
        //         if (context.Error is NotFoundException)
        //         {
        //             statusCode = StatusCodes.Status404NotFound;
        //         }
        //     }
        //     
        //     return Problem(
        //         detail: context.Error.StackTrace,
        //         title: context.Error.Message,
        //         statusCode: statusCode);
        // }

        [Route("/error")]
        public IActionResult Error()
        {
            var statusCode = StatusCodes.Status500InternalServerError;;
            string message = null;
                
            var context = HttpContext.Features.Get<IExceptionHandlerFeature>();
            if (context.Error is AppRequestException appException)
            {
                if (context.Error is AppRequestNotFoundException)
                {
                    statusCode = StatusCodes.Status404NotFound;
                }
                message = appException.Message;
            }
            
            return Problem(detail: message, statusCode: statusCode);
        }
    }
    
    // public class AppExceptionFilter : IActionFilter, IOrderedFilter
    // {
    //     public int Order { get; set; } = int.MaxValue - 10;
    //
    //     public void OnActionExecuting(ActionExecutingContext context) { }
    //
    //     public void OnActionExecuted(ActionExecutedContext context)
    //     {
    //         
    //     }
    // }
    
    public class AppRequestException : AppException
    {
        public AppRequestException(string message, AppException innerException) : base(message, innerException)
        {
        }
    }
    
    public class AppRequestNotFoundException : AppRequestException
    {
        public AppRequestNotFoundException(string message, AppException innerException) : base(message, innerException)
        {
        }
    }
}