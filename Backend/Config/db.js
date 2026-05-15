const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
  // If DATABASE_URL is provided (typical in production/Coolify)
  console.log("🔗 Using DATABASE_URL for Sequelize connection.");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      connectTimeout: 60000
    }
  });
} else {
  // Fallback to individual environment variables
  const DB_NAME = process.env.DB_NAME || "sheshine_db";
  const DB_USER = process.env.DB_USER || "root";
  const DB_PASS = process.env.DB_PASS || "";
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_DIALECT = "mysql";

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    logging: false,
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database Connected successfully.`);
  } catch (error) {
    console.error(`❌ DB Connection Error: ${error.message}`);
    // We don't exit to keep the server alive and show errors in logs
  }
};

module.exports = { sequelize, connectDB };
