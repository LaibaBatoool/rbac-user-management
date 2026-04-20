const User = require("../models/User");
const Task = require("../models/Task");
const Project = require("../models/Project");

// ────────────────────────────────────────────────
//  Direct Gemini REST API call — uses native fetch (Node 18+)
// ────────────────────────────────────────────────
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt) {
    const key = process.env.GEMINI_API_KEY;
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        // Log the specific error to your terminal so you can see it
        console.error("Gemini API Error:", JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || `HTTP ${res.status}`);
    }

    // YOU MUST RETURN THE TEXT HERE
    return data.candidates[0].content.parts[0].text;
}

console.log("Key loaded:", !!process.env.GEMINI_API_KEY);
console.log("Key:", process.env.GEMINI_API_KEY);

// ────────────────────────────────────────────────
//  Main chat handler — role-aware
// ────────────────────────────────────────────────
const chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;
        const userRole = req.user.role;       // "admin" or "manager"
        const userId = req.user._id;

        if (!message || message.trim() === "") {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        let systemData = "";
        const msgLower = message.toLowerCase();

        // ════════════════════════════════════════
        //  ADMIN — full system access
        // ════════════════════════════════════════
        if (userRole === "admin") {

            if (msgLower.includes("user") && (msgLower.includes("how many") || msgLower.includes("count") || msgLower.includes("total"))) {
                const totalUsers = await User.countDocuments();
                const managers = await User.countDocuments({ role: "manager" });
                const admins = await User.countDocuments({ role: "admin" });
                const regularUsers = await User.countDocuments({ role: "user" });
                systemData = `System User Stats:\n- Total Users: ${totalUsers}\n- Admins: ${admins}\n- Managers: ${managers}\n- Regular Users: ${regularUsers}`;
            }

            else if (msgLower.includes("manager")) {
                const managers = await User.countDocuments({ role: "manager" });
                systemData = `Total managers in the system: ${managers}`;
            }

            else if (msgLower.includes("recommend") || msgLower.includes("promot") || msgLower.includes("suggest role")) {
                const allUsers = await User.find({ role: "user" });
                const recommendations = [];
                for (const u of allUsers) {
                    const taskCount = await Task.countDocuments({ assignedTo: u._id });
                    const completedTasks = await Task.countDocuments({ assignedTo: u._id, status: "done" });
                    if (taskCount >= 5) {
                        recommendations.push(`• ${u.name} (${u.email}): ${taskCount} tasks assigned, ${completedTasks} completed`);
                    }
                }
                systemData = recommendations.length > 0
                    ? `Role Promotion Recommendations:\n${recommendations.join("\n")}`
                    : "No users currently meet the criteria (need 5+ tasks assigned).";
            }

            else if (msgLower.includes("project")) {
                const totalProjects = await Project.countDocuments();
                const recent = await Project.find().sort({ createdAt: -1 }).limit(5).select("title");
                systemData = `Project Stats:\n- Total Projects: ${totalProjects}\n- Recent: ${recent.map(p => p.title).join(", ")}`;
            }

            else if (msgLower.includes("task")) {
                const total = await Task.countDocuments();
                const todo = await Task.countDocuments({ status: "todo" });
                const inProgress = await Task.countDocuments({ status: "in-progress" });
                const done = await Task.countDocuments({ status: "done" });
                const urgent = await Task.countDocuments({ priority: "urgent" });
                systemData = `Task Stats:\n- Total: ${total}\n- Todo: ${todo}\n- In Progress: ${inProgress}\n- Done: ${done}\n- Urgent: ${urgent}`;
            }

            else if (msgLower.includes("summary") || msgLower.includes("overview") || msgLower.includes("status")) {
                const totalUsers = await User.countDocuments();
                const totalProjects = await Project.countDocuments();
                const totalTasks = await Task.countDocuments();
                const urgent = await Task.countDocuments({ priority: "urgent" });
                const overdue = await Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: "done" } });
                systemData = `System Overview:\n- Total Users: ${totalUsers}\n- Total Projects: ${totalProjects}\n- Total Tasks: ${totalTasks}\n- Urgent Tasks: ${urgent}\n- Overdue Tasks: ${overdue}`;
            }
        }

        // ════════════════════════════════════════
        //  MANAGER — scoped to own projects/tasks
        // ════════════════════════════════════════
        else if (userRole === "manager") {

            if (msgLower.includes("project")) {
                const myProjects = await Project.find({ $or: [{ createdBy: userId }, { members: userId }] }).select("title");
                systemData = `Your Projects (${myProjects.length} total):\n${myProjects.map(p => `• ${p.title}`).join("\n") || "None found."}`;
            }

            else if (msgLower.includes("task")) {
                const myProjects = await Project.find({ $or: [{ createdBy: userId }, { members: userId }] }).select("_id");
                const ids = myProjects.map(p => p._id);
                const total = await Task.countDocuments({ project: { $in: ids } });
                const done = await Task.countDocuments({ project: { $in: ids }, status: "done" });
                const inProgress = await Task.countDocuments({ project: { $in: ids }, status: "in-progress" });
                const urgent = await Task.countDocuments({ project: { $in: ids }, priority: "urgent" });
                systemData = `Your Team Task Stats:\n- Total: ${total}\n- In Progress: ${inProgress}\n- Done: ${done}\n- Urgent: ${urgent}`;
            }

            else if (msgLower.includes("team") || msgLower.includes("summary") || msgLower.includes("overview")) {
                const myProjects = await Project.find({ $or: [{ createdBy: userId }, { members: userId }] }).populate("members", "name");
                const ids = myProjects.map(p => p._id);
                const total = await Task.countDocuments({ project: { $in: ids } });
                const done = await Task.countDocuments({ project: { $in: ids }, status: "done" });
                const members = [...new Set(myProjects.flatMap(p => p.members.map(m => m.name)))];
                systemData = `Team Overview:\n- Projects: ${myProjects.length}\n- Members: ${members.join(", ") || "None"}\n- Total Tasks: ${total}\n- Completed: ${done}`;
            }
        }

        // ════════════════════════════════════════
        //  Build prompt and call Gemini
        // ════════════════════════════════════════
        const roleDesc = userRole === "admin"
            ? "You are an Admin AI Assistant for a MERN RBAC Task Manager SaaS. You have full system data access."
            : "You are a Manager AI Assistant. You have access only to data scoped to the manager's own projects.";

        const prompt = `${roleDesc}

${systemData ? `Live System Data:\n${systemData}\n` : ""}
User Question: ${message}

Respond concisely and helpfully. Reference the live data above when relevant.`;

        console.log(`[AI] ${userRole} asked: "${message.slice(0, 60)}"`);
        const reply = await callGemini(prompt);
        res.json({ reply });

    } catch (error) {
        const detail = error.response?.data?.error?.message || error.message;
        console.error("[AI Error]", detail);
        res.status(500).json({ message: "AI service error: " + detail });
    }
};

module.exports = { chatWithBot };