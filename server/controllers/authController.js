const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');

const generateToken = (account, isAdmin = false) => {
  return jwt.sign(
    {
      id: account._id,
      username: account.username,
      email: account.email,
      isAdmin,
      role: isAdmin ? 'admin' : 'customer',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * @route POST /api/auth/register
 * @desc  Register a new regular customer account
 */
const registerUser = async (req, res, next) => {
  try {
    const { username, name, email, password } = req.body;
    const finalUsername = (username || name || '').trim();

    if (!finalUsername || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    if (finalUsername.length < 3 || finalUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: finalUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    const token = generateToken(user, false);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.username,
          email: user.email,
          role: 'customer',
          isAdmin: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 * @desc  Authenticate either customer or admin, returning JWT
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user exists in Admin collection
    const adminAccount = await Admin.findOne({ email: cleanEmail });
    if (adminAccount) {
      const isMatch = await bcrypt.compare(password, adminAccount.password);
      if (isMatch) {
        const token = generateToken(adminAccount, true);
        return res.status(200).json({
          success: true,
          message: 'Admin logged in successfully',
          data: {
            token,
            user: {
              id: adminAccount._id,
              username: adminAccount.username,
              name: adminAccount.username,
              email: adminAccount.email,
              role: 'admin',
              isAdmin: true,
            },
          },
        });
      }
    }

    // 2. Check in User collection
    const userAccount = await User.findOne({ email: cleanEmail });
    if (userAccount) {
      const isMatch = await bcrypt.compare(password, userAccount.password);
      if (isMatch) {
        const token = generateToken(userAccount, false);
        return res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          data: {
            token,
            user: {
              id: userAccount._id,
              username: userAccount.username,
              name: userAccount.username,
              email: userAccount.email,
              role: 'customer',
              isAdmin: false,
            },
          },
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/admin/register
 * @desc  Create a new Admin account
 */
const registerAdmin = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin username, email, and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An admin account with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      username: username.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    const token = generateToken(admin, true);

    return res.status(201).json({
      success: true,
      message: 'Admin account registered successfully',
      data: {
        token,
        user: {
          id: admin._id,
          username: admin.username,
          name: admin.username,
          email: admin.email,
          role: 'admin',
          isAdmin: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/auth/profile
 * @desc  Get currently authenticated user/admin profile
 */
const getProfile = async (req, res, next) => {
  try {
    let profile = null;

    if (req.user.isAdmin) {
      profile = await Admin.findById(req.user.id).select('-password');
    } else {
      profile = await User.findById(req.user.id).select('-password');
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),
        role: req.user.isAdmin ? 'admin' : 'customer',
        isAdmin: !!req.user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerAdmin,
  getProfile,
};
