const { User, Employee } = require("../../Models/associations.js");
const asyncHandler = require("../../Middleware/asyncHandler.js");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ 
    where: { email },
    include: [Employee] 
  });

  if (user && (await user.comparePassword(password))) {
    // Deny access if employee is not currently working
    if (
      user.role === "employee" &&
      user.employee &&
      user.employee.isWorking === false
    ) {
      res.status(403); // Forbidden
      throw new Error(
        "Your account is inactive. Please contact an administrator.",
      );
    }
    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    };

    // If the user is an employee, add their working status to the response
    if (user.role === "employee" && user.employee) {
      responseData.isWorking = user.employee.isWorking;
    }

    res.json(responseData);
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});
