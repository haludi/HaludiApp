using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Raven.Client.Documents;
using Raven.Client.Documents.Session;
using Raven.Client.ServerWide.Operations.Certificates;

namespace WebCoreApp
{
    public class Settings
    {
        public DatabaseSettings Database { get; set; }
        public AppSettings AppSettings { get; set; }
    }
    
    public class DatabaseSettings
    {
        public string[] Urls { get; set; }
        public string DatabaseName { get; set; }
        public string CertificatePath { get; set; }
        public string CertificatePassword { get; set; }
    }
    
    public class AppSettings
    {
        public string Secret { get; set; }
    }
}
