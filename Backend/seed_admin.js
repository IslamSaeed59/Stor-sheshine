const { User } = require("./Models/associations");
const { connectDB } = require("./Config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ where: { email: "admin@gmail.com" } });
    
    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const adminUser = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: "123456", // Password will be hashed by the beforeCreate hook in User model
      role: "admin",
    });

    console.log("✅ Admin account created successfully:", adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  }
};

seedAdmin();
