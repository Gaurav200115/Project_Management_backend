const Project = require("../models/Project")
const Script = require("../models/Script")

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Extract query parameters
    const { status, search } = req.query;

    // Build query
    const query = { owner: req.user.id };

    if (status) {
      // Validate status against allowed values
      const validStatuses = ['active', 'inactive', 'completed']; // Example statuses
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
        });
      }
      query.status = status;
    }

    if (search) {
      // Sanitize search input
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [{ name: { $regex: sanitizedSearch, $options: 'i' } }];
    }

    // Fetch all projects
    const projects = await Project.find(query)
      .sort({ lastUpdated: -1 })
      .populate('owner', 'name email')
      .lean(); // Use lean() for better performance

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      total, // Include total count for frontend convenience
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects',
    });
  }
}


// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }).populate("owner", "name email")

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error("Get project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching project",
      error: error.message,
    })
  }
}

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name , owner } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      })
    }

    const project = await Project.create({
      name,
      owner
    })

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    })
  } catch (error) {
    console.error("Create project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating project",
      error: error.message,
    })
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { name } = req.body

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { name },
      { new: true, runValidators: true },
    )

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    })
  } catch (error) {
    console.error("Update project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating project",
      error: error.message,
    })
  }
}

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Delete all scripts in this project
    await Script.deleteMany({ project: req.params.id })

    // Delete the project
    await Project.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Project and all associated scripts deleted successfully",
    })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting project",
      error: error.message,
    })
  }
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
}
