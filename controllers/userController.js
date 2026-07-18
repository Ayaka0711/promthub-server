// controllers/userController.js
// Users live in BetterAuth's own "user" collection (native MongoDB driver,
// see lib/mongoClient.js) rather than a Mongoose model — these controllers
// query that collection directly.

import { authDb } from "../lib/mongoClient.js";

// GET /users/profile — private. Powers the dashboard Profile page.
export const getProfile = async (req, res) => {
  try {
    const user = await authDb.collection("user").findOne({ email: req.user.email });
    if (!user) return res.status(404).send({ message: "User not found" });

    res.send({
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      subscription: user.subscription,
      promptCount: user.promptCount || 0,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch profile" });
  }
};

// ---- Admin only ----

// GET /admin/users — admin only. "All Users" table.
export const getAllUsers = async (req, res) => {
  try {
    const users = await authDb
      .collection("user")
      .find({}, { projection: { name: 1, email: 1, image: 1, role: 1, subscription: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch users" });
  }
};

// PATCH /admin/users/:id/role — admin only. Body: { role: "user" | "creator" | "admin" }
export const updateUserRole = async (req, res) => {
  try {
    const { ObjectId } = await import("mongodb");
    const { role } = req.body;

    if (!["user", "creator", "admin"].includes(role)) {
      return res.status(400).send({ message: "Invalid role" });
    }

    await authDb.collection("user").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { role } });
    res.send({ message: "Role updated" });
  } catch (error) {
    res.status(500).send({ message: "Failed to update role", error: error.message });
  }
};

// DELETE /admin/users/:id — admin only.
export const deleteUser = async (req, res) => {
  try {
    const { ObjectId } = await import("mongodb");
    await authDb.collection("user").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send({ message: "User deleted" });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete user", error: error.message });
  }
};
