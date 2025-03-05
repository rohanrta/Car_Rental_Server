const Car = require("../models/carModel");

exports.addCar = async (req, res) => {
  try {
    const { 
      name, 
      brand, 
      bodyType, 
      fuelType, 
      transmission, 
      seatingCapacity, 
      pricePerDay, 
      location, 
      availabilityStatus, 
      features 
    } = req.body;

    // Check if an image file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Check if the car already exists based on name, brand, and location
    const existingCar = await Car.findOne({ name, brand, location });

    if (existingCar) {
      return res.status(409).json({ message: "Car with this name and brand already exists at this location." });
    }

    // Get uploaded image URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // Create a new car instance
    const newCar = new Car({
      name,
      brand,
      bodyType,
      fuelType,
      transmission,
      seatingCapacity,
      pricePerDay,
      location,
      availabilityStatus: availabilityStatus ?? true, // Default to true
      image: imageUrl, // Store single image URL
      features: features || [], // Default empty array
    });

    // Save the new car to the database
    await newCar.save();

    res.status(200).json({ message: "Car added successfully", car: newCar });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};
exports.removeCarController = async (req,res) =>{
  console.log("removeProjectController");
  const {id} = req.params
  try{
      const deleteCar = await Car.findByIdAndDelete({_id:id})
      res.status(200).json(deleteCar)
  }catch(err){
      res.status(401).json(err)
  }
}


// Update Car Details
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, bodyType, fuelType, transmission, seatingCapacity, location, features, pricePerDay, availabilityStatus } = req.body;
    
    let updatedFields = {
      name,
      brand,
      bodyType,
      fuelType,
      transmission,
      seatingCapacity,
      location,
      features: features ? features.split(",") : [], // Convert features to array if sent as a string
      pricePerDay,
      availabilityStatus
    };

    // Check if an image was uploaded
    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }

    const updatedCar = await Car.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ message: "Car updated successfully", updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllCarsUser = async(req,res) =>{
  console.log("Inside UserPanel CarController");
  const searchKey = req.query.search
  const query = {
    name:{
      $regex :searchKey,
      $options:'i'
    }
  }
  try{
    const allCars = await Car.find(query)
    res.status(200).json(allCars)
  }catch(e){
    res.status(401).json(e)
  }
}
