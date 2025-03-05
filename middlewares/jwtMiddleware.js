// const jwt = require("jsonwebtoken");
// const users = require("../models/usersModel");

// const jwtMiddleware = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   console.log(token);
  

//   if (!token) {
//     return res.status(404).json("Authorization Failed. Token is Missing...!!!!");
//   }

//   try {
//     const jwtResponse = jwt.verify(token, process.env.jwtPrivateKey);
//     console.log(jwtResponse);
//     req.user = jwtResponse
//     console.log(req.user);
    
//     req.userId = jwtResponse.userId;
//     req.role = jwtResponse.role; // Store role in request object
//     next();
//   } catch (e) {
//     return res.status(401).json("Authorization failed. Please login.");
//   }
// };

// // Admin middleware to check if user is an admin
// const admin = (req, res, next) => {
//     console.log(req.role);
    
//   if (req.role === "admin") {
//     next(); // User is admin, proceed
//   } else {
//     res.status(403).json({ message: "Access denied, admin only" });
//   }
// };

// module.exports = { jwtMiddleware, admin };
const jwt = require("jsonwebtoken");
const users = require("../models/usersModel"); // Ensure correct model is imported
const jwtMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  console.log("Extracted Token:", token);

  if (!token) {
    return res.status(404).json("Authorization Failed. Token is Missing...!!!!");
  }

  try {
    const jwtResponse = jwt.verify(token, process.env.jwtPrivateKey);

    console.log("Decoded JWT:", jwtResponse);

    if (!jwtResponse.userId) {
      console.error("User ID is missing in token payload");
      return res.status(400).json({ message: "User ID missing in token" });
    }

    // Fetch user details from DB
    const user = await users.findById(jwtResponse.userId).select("email name role");

    if (!user) {
      console.error("User not found in database");
      return res.status(404).json("User not found.");
    }

    req.user = user;
    req.userId = user._id.toString(); // Ensure it's a string
    req.role = user.role;

    console.log("User ID set in request:", req.userId);

    next();
  } catch (error) {
    console.error("JWT Middleware Error:", error);
    return res.status(401).json("Authorization failed. Please login.");
  }
};


// const jwtMiddleware = async (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   console.log("Extracted Token:", token);

//   if (!token) {
//     return res.status(404).json("Authorization Failed. Token is Missing...!!!!");
//   }

//   try {
//     const jwtResponse = jwt.verify(token, process.env.jwtPrivateKey);
//     console.log("Decoded JWT:", jwtResponse);
//     req.userId=jwtResponse.userId
//     // Fetch user details from DB using userId from token
//     const user = await users.findById(jwtResponse.userId).select("email name role");
//     if (!user) {
//       return res.status(404).json("User not found.");
//     }

//     // Attach full user details to request object
//     req.user = user; 
//     // req.userId = user._id;
//     req.role = user.role; 

//     console.log("User Attached to req:", req.user);
//     next();
//   } catch (error) {
//     console.error("JWT Middleware Error:", error);
//     return res.status(401).json("Authorization failed. Please login.");
//   }
// };

// Admin middleware to check if user is an admin
const admin = (req, res, next) => {
  console.log("User Role:", req.role);

  if (req.role === "admin") {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

module.exports = { jwtMiddleware, admin };

