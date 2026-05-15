const express = require("express");
const router = express.Router();
const profileController = require("../../Controllers/User/Profile.Controller.js");

// Get all profiles
router.get("/", profileController.getAllProfiles);

// Get, Update, and Delete a single profile by its ID
router.get("/:id", profileController.getProfile);
router.put("/:id", profileController.updateProfile);
router.delete("/:id", profileController.deleteProfile);

module.exports = router;
