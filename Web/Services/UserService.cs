using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Raven.Client.Documents;
using Raven.Client.Documents.Operations.CompareExchange;
using Raven.Client.Documents.Session;
using Web.Models;

namespace Web.Services
{
    public interface IUserService
    {
        Task<User> Login(string email, string password);
        Task<IEnumerable<User>> GetAll();
        Task<User> GetById(string id);
        Task<User> Create(User user, string password);
        Task Update(User user, string password = null);
        Task Delete(string id);
    }

    public class UserService : IUserService
    {
        private readonly IDocumentStore _store;

        public UserService(IDocumentStore store)
        {
            _store = store;
        }

        public async Task<User> Login(string email, string password)
        {
            using var session = _store.OpenAsyncSession();
            var user = await session.Query<User>().SingleOrDefaultAsync(x => x.Email == email);
            if (user == null)
                throw new UserNotFoundException(email);

            if (false == VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                throw new PasswordIncorrectException();

            return user;
        }

        public async Task<IEnumerable<User>> GetAll()
        {
            using var session = _store.OpenAsyncSession();
            return await session.Query<User>().ToArrayAsync();
        }

        public async Task<User> GetById(string id)
        {
            using var session = _store.OpenAsyncSession();
            return await session.LoadAsync<User>(id);
        }

        public async Task<User> Create(User user, string password)
        {
            using var session = _store.OpenAsyncSession();

            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);

            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;

            await session.StoreAsync(user);
            
            var compareExchangeResult = _store.Operations.Send(new PutCompareExchangeValueOperation<string>(user.Email, user.Id, 0));
            if(false == compareExchangeResult.Successful)
                throw new DuplicateUserException("Username \"" + user.Email + "\" is already taken");
            
            await session.SaveChangesAsync();

            return user;
        }

        public async Task Update(User userParam, string password = null)
        {
            using var session = _store.OpenAsyncSession();

            var user = await session.LoadAsync<User>(userParam.Id);
            if (user == null)
                throw new NotFoundException("User not found");

            // update username if it has changed
            if (!string.IsNullOrWhiteSpace(userParam.Email) && userParam.Email != user.Email)
            {
                // throw error if the new username is already taken
                if (session.Query<User>().Any(x => x.Email == userParam.Email))
                    throw new DuplicateUserException(userParam.Email);
                    // throw new DuplicateUserException("Username " + userParam.Email + " is already taken");

                user.Email = userParam.Email;
            }

            // update password if provided
            if (!string.IsNullOrWhiteSpace(password))
            {
                byte[] passwordHash, passwordSalt;
                CreatePasswordHash(password, out passwordHash, out passwordSalt);

                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
            }

            await session.StoreAsync(user);
            await session.SaveChangesAsync();
        }

        public async Task Delete(string id)
        {
            using var session = _store.OpenAsyncSession();

            session.Delete(id);
            await session.SaveChangesAsync();
        }

        // private helper methods

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            if (password == null) throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");

            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        private static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            if (password == null) throw new ArgumentNullException("password");
            if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Value cannot be empty or whitespace only string.", "password");
            if (storedHash.Length != 64) throw new ArgumentException("Invalid length of password hash (64 bytes expected).", "passwordHash");
            if (storedSalt.Length != 128) throw new ArgumentException("Invalid length of password salt (128 bytes expected).", "passwordHash");

            using (var hmac = new System.Security.Cryptography.HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != storedHash[i]) return false;
                }
            }

            return true;
        }
    }

    public class UserNotFoundException : AppException
    {
        public UserNotFoundException(string email): base($"No user with Email {email} found") { }
    }
    
    public class PasswordIncorrectException : AppException
    {
        public PasswordIncorrectException(): base("Password is incorrect") { }
    }
    
    public class DuplicateUserException : AppException
    {
        public DuplicateUserException(string email): base($"The email {email} already in use") { }
    }
}