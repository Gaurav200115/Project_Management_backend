const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scriptsCount: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived", "draft"],
      default: "active",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Update lastUpdated before saving
projectSchema.pre("save", function (next) {
  this.lastUpdated = new Date()
  next()
})

// Virtual for scripts
projectSchema.virtual("scripts", {
  ref: "Script",
  localField: "_id",
  foreignField: "project",
})

// Update scripts count when scripts are added/removed
projectSchema.methods.updateScriptsCount = async function () {
  const Script = mongoose.model("Script")
  this.scriptsCount = await Script.countDocuments({ project: this._id })
  await this.save()
}

module.exports = mongoose.model("Project", projectSchema)
