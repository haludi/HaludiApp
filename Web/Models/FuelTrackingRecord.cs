using System;

namespace Web.Models
{
    public class FuelTrackingRecord
    {
        public FuelTrackingRecord()
        {
            
        }
        
        public FuelTrackingRecord(DateTime dateTime, float fuelFilled, float cost, float mileage)
        {
            DateTime = dateTime;
            FuelFilled = fuelFilled;
            Cost = cost;
            Mileage = mileage;
        }

        public string Id { get; set; }
        public DateTime DateTime { set; get; }
        public float? FuelFilled { set; get; }
        public float? Cost { set; get; }
        public float? Mileage { set; get; }
    }
}