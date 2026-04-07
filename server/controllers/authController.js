const User = require("../models/User");
const { sendTokenCookie } = require("../utils/token");
const { asyncHandler } = require("../middleware/error");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email and password are required" });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(400).json({ message: "Email already in use" });

  const user = await User.create({ name, email: email.toLowerCase(), password });
  const token = sendTokenCookie(res, user._id);
  console.log(`✅ New user registered: ${user.email}`);
  res.status(201).json({ token, user: sanitize(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.log(`❌ Login failed - no user found: ${email}`);
    return res.status(401).json({ message: "No account found with this email. Please register first." });
  }
  if (!user.password) {
    return res.status(401).json({ message: "This account uses Google sign-in" });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    console.log(`❌ Login failed - wrong password: ${email}`);
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = sendTokenCookie(res, user._id);
  console.log(`✅ User logged in: ${user.email}`);
  res.json({ token, user: sanitize(user) });
});

exports.googleAuth = asyncHandler(async (req, res) => {
  // Expects { googleId, email, name, avatar } from frontend after Google OAuth
  const { googleId, email, name, avatar } = req.body;
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({ googleId, email, name, avatar });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  const token = sendTokenCookie(res, user._id);
  res.json({ token, user: sanitize(user) });
});

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

exports.getMe = asyncHandler(async (req, res) => {
  res.json(sanitize(req.user));
});

const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  channelName: user.channelName,
  channelBanner: user.channelBanner,
  subscriberCount: user.subscribers?.length || 0,
  role: user.role,
});
