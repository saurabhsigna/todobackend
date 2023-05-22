const express = require("express");
const router = express.Router();

const testController = require("../controllers/TestingController");

// POST /users
router.post("/addtask", testController.addTaskToList);
router.post("/createlist", testController.addList);
router.get("/getlist", testController.getList);
router.post("/updatetask", testController.updateTaskInList);
module.exports = router;
