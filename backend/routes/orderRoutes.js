const express = require("express");
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrderStatus, deleteOrder } = require("../controllers/orderController");
const router = express.Router();
const {isAuthUser, authorizedRoles} = require("../middleware/auth");

router.route("/order/create").post(isAuthUser,newOrder);
router.route("/order/me").get(isAuthUser,myOrders);
router.route("/admin/orders").get(isAuthUser,authorizedRoles("admin"),getAllOrders);
router.route("/admin/order/:id").get(isAuthUser,authorizedRoles("admin"),getSingleOrder)
    .put(isAuthUser,authorizedRoles("admin"),updateOrderStatus)
    .delete(isAuthUser,authorizedRoles("admin"),deleteOrder);

module.exports = router;