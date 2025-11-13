const Session = require("../models/Session");
const socket = require("../socket");

// Book a session (student)
const bookSession = async (req, res) => {
  const { teacherId, date } = req.body;

  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "student")
    return res.status(403).json({ message: "Only students can book sessions" });

  if (!teacherId || !date)
    return res.status(400).json({ message: "Teacher ID and date are required" });

  try {
    const session = await Session.create({
      student: req.user._id,
      teacher: teacherId,
      date,
    });

    // Notify teacher via socket.io
    try {
      const io = socket.getIO();
      io.emit("sendNotification", {
        receiverId: teacherId,
        type: "session_request",
        data: {
          student: req.user.name,
          studentId: req.user._id,
          sessionId: session._id,
          date: session.date,
        },
      });
    } catch (err) {
      console.log("Notification error:", err.message);
    }

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher sessions (pending requests)
const getTeacherSessions = async (req, res) => {
  if (!req.user || req.user.role !== "teacher")
    return res.status(403).json({ message: "Only teachers can view sessions" });

  try {
    const sessions = await Session.find({ teacher: req.user._id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update session status (teacher)
const updateSessionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!req.user || req.user.role !== "teacher")
    return res.status(403).json({ message: "Only teachers can update sessions" });

  if (!["accepted", "rejected"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  try {
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.status = status;
    await session.save();

    // Notify student via socket.io
    try {
      const io = socket.getIO();
      io.emit("sendNotification", {
        receiverId: session.student,
        type: "session_status",
        data: {
          teacher: req.user.name,
          status: session.status,
          sessionId: session._id,
        },
      });
    } catch (err) {
      console.log("Notification error:", err.message);
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { bookSession, getTeacherSessions, updateSessionStatus };
