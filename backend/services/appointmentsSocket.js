let io = null;

const initializeSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-doctor-room", (doctorId) => {
      socket.join(`doctor:${doctorId}`);
      console.log(`Socket ${socket.id} joined doctor room: ${doctorId}`);
    });

    socket.on("join-reception-room", () => {
      socket.join("reception");
      console.log(`Socket ${socket.id} joined reception room`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

const emitNewAppointment = (appointment) => {
  if (io) {
    io.emit("appointment:created", appointment);
  }
};

const emitAppointmentUpdated = (appointment) => {
  if (io) {
    io.emit("appointment:updated", appointment);
  }
};

const emitAppointmentCancelled = (appointment) => {
  if (io) {
    io.emit("appointment:cancelled", appointment);
  }
};

const emitPatientCheckedIn = (appointment) => {
  if (io) {
    io.to(`doctor:${appointment.doctorId}`).emit("patient:checked-in", appointment);
    io.to("reception").emit("patient:checked-in", appointment);
  }
};

const emitAppointmentStarted = (appointment) => {
  if (io) {
    io.to("reception").emit("appointment:started", appointment);
  }
};

const emitAppointmentCompleted = (appointment) => {
  if (io) {
    io.emit("appointment:completed", appointment);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitNewAppointment,
  emitAppointmentUpdated,
  emitAppointmentCancelled,
  emitPatientCheckedIn,
  emitAppointmentStarted,
  emitAppointmentCompleted
};