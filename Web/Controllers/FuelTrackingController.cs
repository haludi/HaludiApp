using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Raven.Client.Documents;
using Raven.Client.Documents.Attachments;
using Raven.Client.Documents.Operations;
using Raven.Client.Documents.Operations.Attachments;
using Web.Models;

namespace Web.Controllers
{
    [Authorize]
    [ApiController]
    public class FuelTrackingController : Controller
    {
        private readonly IDocumentStore _store;
        private readonly ILogger<FuelTrackingController> _logger;

        public FuelTrackingController(IDocumentStore store, ILogger<FuelTrackingController> logger)
        {
            _store = store;
            _logger = logger;
        }

        [Route("/fueltracking/first-step")]
        [HttpGet]
        public async Task<IEnumerable<FuelTrackingRecord>> Get(int? pageNo, int? pageSize)
        {
            using var session = _store.OpenAsyncSession();
            var query = session.Query<FuelTrackingRecord>()
                .Where(r => r.Id == User.Identity.Name && (r.Mileage == null || r.FuelFilled == null || r.Cost == null));

            if (pageNo.HasValue && pageSize.HasValue)
            {
                query = query
                    .Skip(pageNo.Value * pageSize.Value)
                    .Take(pageSize.Value);
            }

            var records = await query.ToArrayAsync();
            return records;
        }
        
        [Route("/api/v1/FuelTrackingRecords/{id}/image/{imageOf}")]
        [HttpGet]
        public async Task<Stream> GetImageOf(string id, string imageOf)
        {
            using var session = _store.OpenAsyncSession();
            var isBelongToUser = await session.Query<FuelTrackingRecord>().AnyAsync(r => r.Id == id && r.UserId == User.Identity.Name);
            if(false == isBelongToUser)
                throw new UnauthorizedRequestException();
            
            var image = await _store.Operations.SendAsync(new GetAttachmentOperation($"FuelTrackingRecords/{id}",
                imageOf,
                AttachmentType.Document,
                changeVector: null));
            
            return image.Stream;
        }
        
        [HttpPost]
        [Route("/api/v1/fuel-tracking/take-photos")]
        public async Task<FuelTrackingRecord> Post(IFormCollection form)
        {
            using var session = _store.OpenAsyncSession();
            var userId = User.Identity.Name;
            if(false == await session.Advanced.ExistsAsync(userId))
                throw new UnauthorizedRequestException();
            
            var containsKey = form.ContainsKey("date");
            var dateTime = containsKey ? DateTime.Parse(form["date"]) : DateTime.Now;
            var record = new FuelTrackingRecord
            {
                UserId = userId,
                DateTime = dateTime.ToUniversalTime()
            };
            await session.StoreAsync(record);
            await session.SaveChangesAsync();
                
            foreach (var file in form.Files)
            {
                await using var fileStream = file.OpenReadStream();
                var operation = new PutAttachmentOperation(
                    record.Id,
                    file.Name,
                    fileStream,
                    file.ContentType);
                
                _store.Operations.Send(
                    operation);
            }

            return record;
        }

        [HttpPost]
        [Route("/api/v1/fuel-tracking/fill-detail")]
        public async Task FillDetails([FromBody] FuelTrackingRecordViewModel model)
        {
            var status = await _store.Operations.SendAsync(new PatchOperation(
                id: model.Id,
                changeVector: null,
                patch: new PatchRequest
                {
                    Script = @"
if(this.UserId == args.UserId)
{{
    this.FuelFilled = args.FuelFilled
    this.Cost = args.Cost
    this.Mileage = args.Mileage
}}
",
                    Values =
                    {
                        {"UserId", User.Identity.Name},
                        {"FuelFilled", model.FuelFilled},
                        {"Cost", model.Cost},
                        {"Mileage", model.Mileage}
                    }
                }));
            
            switch (status)
            {
                case PatchStatus.DocumentDoesNotExist:
                    throw new NotFoundRequestException($"Fuel tracing record with Id {model.Id} not found");
                case PatchStatus.NotModified:
                    throw new UnauthorizedRequestException();
            }
        }
    }
}

public class FuelTrackingRecordViewModel
{
    [Required]
    public string Id { get; set; }
    [Required]
    public float FuelFilled { set; get; }
    [Required]
    public float Cost { set; get; }
    [Required]
    public float Mileage { set; get; }
}