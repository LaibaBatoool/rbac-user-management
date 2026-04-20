const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    createTask,
    getAllTasks,
    getProjectTasks,
    updateTask,
    assignTask,
    updateTaskStatus,
    deleteTask,
} = require("../controllers/taskController");

// Get all tasks (any logged-in user)
router.get("/", protect, getAllTasks);

// Create task (Admin / Manager only)
router.post("/", protect, authorize("admin", "manager"), createTask);

// Get tasks of a project (project members)
router.get("/project/:projectId", protect, getProjectTasks);

// Update task (Admin / Manager / Assigned user)
router.put("/:taskId", protect, updateTask);

// Assign task to user (Admin / Manager)
router.put("/:taskId/assign", protect, authorize("admin", "manager"), assignTask);

// Update task status (assigned user, admin, or manager)
router.put("/:taskId/status", protect, updateTaskStatus);

// Delete task (Admin or creator)
router.delete("/:taskId", protect, deleteTask);

module.exports = router;
