const express= require('express');

const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userController');
const router=express.Router();
const { isAuthenticatedUser, authorizeRoles} = require("../middleware/Auth.js");
const cloudinary = require('cloudinary');
const upload = require("../middleware/multer");



router.route('/register').post(upload.single('avatar'),registerUser)
router.route('/login').post(loginUser)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/logout').get(logout)
router.route('/me').get(isAuthenticatedUser,getUserDetails)
router.route('/password/update').patch(isAuthenticatedUser,updatePassword)
router.route('/me/update').patch(isAuthenticatedUser,updateProfile)
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles("admin"),getAllUsers)
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser).patch(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser)

module.exports=router