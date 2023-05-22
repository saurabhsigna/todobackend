const express = require("express");
const router = express.Router();
const passport = require("passport");
const testController = require("../controllers/TestingController");

// POST /users
router.post("/addtask", testController.addTaskToList);
router.post(
  "/createlist",
  passport.authenticate("jwt", { session: false }),
  testController.addList
);
router.get("/getlist", testController.getList);
router.post("/updatetask", testController.updateTaskInList);
router.post("/refreshtoken", testController.refreshToken);
module.exports = router;
