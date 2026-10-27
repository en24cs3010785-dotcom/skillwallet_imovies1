const adminOnly = (req, res, next) => {
  if (req.user && (req.user.isAdmin === true || req.user.role === 'admin')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Access denied. Administrator privileges required.',
  });
};

module.exports = { adminOnly };
