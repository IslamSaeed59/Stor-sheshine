console.log("🎬 Application is starting..."); // Added for debugging

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const errorHandler = require("./Middleware/errorHandler.js");
const { connectDB, sequelize } = require("./Config/db");
const { User, Profile, Employee, Product, Category, ProductVariant, MainPage } = require("./Models/associations");

// Load environment variables
dotenv.config();

console.log("📁 Current directory:", __dirname);
console.log("🌐 Node Version:", process.version);

const allowedOrigins = [
  "http://localhost:5173",
  "https://storsheshine.vercel.app",
  "https://storsheshine-frontend-k6un9e-2508a9-187-124-10-207.sslip.io",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(cleanOrigin)) {
        callback(null, true);
      } else {
        callback(null, true); // Temporarily allow all for debugging
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  },
});

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});
// ✅ Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "../FrontEnd/dist")));

// Import Routes
const userRoutes = require("./Routing/User/user.Routes.js");
const authRoutes = require("./Routing/User/auth.Routes.js");
const profileRoutes = require("./Routing/User/Profile.Routes.js");
const employeeRoutes = require("./Routing/User/Employee.Routes.js");
const productRoutes = require("./Routing/Products/Products.Routes.js");
const uploadRoutes = require("./Routing/uploadRoutes.js");
const mainPageRoutes = require("./Routing/MainPage/MainPage.Route.js");

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the SheShine API!" });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/mainpage", mainPageRoutes);

// Catch-all route to serve the Frontend index.html for any non-API routes
app.get("(.*)", (req, res) => {
  if (!req.path.startsWith("/api")) {
    const indexPath = path.join(__dirname, "../FrontEnd/dist", "index.html");
    res.sendFile(indexPath);
  }
});

// 🏥 Health Check Endpoint
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "connected", state: 1 });
  } catch (error) {
    res.json({ status: "disconnected", state: 0, error: error.message });
  }
});

// We force port 9000 to match your domain settings
const PORT = 9000; 

// Function to start the server
(async () => {
  console.log(`📡 Attempting to start server on port ${PORT}...`);
  
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️ WARNING: JWT_SECRET is not defined. Using a temporary secret for debugging.");
    process.env.JWT_SECRET = "temp_secret_for_debug";
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is LIVE on http://0.0.0.0:${PORT}`);
  });

  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced.");
  } catch (err) {
    console.error("❌ DB Initialization Error:", err);
  }
})();

// Global Error Handler
app.use(errorHandler);
