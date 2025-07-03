const mongoose = require("mongoose");

const scriptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Script name is required"],
      trim: true,
      maxlength: [100, "Script name cannot exceed 100 characters"],
    },
    platform: {
      type: String,
      required: [true, "Platform is required"],
      enum: ["RSS Feed", "YouTube Video", "Upload Files", "web", "mobile", "desktop", "api", "database", "other"],
      default: "web",
    },
    transcript: {
      type: String,
      required: [true, "Transcript is required"],
      maxlength: [10000, "Transcript cannot exceed 10000 characters"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    uploadDate: {
      type: String,
      default: () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
    },
    uploadTime: {
      type: String,
      default: () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    },
  },
  {
    timestamps: true,
  }
);

// Update lastUpdated before saving
scriptSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Update project's lastUpdated and scriptsCount after script operations
scriptSchema.post("save", async function () {
  const Project = mongoose.model("Project");
  const project = await Project.findById(this.project);
  if (project) {
    await project.updateScriptsCount();
  }
});

scriptSchema.post("remove", async function () {
  const Project = mongoose.model("Project");
  const project = await Project.findById(this.project);
  if (project) {
    await project.updateScriptsCount();
  }
});

module.exports = mongoose.model("Script", scriptSchema);