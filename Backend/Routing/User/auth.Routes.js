const express = require("express");
const router = express.Router();
const { loginUser } = require("../../Controllers/User/auth.Controller.js");
const { body } = require("express-validator");

// @route   POST /api/auth/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  loginUser
);

module.exports = router;
