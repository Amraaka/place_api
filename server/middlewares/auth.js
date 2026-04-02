const authError = (res, status, message, code) =>
  res.status(status).json({ message, code });

/**
 * Shape stored in req.session.user (and mirrored on req.authUser).
 */
export const setSessionUser = (req, user) => {
  req.session.user = {
    id: user.id,
    name: user.name,
    gmail: user.gmail,
    imageUrl: user.imageUrl || '',
  };
};

/**
 * Requires a logged-in session. Attaches `req.authUser` on success.
 */
export const requireAuth = (req, res, next) => {
  const user = req.session?.user;
  if (!user?.id) {
    return authError(res, 403, 'Нэвтэрсэн байх шаардлагатай.', 'AUTH_REQUIRED');
  }
  req.authUser = {
    id: String(user.id),
    name: user.name,
    gmail: user.gmail,
    imageUrl: user.imageUrl || '',
  };
  return next();
};

/**
 * Guest-only routes (signup / login). 403 if already logged in.
 */
export const requireGuest = (req, res, next) => {
  if (req.session?.user?.id) {
    return authError(
      res,
      403,
      'Энэ зам нь зөвхөн нэвтрээгүй хэрэглэгчид зориулагдсан.',
      'GUEST_ONLY',
    );
  }
  return next();
};
