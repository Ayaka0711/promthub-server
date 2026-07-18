// middleware/verifyAuth.js
// Protects any route it's attached to. Asks BetterAuth to read and
// validate the session cookie for us, then attaches the user (including
// our custom role/subscription/promptCount fields) to req.user.

import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const verifyAuth = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).send({ message: "Unauthorized access: no valid session" });
    }

    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).send({ message: "Unauthorized access" });
  }
};

export default verifyAuth;
