const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: { type: String, required: true ,unique:true },
  brand: { type: String, required: true },
  bodyType: { type: String, required: true },
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  seatingCapacity: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  availabilityStatus: { type: Boolean, default: true },
  image: { type: String, required: true }, // Store a single image URL
  features: { type: [String], default: [] },
}, { timestamps: true });

const Car = mongoose.model("Car", carSchema);
module.exports = Car
