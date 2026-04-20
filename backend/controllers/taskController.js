const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// @desc   Create a task
// @route  POST /api/tasks
// @access Admin / Manager
const createTask = async (req, res) => {
    try {
        const { title, description, project, assignedTo, priority, dueDate } = req.body;

        // Check project exists
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ message: "Project not found" });
        }

        const task = await Task.create({
            title,
            description,
            project,
            assignedTo,
            priority: priority || "medium",
            dueDate: dueDate || null,
            createdBy: req.user._id,
        });

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("project", "title")
            .populate("createdBy", "name");

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get all tasks
// @route  GET /api/tasks
// @access Logged in users
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("assignedTo", "name email")
            .populate("project", "title")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get tasks of a project
// @route  GET /api/tasks/project/:projectId
// @access Project members
const getProjectTasks = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if user is project member or admin
        const isAdmin = req.user.role === "admin";
        const isMember = project.members.includes(req.user._id);
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isMember && !isCreator) {
            return res.status(403).json({ message: "Access denied" });
        }

        const tasks = await Task.find({ project: project._id })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update task
// @route  PUT /api/tasks/:taskId
// @access Admin / Manager / Assigned user
const updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, assignedTo } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Allow admin, manager, or assigned user to update
        const isAdmin = req.user.role === "admin";
        const isManager = req.user.role === "manager";
        const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

        if (!isAdmin && !isManager && !isAssigned) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        // Update fields
        if (title) task.title = title;
        if (description) task.description = description;
        if (status) task.status = status;
        if (priority) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("project", "title")
            .populate("createdBy", "name");

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Assign task to user
// @route  PUT /api/tasks/:taskId/assign
// @access Admin / Manager
const assignTask = async (req, res) => {
    try {
        const { userId } = req.body;

        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Verify user exists
        if (userId) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
        }

        task.assignedTo = userId || null;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("project", "title")
            .populate("createdBy", "name");

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update task status
// @route  PUT /api/tasks/:taskId/status
// @access Assigned user or Admin/Manager
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Allow admin, manager, or assigned user to update
        const isAdmin = req.user.role === "admin";
        const isManager = req.user.role === "manager";
        const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

        if (!isAdmin && !isManager && !isAssigned) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        task.status = status;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("project", "title");

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Delete task
// @route  DELETE /api/tasks/:taskId
// @access Admin or task creator
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Allow admin or task creator to delete
        const isAdmin = req.user.role === "admin";
        const isCreator = task.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: "Not authorized to delete this task" });
        }

        await task.deleteOne();

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getProjectTasks,
    updateTask,
    assignTask,
    updateTaskStatus,
    deleteTask,
};
