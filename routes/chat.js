const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");

// Get all messages between logged-in user and partner
router.get("/:partnerId", auth, async (req, res) => {
  const userId = req.user.id;
  const partnerId = req.params.partnerId;

  try {
    const messages = await Message.find({
      $or: [
        { from: userId, to: partnerId },
        { from: partnerId, to: userId },
      ],
    }).sort({ createdAt: 1 }); // oldest first

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
