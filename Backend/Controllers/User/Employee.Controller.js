const { Employee, User } = require("../../Models/associations");

/**
 * @desc    Create a new employee
 * @route   POST /api/employees
 * @access  Private/Admin
 */
const createEmployee = async (req, res) => {
  const { userId, DOH, salary } = req.body;

  try {
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already an employee
    const existingEmployee = await Employee.findOne({ where: { userId } });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "User is already registered as an employee" });
    }

    const employee = await Employee.create({ userId, DOH, salary });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private/Admin
 */
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          model: User,
          attributes: ["name", "email", "phone"],
        },
      ],
    });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get employee by ID
 * @route   GET /api/employees/:id
 * @access  Private/Admin
 */
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["name", "email", "phone"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update an employee
 * @route   PUT /api/employees/:id
 * @access  Private/Admin
 */
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.update(req.body);

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete an employee
 * @route   DELETE /api/employees/:id
 * @access  Private/Admin
 */
const deleteEmployee = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  await employee.destroy();
  res.status(204).send();
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
