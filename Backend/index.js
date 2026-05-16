const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const errorHandler = require("./Middleware/errorHandler.js");
const { connectDB, sequelize } = require("./Config/db");
const {
  User,
  Profile,
  Employee,
  Product,
  Category,
  ProductVariant,
  MainPage,
} = require("./Models/associations");

// Load environment variables
dotenv.config();

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
        callback(null, true);
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

// ✅ Middleware-based Catch-all for Frontend
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/api") &&
    !req.path.includes(".")
  ) {
    const indexPath = path.join(__dirname, "../FrontEnd/dist", "index.html");
    return res.sendFile(indexPath);
  }
  next();
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

const PORT = 9000;

// ✅ Function to seed the admin user
const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (!existingAdmin) {
      await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: "123456", // Make sure your User model has a password hash hook
        role: "admin",
      });
      console.log("✅ Default admin created: admin@gmail.com / 123456");
    } else {
      console.log("ℹ️ Admin account already exists.");
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  }
};

// Function to start the server
(async () => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "temp_secret_for_debug";
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is LIVE on http://0.0.0.0:${PORT}`);
  });

  // ✅ Graceful Shutdown for Docker / Dokploy (Prevents Ghost Containers & Port Conflicts)
  const shutdown = () => {
    console.log(
      "⚠️ Received shutdown signal (SIGTERM/SIGINT). Closing server...",
    );
    server.close(() => {
      console.log("🔒 HTTP server closed.");
      process.exit(0);
    });
    // Force close if connections remain open after 5 seconds
    setTimeout(() => {
      console.error("❌ Forcing shutdown after 5 seconds...");
      process.exit(1);
    }, 5000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully.");

    // ✅ Create Admin on startup if not exists
    await seedAdmin();
  } catch (err) {
    console.error("❌ Database initialization error:", err);
  }
})();

// Global Error Handler
app.use(errorHandler);
