using System;

namespace Web
{
    public class AppException : Exception
    {
        public AppException(string message, Exception innerException = null) : base(message, innerException: innerException){ }
    }
    
    public class NotFoundException: AppException
    {
        public NotFoundException(string message) : base(message) {}
    }
    
    public class DuplicateException: AppException
    {
        public DuplicateException(string message) : base(message) {}
    }
    
    
}