const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/map.service");
const { sendMessageToCaptain, sendMessageToUser } = require("../socket");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");

module.exports.chatDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const ride = await rideModel
      .findOne({ _id: id })
      .populate("user", "socketId fullname phone")
      .populate("captain", "socketId fullname phone");

    if (!ride) {
      return res.status(400).json({ message: "Ride not found" });
    }

    const response = {
      user: {
        socketId: ride.user?.socketId,
        fullname: ride.user?.fullname,
        phone: ride.user?.phone,
        _id: ride.user?._id,
      },
      captain: {
        socketId: ride.captain?.socketId,
        fullname: ride.captain?.fullname,
        phone: ride.captain?.phone,
        _id: ride.captain?._id,
      },
      messages: ride.messages,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;
  
  console.log(`\n🚗 INCOMING RIDE REQUEST`);
  console.log(`  Vehicle Type from frontend: ${vehicleType}`);
  console.log(`  Pickup: ${pickup}`);
  console.log(`  Destination: ${destination}`);

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const user = await userModel.findOne({ _id: req.user._id });
    if (user) {
      user.rides.push(ride._id);
      await user.save();
    }

    res.status(201).json(ride);

    // Send ride to nearby captains (async, don't block response)
    setImmediate(async () => {
      try {
        console.log(`\n========== NEW RIDE REQUEST ==========`);
        console.log(`Ride ID: ${ride._id}`);
        console.log(`User: ${req.user.fullname.firstname} ${req.user.fullname.lastname}`);
        console.log(`Pickup: ${pickup}`);
        console.log(`Destination: ${destination}`);
        console.log(`Vehicle Type Requested: ${vehicleType}`);
        console.log(`Vehicle Type in DB: ${ride.vehicle}`);
        
        console.log(`\n📍 Geocoding pickup location...`);
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log(`✓ Pickup Coordinates: [lat: ${pickupCoordinates.ltd}, lng: ${pickupCoordinates.lng}]`);

        console.log(`\n🔍 Searching for ${ride.vehicle} captains within 50km...`);
        // Use ride.vehicle from database instead of vehicleType parameter
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
          pickupCoordinates.ltd,
          pickupCoordinates.lng,
          50, // Increased radius to 50 km for testing
          ride.vehicle
        );

        if (captainsInRadius.length === 0) {
          console.log(`\n❌ NO CAPTAINS FOUND!`);
          console.log(`   Searched within 50km of [lat: ${pickupCoordinates.ltd}, lng: ${pickupCoordinates.lng}]`);
          console.log(`   Vehicle type: ${ride.vehicle}`);
          console.log(`======================================\n`);
          return;
        }

        console.log(`\n✅ Found ${captainsInRadius.length} captain(s):`);
        captainsInRadius.forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.fullname.firstname} ${c.fullname.lastname} (Socket: ${c.socketId})`);
        });

        ride.otp = "";

        console.log(`\n📦 Fetching ride with user details...`);
        const rideWithUser = await rideModel
          .findOne({ _id: ride._id })
          .populate("user");

        console.log(`\n📨 Sending 'new-ride' event to captains...`);
        for (const captain of captainsInRadius) {
          console.log(`   → Sending to ${captain.fullname.firstname} (ID: ${captain._id})`);
          sendMessageToCaptain(captain._id, {
            event: "new-ride",
            data: rideWithUser,
          });
        }
        
        console.log(`\n✅ Ride notifications sent!`);
        console.log(`======================================\n`);
      } catch (e) {
        console.error("\n❌ ERROR IN RIDE NOTIFICATION:");
        console.error(`   Message: ${e.message}`);
        console.error(`   Stack: ${e.stack}`);
        console.log(`======================================\n`);
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const { fare, distanceTime } = await rideService.getFare(
      pickup,
      destination
    );
    return res.status(200).json({ fare, distanceTime });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const rideDetails = await rideModel.findOne({ _id: rideId });

    if (!rideDetails) {
      return res.status(404).json({ message: "Ride not found." });
    }

    switch (rideDetails.status) {
      case "accepted":
        return res
          .status(400)
          .json({
            message:
              "The ride is accepted by another captain before you. Better luck next time.",
          });

      case "ongoing":
        return res
          .status(400)
          .json({
            message: "The ride is currently ongoing with another captain.",
          });

      case "completed":
        return res
          .status(400)
          .json({ message: "The ride has already been completed." });

      case "cancelled":
        return res
          .status(400)
          .json({ message: "The ride has been cancelled." });

      default:
        break;
    }

    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMessageToUser(ride.user._id, {
      event: "ride-confirmed",
      data: ride,
    });

    // TODO: Remove ride from other captains
    // Implement logic here, maybe emit an event or update captain listings

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToUser(ride.user._id, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, captain: req.captain });

    sendMessageToUser(ride.user._id, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.cancelRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.query;

  try {
    const ride = await rideModel.findOneAndUpdate(
      { _id: rideId },
      {
        status: "cancelled",
      },
      { new: true }
    );

    const pickupCoordinates = await mapService.getAddressCoordinate(ride.pickup);
    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      4,
      ride.vehicle
    );

    captainsInRadius.map((captain) => {
      sendMessageToCaptain(captain._id, {
        event: "ride-cancelled",
        data: ride,
      });
    });
    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
