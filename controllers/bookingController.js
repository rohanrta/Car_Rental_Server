const mongoose = require('mongoose');
const Booking = require("../models/bookingModel");
const Car = require('../models/carModel')
const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
// ✅ Create a new booking with userId from JWT middleware
exports.createBooking = async (req, res) => {
    try {
        // Extract userId from JWT middleware
        const userId = req.userId;  

        // Extract booking details from request body
        const {

            pickupLocation,
            dropoffLocation,
            dateofPickup,
            timeofPickup,
            dateofDropoff,
            timeofDropoff,
        } = req.body;


        // Create new booking with userId from JWT
        const newBooking = new Booking({
            userId,  // Automatically set from JWT middleware
            carId:null,
            pickupLocation,
            dropoffLocation,
            dateofPickup,
            timeofPickup,
            dateofDropoff,
            timeofDropoff,
            totalPrice:null,
            status:"pending" // Default status is "pending"
        });

        // Save booking to the database
        await newBooking.save();

        res.status(200).json({ message: "Booking created successfully!", booking: newBooking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
};


exports.updateBooking = async (req, res) => {
    try {
        console.log("Received Booking ID:", req.params.bookingId); // Debug Log
        console.log("Request Body:", req.body); // Debug Log

        const { bookingId } = req.params;
        const { carId, pickupDate, dropoffDate, pickupTime, dropoffTime } = req.body;

        if (!bookingId) {
            return res.status(400).json({ error: "Booking ID is missing from request URL" });
        }

        if (!carId || !pickupDate || !dropoffDate || !pickupTime || !dropoffTime) {
            return res.status(400).json({ error: "All fields are required: carId, pickupDate, dropoffDate, pickupTime, dropoffTime" });
        }

        const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
        const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}`);

        if (dropoffDateTime <= pickupDateTime) {
            return res.status(400).json({ error: "Drop-off must be after pickup" });
        }

        const rentalDuration = Math.ceil((dropoffDateTime - pickupDateTime) / (1000 * 60 * 60 * 24));

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }

        const totalPrice = rentalDuration * car.pricePerDay;

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { carId, rentalDuration, totalPrice },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ error: "Failed to update booking", details: error.message });
    }
};


exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // 🔹 Find the booking and populate car details
        const booking = await Booking.findById(bookingId).populate("carId");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate("userId", "name phone email").populate("carId", "name brand pricePerDay").sort({ createdAt: -1 }); // Sort by newest bookings

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};



exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Received update request:", { id, status });

    // Check if database connection is active
    if (!mongoose.connection.readyState) {
      console.error("Database not connected");
      return res.status(500).json({ error: "Database connection error" });
    }

    // Validate the booking ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid booking ID format" });
    }

    // Check if booking exists before updating
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    console.log("Updated booking:", updatedBooking);

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

exports.generateBookingPDF = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userEmail = req.user.email; // Extract email from logged-in user
        console.log(userEmail);
        
        
        // Fetch booking details from database
        const booking = await Booking.findById(bookingId).populate("userId").populate("carId");
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        // Create a PDF document
        const doc = new PDFDocument();
        const filePath = `./booking_${bookingId}.pdf`;
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add Content
        doc.fontSize(18).text("Car Rental Booking Confirmation", { align: "center" }).moveDown();
        doc.fontSize(12).text(`Booking ID: ${booking._id}`);
        doc.text(`Customer Name: ${booking.userId?.name}`);
        doc.text(`Car Name: ${booking.carId?.name}`);
        doc.text(`Rental Price: ₹${booking.carId?.pricePerDay}/Day`);
        doc.text(`Pickup Date: ${new Date(booking.dateofPickup).toLocaleString()}`);
        doc.text(`Drop-off Date: ${new Date(booking.dateofDropoff).toLocaleString()}`);
        doc.text(`Payment Status: ${booking.paymentStatus}`);
        doc.text(`Booking Status: ${booking.status}`);
        doc.end();
    //           const carImage = booking.carId?.image; // Ensure this is a URL or path
    //   if (carImage) {
    //     doc.image(carImage, 50, 80, { width: 150, height: 100 }).moveDown(2);
    //   }

    //   // **📌 Title (Bold & Centered)**
    //   doc.font("Helvetica-Bold").fontSize(20).text("Car Rental Booking Confirmation", {
    //     align: "center",
    //   }).moveDown();

    //   // **📌 Booking Details Section**
    //   doc.font("Helvetica-Bold").fontSize(12).text("Booking Details", { underline: true }).moveDown(0.5);
    //   doc.font("Helvetica").fontSize(12)
    //     .text(`Booking ID: ${booking._id}`)
    //     .text(`Customer Name: ${booking.userId?.name}`)
    //     .text(`Car Name: ${booking.carId?.name}`)
    //     .text(`Rental Price: ₹${booking.carId?.pricePerDay}/Day`)
    //     .text(`Pickup Date: ${new Date(booking.dateofPickup).toLocaleString()}`)
    //     .text(`Drop-off Date: ${new Date(booking.dateofDropoff).toLocaleString()}`)
    //     .text(`Payment Status: ${booking.paymentStatus}`)
    //     .text(`Booking Status: ${booking.status}`)
    //     .moveDown();

    //   // **📌 Footer**
    //   doc.moveDown(2);
    //   doc.font("Helvetica-Bold").text("Thank you for choosing our service!", { align: "center" });

    //   doc.end();

        writeStream.on("finish", async () => {
            // Send Email with PDF
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL, // Replace with your email
                    pass: process.env.PASSWORD, // Replace with app-specific password
                },
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: userEmail,
                subject: "Your Car Rental Booking Confirmation",
                text: "Attached is your booking confirmation.",
                attachments: [{ filename: `booking_${bookingId}.pdf`, path: filePath }],
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Error sending email:", err);
                    return res.status(500).json({ error: "Error sending email" });
                }
                console.log("Email sent:", info.response);
                res.status(200).json({ message: "PDF sent successfully to email" });

                // Optional: Delete PDF after sending
                fs.unlinkSync(filePath);
            });
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Server error" });
    }
};







exports.getUserBookings = async(req,res) =>{
    console.log("Inside getuserController");
    const userId = req.userId
    try{
       const allBookings = await Booking.find({userId})
       res.status(200).json(allBookings)
    }catch(error){
        res.status(500).json(error)
    }
    
}
