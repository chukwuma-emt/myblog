const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/admin');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'owner') {
      req.user = decoded;
      return next();
    }
  } catch (err) {}
  return res.status(403).send('Access denied. Owner only.');
};
