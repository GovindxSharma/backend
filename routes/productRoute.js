const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProductDetails, createProductReview, getProductReviews, deleteReview, getAdminProducts } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/Auth.js");


const router = express.Router();
router.route("/products").get(
     // Use authorizeRoles middleware for admin access
    getAllProducts
  );
router.route('/admin/product/new').post(isAuthenticatedUser,
  authorizeRoles("admin"),createProduct)
router.route('/admin/product/:id').put(isAuthenticatedUser,
  authorizeRoles("admin"),updateProduct).delete(isAuthenticatedUser,
    authorizeRoles("admin"),deleteProduct)
    router.route('/product/:id').get(getSingleProductDetails)

    router.route('/admin/products').get(isAuthenticatedUser,authorizeRoles("admin"),getAdminProducts)

router.route('/review').patch(isAuthenticatedUser,createProductReview)
router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser,deleteReview)


module.exports = router;
