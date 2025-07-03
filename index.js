const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth.js")
const projectRoutes = require("./routes/projects.js")
const scriptRoutes = require("./routes/scripts.js")

// Load environment variables
dotenv.config()

const app = express()

// Connect to database
connectDB()

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes - FIXED route mounting
app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/scripts", scriptRoutes)

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully!",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app
