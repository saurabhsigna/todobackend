const express = require("express");
const router = express.Router();
const passport = require("passport");
const testController = require("../controllers/TestingController");

// POST /users
router.post(
  "/addtask",
  passport.authenticate("jwt", { session: false }),
  testController.addTaskToList
);
router.post(
  "/createlist",
  passport.authenticate("jwt", { session: false }),
  testController.addList
);
router.get(
  "/getlist",
  passport.authenticate("jwt", { session: false }),
  testController.getList
);
router.post(
  "/updatetask",
  passport.authenticate("jwt", { session: false }),
  testController.updateTaskInList
);
router.post("/refreshtoken", testController.refreshToken);
module.exports = router;
