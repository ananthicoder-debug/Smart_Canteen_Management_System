const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const setAuthCookie = (res, token) => {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAgeMs,
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, collegeId, password, role } = req.body;
  const existing = await User.findOne({ $or: [{ email }, { collegeId }] });
  if (existing) {
    res.status(400);
    throw new Error('Email or college ID already used');
  }
  const user = await User.create({ name, email, collegeId, password, role });
  const token = generateToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, collegeId: user.collegeId, role: user.role });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, collegeId, password } = req.body;
  const lookup = [];
  if (email) lookup.push({ email });
  if (collegeId) lookup.push({ collegeId });
  const user = lookup.length ? await User.findOne({ $or: lookup }) : null;
  if (user && await user.matchPassword(password)) {
    const token = generateToken(user);
    setAuthCookie(res, token);
    res.json({ _id: user._id, name: user.name, email: user.email, collegeId: user.collegeId, role: user.role });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});
