const Script = require("../models/Script")
const Project = require("../models/Project")

// @desc    Get all scripts for a project
// @route   GET /api/scripts/project/:projectId
// @access  Private
const getScriptsByProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const { page = 1, limit = 10, platform, status, search } = req.query

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: req.user.id,
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    // Build query
    const query = { project: projectId, owner: req.user.id }

    if (platform) {
      query.platform = platform
    }

    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { transcript: { $regex: search, $options: "i" } }]
    }

    const scripts = await Script.find(query)
      .sort({ lastUpdated: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("project", "name")
      .populate("owner", "name email")

    const total = await Script.countDocuments(query)

    res.json({
      success: true,
      data: scripts,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get scripts error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching scripts",
      error: error.message,
    })
  }
}

// @desc    Get single script
// @route   GET /api/scripts/:id
// @access  Private
const getScript = async (req, res) => {
  try {
    const script = await Script.findOne({
      _id: req.params.id,
      owner: req.user.id,
    })
      .populate("project", "name description")
      .populate("owner", "name email")

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      })
    }

    res.json({
      success: true,
      data: script,
    })
  } catch (error) {
    console.error("Get script error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching script",
      error: error.message,
    })
  }
}

// @desc    Create new script
// @route   POST /api/scripts
// @access  Private
const createScript = async (req, res) => {
  try {
    const { name, platform, transcript, project, tags } = req.body

    if (!name || !platform || !transcript || !project) {
      return res.status(400).json({
        success: false,
        message: "Name, platform, transcript, and project are required",
      })
    }

    // Verify project ownership
    const projectDoc = await Project.findOne({
      _id: project,
      owner: req.user.id,
    })

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      })
    }

    const script = await Script.create({
      name,
      platform,
      transcript,
      project,
      tags,
      owner: req.user.id,
    })

    const populatedScript = await Script.findById(script._id)
      .populate("project", "name")
      .populate("owner", "name email")

    res.status(201).json({
      success: true,
      message: "Script created successfully",
      data: populatedScript,
    })
  } catch (error) {
    console.error("Create script error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating script",
      error: error.message,
    })
  }
}

// @desc    Update script
// @route   PUT /api/scripts/:id
// @access  Private
const updateScript = async (req, res) => {
  try {
    const { name, platform, transcript, status, tags } = req.body

    const script = await Script.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      {
        name,
        platform,
        transcript,
        status,
        tags,
        $inc: { version: 1 },
      },
      { new: true, runValidators: true },
    )
      .populate("project", "name")
      .populate("owner", "name email")

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      })
    }

    res.json({
      success: true,
      message: "Script updated successfully",
      data: script,
    })
  } catch (error) {
    console.error("Update script error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating script",
      error: error.message,
    })
  }
}

// @desc    Delete script
// @route   DELETE /api/scripts/:id
// @access  Private
const deleteScript = async (req, res) => {
  try {
    const script = await Script.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    })

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      })
    }

    res.json({
      success: true,
      message: "Script deleted successfully",
    })
  } catch (error) {
    console.error("Delete script error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting script",
      error: error.message,
    })
  }
}

// @desc    Get all scripts for user
// @route   GET /api/scripts
// @access  Private
const getAllScripts = async (req, res) => {
  try {
    const { page = 1, limit = 10, platform, status, search } = req.query

    // Build query
    const query = { owner: req.user.id }

    if (platform) {
      query.platform = platform
    }

    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { transcript: { $regex: search, $options: "i" } }]
    }

    const scripts = await Script.find(query)
      .sort({ lastUpdated: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("project", "name")
      .populate("owner", "name email")

    const total = await Script.countDocuments(query)

    res.json({
      success: true,
      data: scripts,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get all scripts error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching scripts",
      error: error.message,
    })
  }
}

module.exports = {
  getScriptsByProject,
  getScript,
  createScript,
  updateScript,
  deleteScript,
  getAllScripts,
}
