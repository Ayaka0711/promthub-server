// middleware/verifyToken.js
// Protects any route it's attached to. Reads the JWT from the HTTPOnly
// cookie (NOT from localStorage/headers — that's what keeps it safe from
// XSS attacks reading it via JavaScript), verifies it, and attaches the
// decoded payload to req.user so later handlers know who's calling.

import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized access: no token found" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access: invalid or expired token" });
    }
    // decoded looks like { email: "...", iat, exp }
    req.user = decoded;
    next();
  });
};

export default verifyToken;
