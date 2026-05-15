const { User, Profile, Employee } = require("../../Models/associations.js");
const asyncHandler = require("../../Middleware/asyncHandler.js");
const { validationResult } = require("express-validator");

// ➕ إنشاء مستخدم جديد
exports.createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone, role, profile, employee } = req.body;

  // The Profile model requires Address and DOB.
  if (!profile || !profile.Address || !profile.DOB) {
    res.status(400);
    throw new Error("Profile data (Address and DOB) is required");
  }

  if (role === "employee") {
    if (!employee || !employee.DOH || !employee.salary) {
      res.status(400);
      throw new Error(
        "Employee data (DOH - Date of Hire, and salary) is required for this role"
      );
    }
  }

  // Create User first
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
  });

  // Create Profile linked to User
  await Profile.create({
    ...profile,
    userId: user.id,
  });

  // If the role is 'employee', create Employee linked to User
  if (role === "employee" && employee) {
    await Employee.create({
      ...employee,
      userId: user.id,
    });
  }

  const createdUser = await User.findByPk(user.id, {
    include: [Profile, Employee],
  });

  res.status(201).json(createdUser);
});

// 📋 عرض جميع المستخدمين
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    include: [Profile, Employee],
  });
  res.json(users);
});

// 🧍 عرض مستخدم محدد
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id, {
    include: [Profile, Employee],
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

// ✏️ تعديل مستخدم
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, phone, role } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.role = role || user.role;

  if (password) {
    user.password = password;
  }

  await user.save();

  // Return the updated user, including profile for display consistency elsewhere
  const updatedUser = await User.findByPk(id, {
    include: [Profile, Employee],
  });

  res.json(updatedUser);
});

// 🗑️ حذف مستخدم
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.destroy(); // Due to CASCADE, Profile and Employee will be deleted if configured at DB level

  res.json({ message: "User deleted successfully" });
});
