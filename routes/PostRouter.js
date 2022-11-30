const express = require("express");
const router = express.Router();

const postController = require("../controllers/PostController");

// POST /users
router.post("/create", postController.createPost);
router.post("/get",postController.getPost)
module.exports = router;
