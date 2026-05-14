// netlify/functions/bulk-update.js
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
  if (event.httpMethod !== "POST") return cors({ error: "Method not allowed" }, 405);

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return cors({ error: "Invalid JSON" }, 400); }

  const adminPassword = process.env.ADMIN_PASSWORD || "momdom2026";
  if (body.password !== adminPassword) return cors({ error: "Unauthorized" }, 401);

  const { emails, status } = body;
  if (!Array.isArray(emails) || emails.length === 0) return cors({ error: "emails array required" }, 400);
  if (!VALID_STATUSES.includes(status)) return cors({ error: "Invalid status" }, 400);

  try {
    const db = await getDb();
    const result = await db.collection("waitlist").updateMany(
      { email: { $in: emails } },
      { $set: { status, updatedAt: new Date() } }
    );
    return cors({ updated: result.modifiedCount });
  } catch (err) {
    console.error("bulk-update error:", err);
    return cors({ error: "Database error" }, 500);
  }
};
