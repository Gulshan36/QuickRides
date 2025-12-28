const express = require("express");
const router = express.Router();
const captainController = require("../controllers/captain.controller");
const { body } = require("express-validator");
const { authCaptain } = require("../middlewares/auth.middleware");

router.post("/register",
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("phone").isLength({ min: 10, max: 10 }).withMessage("Phone Number should be of 10 characters only"),
    body("fullname.firstname").isLength({min:3}).withMessage("First name must be at least 3 characters long"),
    captainController.registerCaptain
);

router.post("/verify-email", captainController.verifyEmail);

router.post("/login", 
    body("email").isEmail().withMessage("Invalid Email"),
    captainController.loginCaptain
);

router.post("/update", 
    body("captainData.phone").isLength({ min: 10, max: 10 }).withMessage("Phone Number should be of 10 characters only"),
    body("captainData.fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    authCaptain,
    captainController.updateCaptainProfile
);

router.get("/profile", authCaptain, captainController.captainProfile);

// Debug endpoint to check all captains and their status
router.get("/debug/all", async (req, res) => {
    try {
        const captainModel = require("../models/captain.model");
        const captains = await captainModel.find({}).select('fullname email location status vehicle socketId');
        
        const debugInfo = captains.map(c => ({
            name: `${c.fullname.firstname} ${c.fullname.lastname}`,
            email: c.email,
            status: c.status,
            vehicleType: c.vehicle.type,
            location: {
                coordinates: c.location.coordinates,
                lat: c.location.coordinates[1],
                lng: c.location.coordinates[0]
            },
            hasSocketId: !!c.socketId,
            socketId: c.socketId
        }));
        
        res.json({
            total: captains.length,
            active: captains.filter(c => c.status === 'active').length,
            inactive: captains.filter(c => c.status === 'inactive').length,
            captains: debugInfo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/logout", authCaptain, captainController.logoutCaptain);

router.post(
    "/reset-password",
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    captainController.resetPassword
);

module.exports = router;
