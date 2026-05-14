// netlify/functions/update-signup.js
import { getDb } from "./_db.js";

function cors(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

const VALID_STATUSES = ["pending", "notified", "active"];

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return cors({}, 204);
  if (event.httpMethod !== "PATCH") return cors({ error: "Method not allowed" }, 405);

  const params = event.queryStringParameters || {};
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return cors({ error: "Server misconfiguration" }, 500);
  if (params.password !== adminPassword) return cors({ error: "Unauthorized" }, 401);

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return cors({ error: "Invalid JSON" }, 400); }

  const { email, status } = body;
  if (!email || !status) return cors({ error: "email and status required" }, 400);
  if (!VALID_STATUSES.includes(status)) return cors({ error: "Invalid status" }, 400);

  try {
    const db = await getDb();
    const result = await db.collection("waitlist").updateOne(
      { email },
      { $set: { status, updatedAt: new Date() } }
    );
    return cors({ updated: result.modifiedCount });
  } catch (err) {
    console.error("update-signup error:", err);
    return cors({ error: "Database error" }, 500);
  }
};
