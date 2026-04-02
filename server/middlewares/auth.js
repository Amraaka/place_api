const authError = (res, status, message, code) =>
  res.status(status).json({ message, code });

export const setSessionUser = (req, user) => {
  req.session.user = {
    id: user.id,
    name: user.name,
    gmail: user.gmail,
    imageUrl: user.imageUrl || '',
  };
};

// Session shalgah

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

// Nevtersen hereglegch handah bolomjgui
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
