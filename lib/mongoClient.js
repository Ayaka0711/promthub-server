// lib/mongoClient.js
// BetterAuth's MongoDB adapter needs a plain `Db` instance from the
// official `mongodb` driver — it does NOT use Mongoose. We keep this
// as a separate connection from the Mongoose one in config/db.js
// (which we'll use for our own domain models like Prompt, Review, etc.
// in later phases). Both simply point at the same database.

import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

// No database name in the URI path? MongoClient.db() with no argument
// uses the default database from the connection string.
export const authDb = client.db();

console.log("✅ BetterAuth's MongoDB client connected");
