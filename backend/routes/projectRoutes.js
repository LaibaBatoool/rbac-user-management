const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
} = require("../controllers/projectController");

// Get all projects (admin sees all, others see their own)
router.get("/", protect, getAllProjects);

// Create project (Admin & Manager only)
router.post("/", protect, authorize("admin", "manager"), createProject);

// Get single project
router.get("/:id", protect, getProjectById);

// Update project (Admin or creator)
router.put("/:id", protect, updateProject);

// Delete project (Admin only)
router.delete("/:id", protect, authorize("admin"), deleteProject);

// Add member to project (Admin or creator)
router.put("/:id/members", protect, addProjectMember);

// Remove member from project (Admin or creator)
router.delete("/:id/members/:userId", protect, removeProjectMember);

module.exports = router;
