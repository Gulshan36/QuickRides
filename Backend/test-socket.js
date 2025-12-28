// Test socket messaging
const mongoose = require('mongoose');
require('dotenv').config();
const io = require('socket.io-client');

mongoose.connect(process.env.MONGODB_DEV_URL || process.env.MONGODB_PROD_URL);

const captainModel = require('./models/captain.model');

async function testSocket() {
  try {
    console.log('\n========== TESTING SOCKET CONNECTIONS ==========\n');
    
    const activeCaptains = await captainModel.find({ status: 'active' });
    
    console.log(`Found ${activeCaptains.length} active captains:\n`);
    
    activeCaptains.forEach(c => {
      console.log(`${c.fullname.firstname} ${c.fullname.lastname}`);
      console.log(`  Vehicle: ${c.vehicle.type}`);
      console.log(`  Socket ID: ${c.socketId}`);
      console.log(`  Location: [${c.location.coordinates[1]}, ${c.location.coordinates[0]}]`);
      console.log('');
    });
    
    // Connect to the server as a test client
    console.log('Connecting to server...');
    const socket = io('http://localhost:4000');
    
    socket.on('connect', () => {
      console.log(`✓ Connected to server with socket ID: ${socket.id}\n`);
      
      // Try to send a test message to each captain
      activeCaptains.forEach(c => {
        console.log(`Testing message to ${c.fullname.firstname} (${c.socketId})...`);
        socket.emit('test-message-to-captain', {
          targetSocketId: c.socketId,
          message: 'Test message'
        });
      });
      
      setTimeout(() => {
        socket.disconnect();
        mongoose.connection.close();
        console.log('\n========================================\n');
      }, 2000);
    });
    
    socket.on('connect_error', (error) => {
      console.error('✗ Connection error:', error);
      mongoose.connection.close();
    });
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

testSocket();
