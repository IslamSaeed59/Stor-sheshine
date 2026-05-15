const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../../Controllers/User/Employee.Controller");

// You would typically protect these routes with authentication middleware
// For example: const { protect, admin } = require("../../Middleware/authMiddleware");

router.route("/").post(createEmployee).get(getAllEmployees);

router
  .route("/:id")
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
