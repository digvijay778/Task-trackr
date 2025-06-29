import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asynchandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Access token is required');
  }

  try {
    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Get user from token
    const user = await User.findById(decodedToken._id).select('-password -refreshToken');
    
    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid access token');
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    } else {
      throw new ApiError(401, error?.message || 'Invalid access token');
    }
  }
});

// Optional middleware for routes that work with or without authentication
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken._id).select('-password -refreshToken');
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore errors for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});
