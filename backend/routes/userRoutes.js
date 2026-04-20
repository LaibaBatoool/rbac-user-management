const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getUserProfile,
} = require("../controllers/userController");

// Get user profile (must be before /:id to avoid conflict)
router.get("/profile", protect, getUserProfile);

// Admin-only routes
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/:id", protect, authorize("admin"), getUserById);
router.put("/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
