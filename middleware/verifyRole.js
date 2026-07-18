// middleware/verifyRole.js
// Use AFTER verifyAuth in the route chain — it relies on req.user already
// being set. Example:
//   router.get("/admin/users", verifyAuth, verifyRole("admin"), getAllUsers)
//   router.post("/prompts", verifyAuth, verifyRole("creator", "admin"), addPrompt)

const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ message: "Forbidden access: insufficient role" });
    }

    next();
  };
};

export default verifyRole;
