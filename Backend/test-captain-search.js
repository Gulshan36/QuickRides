// Quick test script to verify captain search
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_DEV_URL || process.env.MONGODB_PROD_URL);

const captainModel = require('./models/captain.model');

async function testCaptainSearch() {
  try {
    console.log('\n========== CAPTAIN DATABASE CHECK ==========\n');
    
    // Get all captains
    const allCaptains = await captainModel.find({});
    console.log(`Total captains in database: ${allCaptains.length}\n`);
    
    allCaptains.forEach(c => {
      console.log(`Captain: ${c.fullname.firstname} ${c.fullname.lastname}`);
      console.log(`  Email: ${c.email}`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Vehicle: ${c.vehicle.type}`);
      console.log(`  Location: [lat: ${c.location.coordinates[1]}, lng: ${c.location.coordinates[0]}]`);
      console.log(`  Socket ID: ${c.socketId || 'Not connected'}`);
      console.log('');
    });
    
    // Check active captains
    const activeCaptains = await captainModel.find({ status: 'active' });
    console.log(`Active captains: ${activeCaptains.length}`);
    
    // Test search for car captains in Rajkot area (22.3, 70.8)
    console.log('\n========== TEST SEARCH ==========');
    console.log('Searching for car captains within 50km of Rajkot [22.3, 70.8]\n');
    
    const captainsInRadius = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[70.8, 22.3], 50 / 6371],
        },
      },
      "vehicle.type": "car",
      status: "active",
    });
    
    console.log(`Found: ${captainsInRadius.length} captain(s)`);
    captainsInRadius.forEach(c => {
      console.log(`  - ${c.fullname.firstname} at [${c.location.coordinates[1]}, ${c.location.coordinates[0]}]`);
    });
    
    console.log('\n==========================================\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCaptainSearch();
