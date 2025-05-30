const jwt = require('jsonwebtoken');
const Token = require('../models/token.model');
const { default: mongoose } = require('mongoose');

const validateAndConvertObjectId = (id) => {
  if (!id) return null;

  if (id instanceof mongoose.Types.ObjectId) {
    // Nếu đã là ObjectId instance, trả luôn
    return id;
  }

  // Nếu là string và hợp lệ, tạo ObjectId mới
  if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }

  return null;
};
/**
 * Generate JWT tokens (access and refresh)
 * @param {Object} user - User object
 * @returns {Object} Access and refresh tokens
 */
const generateAuthTokens = async (user) => {
  // Create payload
  const payload = {
    id: user._id,
    role: user.role
  };

  // Generate access token
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );

  // Calculate expiration time for refresh token
  const refreshExpiry = new Date();
  refreshExpiry.setDate(refreshExpiry.getDate() + 7); // 7 days

  // Store refresh token in database
  await Token.create({
    token: refreshToken,
    userId: user._id,
    type: 'refresh',
    expiresAt: refreshExpiry
  });

  return {
    accessToken,
    refreshToken
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, type = 'access') => {
  try {
    const secret = type === 'access'
      ? process.env.JWT_ACCESS_SECRET
      : process.env.JWT_REFRESH_SECRET;

    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Blacklist a token
 * @param {string} token - JWT token
 * @param {string} userId - User ID
 * @param {string} type - Token type ('access' or 'refresh')
 */

const blacklistToken = async (token, userId, type = 'refresh') => {
  try {
    // console.log('Blacklisting token:', { token, userId, type });

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token payload');
    }

    const expiresAt = new Date(decoded.exp * 1000);

    // Chuyển userId sang ObjectId nếu cần
    const userObjectId = validateAndConvertObjectId(userId);
    if (!userObjectId) {
      throw new Error('Invalid userId format');
    }

    // Kiểm tra token đã tồn tại chưa
    const exists = await Token.findOne({ token });
    if (exists) {
      console.log('Token already blacklisted');
      return;
    }

    await Token.create({
      token,
      userId: userObjectId,
      type,
      expiresAt
    });

    console.log('Token blacklisted successfully');
  } catch (error) {
    console.error('Error blacklisting token:', error);
    throw new Error('Failed to blacklist token');
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token
 * @returns {boolean} True if blacklisted
 */
const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await Token.findOne({ token });
  return !!blacklistedToken;
};

module.exports = {
  generateAuthTokens,
  verifyToken,
  blacklistToken,
  isTokenBlacklisted
};
