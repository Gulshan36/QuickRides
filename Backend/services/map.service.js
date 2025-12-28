const axios = require("axios");
const captainModel = require("../models/captain.model");

module.exports.getAddressCoordinate = async (address) => {
  // Add country bias for India and prefer Gujarat region for common ambiguous names
  // Try with Gujarat bias first for cities like Bedi, Morbi, Rajkot
  let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Gujarat, India&countrycodes=in&limit=1`;

  try {
    let response = await axios.get(url, {
      headers: {
        'User-Agent': 'QuickRide App/1.0'
      }
    });
    
    // If no results with Gujarat, try general India search
    if (!response.data || response.data.length === 0) {
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`;
      response = await axios.get(url, {
        headers: {
          'User-Agent': 'QuickRide App/1.0'
        }
      });
    }
    
    console.log(`Geocoding "${address}":`, response.data[0]);
    
    if (response.data && response.data.length > 0) {
      return {
        ltd: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getReverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=in`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'QuickRide App/1.0'
      }
    });
    
    console.log(`Reverse geocoding [${lat}, ${lng}]:`, response.data.display_name);
    
    if (response.data && response.data.display_name) {
      return {
        address: response.data.display_name,
        city: response.data.address.city || response.data.address.town || response.data.address.village,
        state: response.data.address.state,
        country: response.data.address.country
      };
    } else {
      throw new Error("Unable to fetch address");
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error.message);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  try {
    // First, get coordinates for both locations using Nominatim (OpenStreetMap)
    const originCoords = await getCoordinatesFromAddress(origin);
    const destCoords = await getCoordinatesFromAddress(destination);

    // Use OSRM (Open Source Routing Machine) for route calculation
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=false`;

    const response = await axios.get(url);
    console.log("OSRM API Response:", JSON.stringify(response.data, null, 2));

    if (response.data.code === "Ok" && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      
      return {
        distance: {
          text: `${(route.distance / 1000).toFixed(1)} km`,
          value: route.distance, // in meters
        },
        duration: {
          text: `${Math.round(route.duration / 60)} mins`,
          value: route.duration, // in seconds
        },
        status: "OK",
      };
    } else {
      throw new Error("No routes found");
    }
  } catch (err) {
    if (err.response) {
      console.error("API Error Response:", err.response.data);
    }
    console.error("Error fetching distance and time:", err.message);
    throw err;
  }
};

// Helper function to get coordinates from address using Nominatim
async function getCoordinatesFromAddress(address) {
  // Add country bias for India to get more accurate results
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`;
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'QuickRide App/1.0'
    }
  });

  if (response.data && response.data.length > 0) {
    return {
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon)
    };
  } else {
    throw new Error(`Location not found: ${address}`);
  }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  // Add country bias for India to get more accurate results
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=in&limit=5`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'QuickRide App/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      return response.data
        .map((place) => place.display_name)
        .filter((value) => value);
    } else {
      return [];
    }
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius, vehicleType) => {
  // radius in km
  
  console.log(`\n========== CAPTAIN SEARCH DEBUG ==========`);
  console.log(`Searching for ${vehicleType} captains within ${radius}km of [lat: ${ltd}, lng: ${lng}]`);
  
  try {
    // First, get all active captains of this vehicle type to debug
    const allActiveCaptains = await captainModel.find({
      "vehicle.type": vehicleType,
      status: "active"
    });
    
    console.log(`Total active ${vehicleType} captains in database: ${allActiveCaptains.length}`);
    allActiveCaptains.forEach(c => {
      const captainLat = c.location.coordinates[1];
      const captainLng = c.location.coordinates[0];
      console.log(`  - ${c.fullname.firstname} ${c.fullname.lastname}: [lat: ${captainLat}, lng: ${captainLng}], status: ${c.status}`);
    });
    
    // Now search within radius
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, ltd], radius / 6371],
        },
      },
      "vehicle.type": vehicleType,
      status: "active",
    });
    
    console.log(`\nCaptains within ${radius}km radius: ${captains.length}`);
    if (captains.length > 0) {
      captains.forEach(c => {
        console.log(`  ✓ ${c.fullname.firstname} at [${c.location.coordinates[1]}, ${c.location.coordinates[0]}]`);
      });
    } else {
      console.log(`  ✗ No captains found in radius!`);
    }
    console.log(`==========================================\n`);
    
    return captains;
  } catch (error) {
    console.error("Error in getCaptainsInTheRadius:", error);
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};
