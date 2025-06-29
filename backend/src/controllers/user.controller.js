import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asynchandler.js';
import jwt from 'jsonwebtoken'; // Added missing import

import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import PasswordResetToken from '../models/passwordResetToken.model.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

// Fixed token generation function
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// Updated register function
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email or phone');
  }

  const user = await User.create({ name, email, phone, password });
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        'User registered successfully'
      )
    );
});

// Updated login function
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .json(new ApiResponse(200, {
      user: loggedInUser,
      accessToken,
      refreshToken
    }, 'User logged in successfully'));
});

// Updated logout function
// Update your logout function in user.controller.js
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Clear refresh token from database if user is authenticated
    if (req.user && req.user._id) {
      await User.findByIdAndUpdate(req.user._id, {
        refreshToken: undefined
      });
    }
  } catch (error) {
    // Log error but don't fail the logout process
    console.warn('Failed to clear refresh token from database:', error.message);
  }

  // Always clear cookies regardless of database operation success
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});


// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');

  if (!user) throw new ApiError(404, 'User not found');

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        'User fetched successfully'
      )
    );
});

// Update user details
export const updateUserDetails = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        'User updated successfully'
      )
    );
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Both old and new passwords are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new ApiError(401, 'Old password is incorrect');

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Reset your password using this link: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    res.status(200).json(new ApiResponse(200, {}, "Reset link sent to email"));
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Email could not be sent");
  }
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  console.log('🔍 1. Forgot password request received');
  console.log('🔍 2. Request body:', req.body);
  
  const { email } = req.body;

  if (!email) {
    console.log('🔍 3. No email provided');
    return res.status(400).json(
      new ApiResponse(400, {}, 'Email is required')
    );
  }

  try {
    console.log('🔍 4. Searching for user...');
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('🔍 5. User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('🔍 6. User not found, sending generic response');
      return res.status(200).json(
        new ApiResponse(200, {}, 'If an account with this email exists, a password reset link has been sent.')
      );
    }

    console.log('🔍 7. Cleaning old tokens...');
    await PasswordResetToken.deleteMany({ userId: user._id });

    console.log('🔍 8. Generating reset token...');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 12);

    console.log('🔍 9. Saving token to database...');
    const tokenDoc = await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      createdAt: new Date()
    });

    console.log('🔍 10. Creating reset link...');
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    console.log('🔍 11. Attempting to send email...');
    await sendPasswordResetEmail(user.email, resetLink, user.name);
    console.log('🔍 12. ✅ Email sent successfully!');

    res.status(200).json(
      new ApiResponse(200, {}, 'Password reset link sent to your email')
    );

  } catch (error) {
    console.error('❌ Error in controller:', error);
    console.error('❌ Error stack:', error.stack);
    
    // ✅ FIXED: Proper error response based on search results
    return res.status(500).json(
      new ApiResponse(500, {}, 'Failed to send password reset email. Please try again later.')
    );
  }
});
// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { userId, token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'New password is required');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Invalid reset link');
  }

  // Find reset token
  const resetTokenDoc = await PasswordResetToken.findOne({ userId });
  if (!resetTokenDoc) {
    throw new ApiError(400, 'Invalid or expired reset link');
  }

  // Verify token
  const isValidToken = await bcrypt.compare(token, resetTokenDoc.token);
  if (!isValidToken) {
    throw new ApiError(400, 'Invalid or expired reset link');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update user password
  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  // Delete reset token
  await PasswordResetToken.deleteOne({ _id: resetTokenDoc._id });

  res.status(200).json(
    new ApiResponse(200, {}, 'Password reset successful')
  );
});

// Fixed refresh token function
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict"
    };


    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json(new ApiResponse(200, {
        accessToken,
        refreshToken: newRefreshToken
      }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
