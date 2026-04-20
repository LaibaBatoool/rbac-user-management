const Project = require("../models/Project");
const Task = require("../models/Task");

// @desc   Create project
// @route  POST /api/projects
// @access Admin / Manager
const createProject = async (req, res) => {
    const { title, description, members } = req.body;

    try {
        const project = await Project.create({
            title,
            description,
            createdBy: req.user._id,
            members: [req.user._id], // Creator is automatically a member
        });

        const populatedProject = await Project.findById(project._id)
            .populate("members", "name email")
            .populate("createdBy", "name email");

        res.status(201).json(populatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get all projects
// @route  GET /api/projects
// @access Admin sees all, others see their own
const getAllProjects = async (req, res) => {
    try {
        let query;

        if (req.user.role === "admin") {
            // Admin sees all projects
            query = Project.find();
        } else {
            // Others see only projects they're involved in
            query = Project.find({
                $or: [
                    { createdBy: req.user._id },
                    { members: req.user._id }
                ]
            });
        }

        const projects = await query
            .populate("members", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Get single project
// @route  GET /api/projects/:id
// @access Project members or admin
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("members", "name email")
            .populate("createdBy", "name email");

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check access
        const isAdmin = req.user.role === "admin";
        const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
        const isCreator = project.createdBy._id.toString() === req.user._id.toString();

        if (!isAdmin && !isMember && !isCreator) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Update project
// @route  PUT /api/projects/:id
// @access Admin or project creator
const updateProject = async (req, res) => {
    try {
        const { title, description } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check permission
        const isAdmin = req.user.role === "admin";
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: "Not authorized to update this project" });
        }

        project.title = title || project.title;
        project.description = description || project.description;

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("members", "name email")
            .populate("createdBy", "name email");

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Delete project
// @route  DELETE /api/projects/:id
// @access Admin only
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Delete all tasks in this project first
        await Task.deleteMany({ project: project._id });

        // Delete the project
        await project.deleteOne();

        res.json({ message: "Project and all associated tasks deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Add member to project
// @route  PUT /api/projects/:id/members
// @access Admin or project creator
const addProjectMember = async (req, res) => {
    try {
        const { userId } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check permission
        const isAdmin = req.user.role === "admin";
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Check if user already a member
        if (project.members.includes(userId)) {
            return res.status(400).json({ message: "User is already a member" });
        }

        project.members.push(userId);
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("members", "name email")
            .populate("createdBy", "name email");

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Remove member from project
// @route  DELETE /api/projects/:id/members/:userId
// @access Admin or project creator
const removeProjectMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check permission
        const isAdmin = req.user.role === "admin";
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Cannot remove creator
        if (req.params.userId === project.createdBy.toString()) {
            return res.status(400).json({ message: "Cannot remove project creator" });
        }

        project.members = project.members.filter(
            m => m.toString() !== req.params.userId
        );

        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("members", "name email")
            .populate("createdBy", "name email");

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
};
