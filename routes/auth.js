const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// Helper: sanitize input (to prevent NoSQL injection)
function sanitize(input) {
  if (typeof input === "object") {
    throw new Error("Invalid input");
  }
  return String(input).trim();
}

// Middleware: validate and sanitize errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ---------------- AUTH ROUTES ----------------

// Register
router.post(
  "/register",
  [
    body("userspace").isString().trim().notEmpty(),
    body("username").isString().trim().notEmpty(),
    body("password").isLength({ min: 6 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userspace = sanitize(req.body.userspace);
      const username = sanitize(req.body.username);
      const password = req.body.password;

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        userspace,
        username,
        password_hash: hashedPassword,
      });

      await newUser.save();
      res.json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("userspace").isString().trim().notEmpty(),
    body("username").isString().trim().notEmpty(),
    body("password").isString().notEmpty(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userspace = sanitize(req.body.userspace);
      const username = sanitize(req.body.username);
      const password = req.body.password;

      const user = await User.findOne({ userspace, username });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid password" });

      res.json({ message: "Login successful" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete
router.delete(
  "/delete",
  [
    body("userspace").isString().trim().notEmpty(),
    body("username").isString().trim().notEmpty(),
    body("password").isString().notEmpty(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userspace = sanitize(req.body.userspace);
      const username = sanitize(req.body.username);
      const password = req.body.password;

      const user = await User.findOne({ userspace, username });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid password" });

      await User.deleteOne({ _id: user._id });
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Change password
router.put(
  "/change-password",
  [
    body("userspace").isString().trim().notEmpty(),
    body("username").isString().trim().notEmpty(),
    body("password").isString().notEmpty(),
    body("new_pass").isLength({ min: 6 }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const userspace = sanitize(req.body.userspace);
      const username = sanitize(req.body.username);
      const password = req.body.password;
      const new_pass = req.body.new_pass;

      const user = await User.findOne({ userspace, username });
      if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ message: "Invalid current password" });

      const newHashed = await bcrypt.hash(new_pass, 10);
      user.password_hash = newHashed;
      await user.save();

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
