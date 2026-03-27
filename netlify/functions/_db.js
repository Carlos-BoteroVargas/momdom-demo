// netlify/functions/_db.js
// Shared MongoDB client — reused across warm function invocations

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is not set.");

let client;
let clientPromise;

// In production, reuse the connection across invocations (warm lambda)
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const c = await clientPromise;
  return c.db("momdom_demo");
}
