import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { requireAuth, requireGuest, setSessionUser } from '../middlewares/auth.js';

const router = express.Router();

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });

const destroySession = (req) =>
  new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  gmail: user.gmail,
  imageUrl: user.imageUrl,
});

// GET /api/users — list all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}, 'name gmail imageUrl').sort({ createdAt: -1 });
    res.status(200).json({ users: users.map(toPublicUser) });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/signup
router.post('/signup', requireGuest, async (req, res, next) => {
  try {
    const { name, gmail, email, password, imageUrl = '' } = req.body;
    const normalizedGmail = (gmail || email || '').trim().toLowerCase();
    const normalizedImageUrl = imageUrl.trim();

    if (!name?.trim() || !normalizedGmail || !password || !normalizedImageUrl) {
      return res
        .status(400)
        .json({ message: 'name, gmail, password and imageUrl are required.' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters.' });
    }

    if (!isValidUrl(normalizedImageUrl)) {
      return res
        .status(400)
        .json({ message: 'imageUrl must be a valid http/https URL.' });
    }

    const existingUser = await User.findOne({ gmail: normalizedGmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'User with this gmail already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      gmail: normalizedGmail,
      password: hashedPassword,
      imageUrl: normalizedImageUrl,
    });

    const publicUser = toPublicUser(user);
    await regenerateSession(req);
    setSessionUser(req, publicUser);
    res.status(201).json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login
router.post('/login', requireGuest, async (req, res, next) => {
  try {
    const { gmail, email, password } = req.body;
    const normalizedGmail = (gmail || email || '').trim().toLowerCase();

    if (!normalizedGmail || !password) {
      return res
        .status(400)
        .json({ message: 'gmail and password are required.' });
    }

    const user = await User.findOne({ gmail: normalizedGmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const publicUser = toPublicUser(user);
    await regenerateSession(req);
    setSessionUser(req, publicUser);
    res.status(200).json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me — session-backed profile
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ user: req.authUser });
});

// POST /api/users/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    await destroySession(req);
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
