const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

// Get teachers by skill
router.get("/", auth, async (req, res) => {
  const { skill } = req.query;

  try {
    let teachers;
    if (skill) {
      const regex = new RegExp(skill, "i"); // case-insensitive search
      teachers = await User.find({ role: "teacher", skills: regex }).select(
        "name email skills bio"
      );
    } else {
      teachers = await User.find({ role: "teacher" }).select(
        "name email skills bio"
      );
    }
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
