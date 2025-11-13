const Message = require("../models/Message");

// Send a message
const sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;

  if (!text || !receiverId)
    return res.status(400).json({ message: "Receiver and text required" });

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });
    res.status(201).json(message);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all messages between logged-in user and another user
const getMessages = async (req, res) => {
  const { userId } = req.params; // user to chat with
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 }); // oldest first
    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all chat users (for inbox)
const getChatUsers = async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate("sender receiver", "name email role");

    const usersMap = {};
    messages.forEach((msg) => {
      const other = msg.sender._id.equals(req.user._id) ? msg.receiver : msg.sender;
      usersMap[other._id] = other;
    });

    const chatUsers = Object.values(usersMap);
    res.json(chatUsers);
  } catch (err) {
    console.error("Get chat users error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sendMessage, getMessages, getChatUsers };
