const jwt = require('jwt-simple');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const token = authHeader.split(' ')[1];

    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token." });
  }
};