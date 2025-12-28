const moment = require("moment-timezone");
const { Server } = require("socket.io");
const userModel = require("./models/user.model");
const rideModel = require("./models/ride.model");
const captainModel = require("./models/captain.model");
const frontendLogModel = require("./models/frontend-log.model");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    if (process.env.ENVIRONMENT == "production") {
      socket.on("log", async (log) => {
        log.formattedTimestamp = moment().tz("Asia/Kolkata").format("MMM DD hh:mm:ss A");
        try {
          await frontendLogModel.create(log);
        } catch (error) {
          console.log("Error sending logs...");
        }
      });
    }

    socket.on("join", async (data) => {
      const { userId, userType } = data;
      console.log(`\n✓ ${userType} connecting...`);
      console.log(`  User ID: ${userId}`);
      console.log(`  Socket ID: ${socket.id}`);
      
      if (userType === "user") {
        const userRoom = `user_${userId}`;
        socket.join(userRoom);
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        console.log(`  ✓ User joined room: ${userRoom}`);
      } else if (userType === "captain") {
        const captainRoom = `captain_${userId}`;
        socket.join(captainRoom);
        
        const captain = await captainModel.findByIdAndUpdate(
          userId, 
          { status: "active" },
          { new: true }
        );
        
        console.log(`  ✓ Captain joined room: ${captainRoom}`);
        console.log(`  Name: ${captain.fullname.firstname} ${captain.fullname.lastname}`);
        console.log(`  Vehicle: ${captain.vehicle.type}`);
        console.log(`  Status: ${captain.status}`);
        console.log(`  Location: [${captain.location.coordinates[1]}, ${captain.location.coordinates[0]}]`);
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      if (!location || !location.ltd || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }
      
      // Ensure captain is in their room
      const captainRoom = `captain_${userId}`;
      if (!socket.rooms.has(captainRoom)) {
        socket.join(captainRoom);
        console.log(`  ✓ Captain rejoined room: ${captainRoom}`);
      }
      
      // Update captain location and set status to active
      const updatedCaptain = await captainModel.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [location.lng, location.ltd],
        },
        status: "active", // Automatically set captain as active when location is updated
      }, { new: true });
      
      console.log(`✓ Captain ${updatedCaptain.fullname.firstname} location updated:`);
      console.log(`  Location: [lat: ${location.ltd}, lng: ${location.lng}]`);
      console.log(`  Status: active`);
      console.log(`  Room: ${captainRoom}`);
      console.log(`  Vehicle: ${updatedCaptain.vehicle.type}`);
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room: ${roomId}`);
    });

    socket.on("message", async ({ rideId, msg, userType, time }) => {
      const date = moment().tz("Asia/Kolkata").format("MMM DD");
      socket.to(rideId).emit("receiveMessage", { msg, by: userType, time });
      try {
        const ride = await rideModel.findOne({ _id: rideId });
        ride.messages.push({
          msg: msg,
          by: userType,
          time: time,
          date: date,
          timestamp: new Date(),
        });
        await ride.save();
      } catch (error) {
        console.log("Error saving message: ", error);
      }
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  // Legacy function - kept for backward compatibility
  // New code should use sendMessageToRoom instead
  if (!io) {
    console.error("✗ Socket.io not initialized!");
    return;
  }
  
  if (!socketId) {
    console.error("✗ No socket ID provided!");
    return;
  }
  
  const socket = io.sockets.sockets.get(socketId);
  if (!socket) {
    console.error(`✗ Socket ${socketId} not found!`);
    return;
  }
  
  socket.emit(messageObject.event, messageObject.data);
};

const sendMessageToRoom = (roomName, messageObject) => {
  if (!io) {
    console.error("✗ Socket.io not initialized!");
    return;
  }
  
  if (!roomName) {
    console.error("✗ No room name provided!");
    return;
  }
  
  console.log(`📨 Sending '${messageObject.event}' to room: ${roomName}`);
  io.to(roomName).emit(messageObject.event, messageObject.data);
  console.log(`✓ Event emitted to room successfully`);
};

const sendMessageToCaptain = (captainId, messageObject) => {
  const room = `captain_${captainId}`;
  sendMessageToRoom(room, messageObject);
};

const sendMessageToUser = (userId, messageObject) => {
  const room = `user_${userId}`;
  sendMessageToRoom(room, messageObject);
};

module.exports = { 
  initializeSocket, 
  sendMessageToSocketId,
  sendMessageToRoom,
  sendMessageToCaptain,
  sendMessageToUser
};
