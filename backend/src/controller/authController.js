const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const User = require('../model/Users');

const secret = process.env.JWT_SECRET || 'fallback-secret';
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const cookieName = 'token';
const saltRounds = 10;
const client = new OAuth2Client(googleClientId);

const authController = {
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, email, phone, password, name } = req.body;

    try {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }, { phone }],
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        username,
        email,
        phone,
        password: hashedPassword,
        name,
        isGoogleUser: false,
      });

      await newUser.save();

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  },

  login: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { identity, password } = req.body;

    try {
      const user = await User.findOne({
        $or: [{ username: identity }, { email: identity }, { phone: identity }],
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (user.isGoogleUser) {
        return res.status(403).json({ success: false, message: 'Please login using Google' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const token = jwt.sign(payload, secret, { expiresIn: '1h' });

      res.cookie(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 3600000, // 1 hour
      });

      return res.status(200).json({
        success: true,
        message: 'User authenticated successfully',
        username: user.username,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  googleLogin: async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Missing Google credential (ID Token)',
      });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      const { email, name } = payload;

      let user = await User.findOne({ email });

      if (!user) {
        const generatedUsername = `${email.split('@')[0]}${Math.floor(Math.random() * 10000)}`;
        user = new User({
          username: generatedUsername,
          email,
          name,
          password: '',
          isGoogleUser: true,
        });
        await user.save();
      }

      const tokenPayload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });

      res.cookie(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 3600000,
      });

      return res.status(200).json({
        success: true,
        message: 'Google login successful',
        username: user.username,
      });
    } catch (error) {
      console.error('Google login error:', error.message || error);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google credentials',
      });
    }
  },

  logout: (req, res) => {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  },

  isUserLoggedIn: (req, res) => {
    const token = req.cookies[cookieName];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'User not logged in',
      });
    }

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      return res.status(200).json({
        success: true,
        userDetails: decoded,
      });
    });
  },
};

module.exports = authController;
