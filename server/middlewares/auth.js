import jwt from 'jsonwebtoken';

export const TOKEN_COOKIE = 'access_token';

const authError = (res, status, message, code, details = undefined) => {
  const body = { message, code };
  if (details !== undefined) body.details = details;
  return res.status(status).json(body);
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

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
      'AUTH_INVALID'
    );
  }
};

export const requireGuest = (req, res, next) => {
  const token = req.cookies?.[TOKEN_COOKIE];

  if (!token) return next();

  try {
    verifyToken(token);
    return authError(
      res,
      403,
      'Энэ зам нь зөвхөн нэвтрээгүй хэрэглэгчид зориулагдсан.',
      'GUEST_ONLY'
    );
  } catch {
    return next();
  }
};