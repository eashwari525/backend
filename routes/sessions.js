const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { bookSession, getTeacherSessions, updateSessionStatus } = require("../controllers/sessionController");

// Student books a session
router.post("/book", auth, bookSession);

// Teacher views session requests
router.get("/teacher", auth, getTeacherSessions);

// Teacher updates session status
router.put("/status/:id", auth, updateSessionStatus);

module.exports = router;
