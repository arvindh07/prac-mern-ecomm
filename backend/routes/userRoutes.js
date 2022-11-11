const express = require("express");
const { registerUser, loginUser, logoutUser,forgotPassword, resetPassword, getUserDetails, changePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser, createReview, getProductReviews, deleteReview } = require("../controllers/userControllers");
const { isAuthUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/user/register").post(registerUser);
router.route("/user/login").post(loginUser);
router.route("/user/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

// user routes
router.route("/me").get(isAuthUser,getUserDetails);
router.route("/password/update").post(isAuthUser,changePassword);
router.route("/profile/update").post(isAuthUser,updateProfile);
router.route("/admin/users").get(isAuthUser,authorizedRoles("admin"),getAllUsers);
router.route("/admin/user/:id").get(isAuthUser,authorizedRoles("admin"),getSingleUser)
    .put(isAuthUser,authorizedRoles("admin"),updateUserRole)
    .delete(isAuthUser,authorizedRoles("admin"),deleteUser);
router.route("/review/create").post(isAuthUser,createReview);
router.route("/reviews").get(isAuthUser,getProductReviews).delete(isAuthUser,deleteReview);

module.exports = router;