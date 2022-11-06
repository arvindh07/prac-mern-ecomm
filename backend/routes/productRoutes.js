const express = require("express");
const { getAllProducts, createProduct , updateProduct, deleteProduct, getSingleProduct} = require("../controllers/productController");
const { isAuthUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/admin/product/new").post(isAuthUser,authorizedRoles("admin"),createProduct);
router.route("/products").get(getAllProducts);
router.route("/admin/product/:id")
    .put(isAuthUser,authorizedRoles("admin"),updateProduct)
    .delete(isAuthUser,authorizedRoles("admin"),deleteProduct);
router.route("/product/:id").get(getSingleProduct);

module.exports = router;