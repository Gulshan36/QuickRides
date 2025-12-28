// Debug script to check complete ride flow
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_DEV_URL || process.env.MONGODB_PROD_URL);

const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');
const userModel = require('./models/user.model');

async function checkRideFlow() {
  try {
    console.log('\n========== RIDE FLOW DEBUG ==========\n');
    
    // 1. Check all active captains
    const activeCaptains = await captainModel.find({ status: 'active' });
    console.log(`Active Captains: ${activeCaptains.length}\n`);
    
    activeCaptains.forEach(c => {
      console.log(`Captain: ${c.fullname.firstname} ${c.fullname.lastname}`);
      console.log(`  Vehicle: ${c.vehicle.type}`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Location: [lat: ${c.location.coordinates[1]}, lng: ${c.location.coordinates[0]}]`);
      console.log(`  Socket ID: ${c.socketId || 'NOT CONNECTED!'}`);
      console.log('');
    });
    
    // 2. Check recent rides
    const recentRides = await rideModel.find({}).sort({ createdAt: -1 }).limit(5).populate('user');
    console.log(`\nRecent Rides: ${recentRides.length}\n`);
    
    recentRides.forEach(r => {
      console.log(`Ride ID: ${r._id}`);
      console.log(`  User: ${r.user?.fullname?.firstname || 'Unknown'}`);
      console.log(`  Pickup: ${r.pickup}`);
      console.log(`  Destination: ${r.destination}`);
      console.log(`  Vehicle Type: ${r.vehicleType}`);
      console.log(`  Status: ${r.status}`);
      console.log(`  Created: ${r.createdAt}`);
      console.log('');
    });
    
    // 3. Test search for bike captains near Bedi
    console.log('========== TEST SEARCH ==========');
    console.log('Searching for BIKE captains near Bedi [22.346, 70.812]\n');
    
    const bikeCaptains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[70.812, 22.346], 50 / 6371],
        },
      },
      "vehicle.type": "bike",
      status: "active",
    });
    
    console.log(`Found: ${bikeCaptains.length} bike captain(s)`);
    bikeCaptains.forEach(c => {
      console.log(`  ✓ ${c.fullname.firstname} - Socket: ${c.socketId}`);
    });
    
    if (bikeCaptains.length === 0) {
      console.log('\n❌ NO BIKE CAPTAINS FOUND!');
      console.log('Checking all captains regardless of vehicle type...\n');
      
      const allCaptainsInRadius = await captainModel.find({
        location: {
          $geoWithin: {
            $centerSphere: [[70.812, 22.346], 50 / 6371],
          },
        },
        status: "active",
      });
      
      console.log(`All active captains in 50km radius: ${allCaptainsInRadius.length}`);
      allCaptainsInRadius.forEach(c => {
        console.log(`  - ${c.fullname.firstname}: Vehicle = ${c.vehicle.type}`);
      });
    }
    
    console.log('\n==========================================\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkRideFlow();
