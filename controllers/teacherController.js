const User = require("../models/User");

// Get teacher profile
const getProfile = async (req, res) => {
  if (!req.user || req.user.role !== "teacher")
    return res.status(403).json({ message: "Only teachers can access profile" });

  res.json(req.user);
};

// Update teacher profile
const updateProfile = async (req, res) => {
  if (!req.user || req.user.role !== "teacher")
    return res.status(403).json({ message: "Only teachers can update profile" });

  const { name, skills, bio } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, skills, bio },
      { new: true, select: "-password" }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile };
