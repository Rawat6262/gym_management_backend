const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// -----------------------------
// Connect Database
// -----------------------------
connectDB();

// -----------------------------
// Security Middleware
// -----------------------------
app.use(helmet());

// -----------------------------
// Rate Limiter (Prevent abuse)
// -----------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

app.use(limiter);

// -----------------------------
// CORS
// -----------------------------
app.use(cors());

// -----------------------------
// Logging Middleware
// -----------------------------
app.use(morgan("dev"));

// -----------------------------
// Body Parser
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Static Folder (uploads)
// -----------------------------
app.use("/uploads", express.static("uploads"));

// -----------------------------
// Test Route
// -----------------------------
app.get("/", (req, res) => {
  res.send("Gym Management API Running 🚀");
});

// -----------------------------
// Routes
// -----------------------------
const memberRoutes = require("./routes/routerController");
const authRoutes = require("./routes/authRoutes");
const planRoutes = require("./routes/planRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

app.use("/api/members", memberRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/attendance", attendanceRoutes);

// -----------------------------
// Global Error Handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error"
  });
});

// -----------------------------
// Server Start
// -----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});