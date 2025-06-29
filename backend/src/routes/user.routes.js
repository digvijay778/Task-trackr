import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
  updateUserDetails,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  requestPasswordReset,








} from "../controllers/user.controller.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password/:userId/:token', resetPassword);

// Authentication routes (public)
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);

// Password management routes (public)
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/refresh-token").post(refreshAccessToken);

// User management routes (protected)
router.route("/me").get(protect, getCurrentUser);
router.route("/update").put(protect, updateUserDetails);
router.route("/change-password").put(protect, changePassword);


// router.post('/forgot-password-debug', async (req, res) => {
//   try {
//     console.log('🔍 Debug - Request body:', req.body);
//     console.log('🔍 Debug - Environment check:');
//     console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
//     console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
//     console.log('CLIENT_URL:', process.env.CLIENT_URL ? 'Set' : 'Missing');

//     // Test database connection
//     const User = await import('../models/user.model.js');
//     const userCount = await User.default.countDocuments();
//     console.log('🔍 Debug - User count in database:', userCount);

//     res.json({
//       status: 'Debug successful',
//       config: {
//         emailUser: !!process.env.EMAIL_USER,
//         emailPass: !!process.env.EMAIL_PASS,
//         clientUrl: !!process.env.CLIENT_URL,
//         userCount
//       }
//     });
//   } catch (error) {
//     console.error('🔍 Debug error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

//post

// Add this temporary debug route to your user routes



export default router;
