const nodemailer = require("nodemailer");
require("dotenv").config();

const sendOtp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",  // Explicitly set SMTP host
      port: 587,               // Use port 587 for TLS
      secure: false,           // false for TLS (STARTTLS)
      auth: {
        user: process.env.EMAIL,   // Gmail account email
        pass: process.env.PASSWORD // App Password (Not your actual Gmail password)
      },
    });

    const mailOptions = {
      from: `"Luxe Cars" <${process.env.EMAIL}>`, // Custom sender name
      to: email,
      subject: "🔑 Your OTP for Secure Login",
      html: `
        <h2>Welcome to Luxe Cars!</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <h1 style="color:blue;">${otp}</h1>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    return false;
  }
};

module.exports = sendOtp;
