const express = require("express")
const {
  getScriptsByProject,
  getScript,
  createScript,
  updateScript,
  deleteScript,
  getAllScripts,
} = require("../controllers/scriptController")
const { auth } = require("../middleware/auth")

const router = express.Router()

// All routes are protected
router.use(auth)

// Base routes
router.route("/").get(getAllScripts).post(createScript)

// Project-specific scripts route - MUST come before /:id route
router.get("/project/:projectId", getScriptsByProject)

// Individual script routes - MUST come after more specific routes
router.route("/:id").get(getScript).put(updateScript).delete(deleteScript)

module.exports = router
