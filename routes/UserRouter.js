const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');

// GET /users
router.get('/', userController.getUser);

// POST /users
router.post('/', userController.createUser);

module.exports = router;