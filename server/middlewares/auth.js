import jwt from 'jsonwebtoken';

export const TOKEN_COOKIE = 'access_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const buildToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      name: user.name,
      gmail: user.gmail,
      imageUrl: user.imageUrl || '',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
  );

export const authCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000,
});

export const clearCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

// ─── Internal helpers ─────────────────────────────────────────────────────────

const authError = (res, status, message, code) =>
  res.status(status).json({ message, code });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Requires a valid JWT cookie. Attaches `req.authUser` on success.
 * Returns 403 when token is absent or invalid — as required by the assignment spec.
 */
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[TOKEN_COOKIE];

  if (!token) {
    return authError(res, 403, 'Нэвтэрсэн байх шаардлагатай.', 'AUTH_REQUIRED');
  }

  try {
    const decoded = verifyToken(token);
    req.authUser = {
      id: decoded.sub,
      name: decoded.name,
      gmail: decoded.gmail,
      imageUrl: decoded.imageUrl || '',
    };
    return next();
  } catch {
    return authError(
      res,
      403,
      'Токен хүчингүй эсвэл хугацаа дууссан байна.',
      'AUTH_INVALID',
    );
  }
};

/**
 * Allows only unauthenticated users (guest-only routes: /login, /signup).
 * 403 = authenticated but this route forbids logged-in users.
 */
export const requireGuest = (req, res, next) => {
  const token = req.cookies?.[TOKEN_COOKIE];

  if (!token) return next();

  try {
    verifyToken(token);
    return authError(
      res,
      403,
      'Энэ зам нь зөвхөн нэвтрээгүй хэрэглэгчид зориулагдсан.',
      'GUEST_ONLY',
    );
  } catch {
    return next();
  }
};
