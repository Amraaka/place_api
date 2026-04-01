import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  requireAuth,
  requireGuest,
  TOKEN_COOKIE,
} from "../middlewares/auth.js";

const router = express.Router();

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
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

const buildToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      name: user.name,
      gmail: user.gmail,
      imageUrl: user.imageUrl || "",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
  );

const authCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000,
});

const clearCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({}, "name gmail imageUrl").sort({
      createdAt: -1,
    });
    res.status(200).json({ users: users.map(toPublicUser) });
  } catch (error) {
    next(error);
  }
});

router.post("/signup", requireGuest, async (req, res, next) => {
  try {
    const { name, gmail, email, password, imageUrl = "" } = req.body;
    const normalizedGmail = (gmail || email || "").trim().toLowerCase();
    const normalizedImageUrl = imageUrl.trim();

    if (!name?.trim() || !normalizedGmail || !password || !normalizedImageUrl) {
      return res
        .status(400)
        .json({ message: "name, gmail, password and imageUrl are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    if (!isValidUrl(normalizedImageUrl)) {
      return res
        .status(400)
        .json({ message: "imageUrl must be a valid http/https URL." });
    }

    const existingUser = await User.findOne({ gmail: normalizedGmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this gmail already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      gmail: normalizedGmail,
      password: hashedPassword,
      imageUrl: normalizedImageUrl,
    });

    const publicUser = toPublicUser(user);
    const token = buildToken(publicUser);
    res.cookie(TOKEN_COOKIE, token, authCookieOptions());

    res.status(201).json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});

router.post("/login", requireGuest, async (req, res, next) => {
  try {
    const { gmail, email, password } = req.body;
    const normalizedGmail = (gmail || email || "").trim().toLowerCase();

    if (!normalizedGmail || !password) {
      return res
        .status(400)
        .json({ message: "gmail and password are required." });
    }

    const user = await User.findOne({ gmail: normalizedGmail }).select(
      "+password",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const publicUser = toPublicUser(user);
    const token = buildToken(publicUser);
    res.cookie(TOKEN_COOKIE, token, authCookieOptions());

    res.status(200).json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});


router.get('/me', requireAuth, async(req, res, next) => {
  try{
    const user = await User.findById(req.authUser.id, 'name gmail imageUrl');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user: toPublicUser(user) });

  } catch (error) {
    next(error);
  }
});


router.post('/logout', requireAuth, async (req, res) => {
  res.clearCookie(TOKEN_COOKIE, clearCookieOptions());
  res.status(200).json({ message: 'Logged out successfully.' });
});

export default router;
