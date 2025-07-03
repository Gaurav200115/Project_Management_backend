const express = require('express');
const { ObjectId } = require('mongodb');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID',
    });
  }
  next();
};

// Routes
router.use(auth);
router.route('/').get(getProjects).post(createProject);
router.route('/:id')
  .get(validateObjectId, getProject)
  .put(validateObjectId, updateProject)
  .delete(validateObjectId, deleteProject);

module.exports = router;