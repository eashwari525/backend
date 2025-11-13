let io;

const init = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*" },
  });

  const Message = require("./models/Message");

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", ({ partnerId }) => {
      socket.join(partnerId); // room = partnerId
    });

    socket.on("sendMessage", async ({ text, to, from }) => {
      if (!from) return;
      // Save to DB
      const message = await Message.create({ from, to, text });
      // Emit to recipient
      io.to(to).emit("receiveMessage", {
        _id: message._id,
        from,
        to,
        text,
        createdAt: message.createdAt,
      });
      // Emit to sender
      socket.emit("receiveMessage", { ...message.toObject(), fromSelf: true });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { init, getIO };
