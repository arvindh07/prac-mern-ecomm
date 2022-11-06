const express = require("express");
const { forgotPassword, resetPassword } = require("../controllers/userControllers");
const router = express.Router();

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router;