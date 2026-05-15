const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const { User } = require("../Models/associations");

// Protect routes - checks for a valid JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read the JWT from the 'Authorization' header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload and attach to the request object
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] }
      });

      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Admin middleware - checks if the user role is 'admin'
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403); // 403 Forbidden
    throw new Error("Not authorized as an admin");
  }
};

module.exports = { protect, admin };
