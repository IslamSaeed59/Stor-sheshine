const { Sequelize } = require("sequelize");
require("dotenv").config();

// Default values for local dev if not provided in .env
const DB_NAME = process.env.DB_NAME || "sheshine_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_DIALECT = "mysql"; // Assuming mysql based on mysql2 installed

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL/Sequelize Connected: ${DB_HOST}`);
  } catch (error) {
    console.error(`❌ DB Error: ${error.message}`);
    // We don't exit the process here to avoid 502 Bad Gateway in production.
    // Instead, the app will stay alive and log the connection error.
  }
};

module.exports = { sequelize, connectDB };
