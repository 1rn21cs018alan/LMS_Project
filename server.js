const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/auth");

const app = express();

// --------- MIDDLEWARES ---------
app.use(express.json()); // parse JSON
app.use(cors()); // allow frontend calls
app.use(helmet()); // secure HTTP headers

// Rate limiting: prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: "Too many requests, try again later." }
});
app.use(limiter);

// --------- ROUTES ---------
app.use("/auth", authRoutes);

// --------- DATABASE ---------
mongoose
  .connect("mongodb://127.0.0.1:27017/lms", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// --------- SERVER START ---------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
