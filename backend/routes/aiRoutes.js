const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { chatWithBot } = require("../controllers/aiController");

// POST /api/ai/chat — Admin and Manager only
router.post("/chat", protect, authorize("admin", "manager"), chatWithBot);

module.exports = router;
