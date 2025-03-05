const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true
    },
    carId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Car", // Reference to the Car model
        default: null // Since you get it later
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropoffLocation: {
        type: String,
        required: true
    },
    dateofPickup: {
        type: String, // Can be changed to Date if needed
        required: true
    },
    timeofPickup: {
        type: String,
        required: true
    },
    dateofDropoff: {
        type: String, // Can be changed to Date if needed
        required: true
    },
    timeofDropoff: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0 // Since you calculate it later
    },
    rentalDuration:{
      type:Number
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
