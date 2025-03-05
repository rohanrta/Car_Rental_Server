const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const otpGenerator = require("otp-generator");
const sendOtp = require("../utils/sendOtp");

// User Registration
exports.registerUser = async (req, res) => {
  try {
    console.log("Inside registerUser", req.body); // Debugging

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword, phone });
    await newUser.save();

    res.status(200).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error); // Log the actual error
    res.status(500).json({ message: "Server error" });
  }
};
exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
      // Generate a 6-digit numeric OTP
      const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
  
      // Save OTP to DB
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
  
      // Send OTP to email
      await sendOtp(email, otp);
  
      res.status(200).json({ message: "OTP sent to registered email for 2FA" });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  };
// User Login
// exports.loginUser = async (req, res) => {
//     try {
//       const { email, password } = req.body;
  
//       // Check if user exists
//       const user = await User.findOne({ email });
//       if (!user) return res.status(404).json({ message: "User not found" });
  
//       // Validate password
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
//       // Generate OTP for 2FA
//       const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
//       const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
  
//       // Save OTP to DB
//       user.otp = otp;
//       user.otpExpiry = otpExpiry;
//       await user.save();
  
//       // Send OTP to email
//       await sendOtp(email, otp);
  
//       res.status(200).json({ message: "OTP sent to registered email for 2FA" });
//     } catch (error) {
//       res.status(500).json({ error: "Login failed" });
//     }
//   };
  exports.verifyOtp = async (req, res) => {
    try {
      const { email, otp } = req.body;
      console.log('Received OTP:', otp);


  
      // Find user
      const user = await User.findOne({ email });
      console.log('Stored OTP:', user.otp);
console.log('OTP Expiry:', user.otpExpiry);
console.log('otpExpiry type:', typeof user.otpExpiry);
console.log('Current Time:', new Date());
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Validate OTP
      if (user.otp !== otp || user.otpExpiry.getTime() < new Date().getTime()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
  
      // Generate JWT token after successful OTP verification
      const token = jwt.sign({ userId: user._id,role: user.role }, process.env.jwtPrivateKey, { expiresIn: "1h" });
  
      // Clear OTP from DB
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
  
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: "OTP verification failed" });
    }
  };


