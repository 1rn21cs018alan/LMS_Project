const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { userspace, username, password } = req.body;
  if (!userspace || !username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    userspace,
    username,
    password_hash: hashedPassword,
  });

  await newUser.save();
  res.json({ message: "User registered successfully" });
});

// Login
router.post("/login", async (req, res) => {
  const { userspace, username, password } = req.body;
  const user = await User.findOne({ userspace, username });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  res.json({ message: "Login successful" });
});

// Delete
router.delete("/delete", async (req, res) => {
  const { userspace, username, password } = req.body;
  const user = await User.findOne({ userspace, username });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  await User.deleteOne({ _id: user._id });
  res.json({ message: "User deleted successfully" });
});

// Change password
router.put("/change-password", async (req, res) => {
  const { userspace, username, password, new_pass } = req.body;
  const user = await User.findOne({ userspace, username });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(401).json({ message: "Invalid current password" });

  const newHashed = await bcrypt.hash(new_pass, 10);
  user.password_hash = newHashed;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

module.exports = router;
