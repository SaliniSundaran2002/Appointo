// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded must contain user's _id
    next();
    // console.log('Decoded user:', decoded);

  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
