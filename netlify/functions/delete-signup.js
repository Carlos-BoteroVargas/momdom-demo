// netlify/functions/delete-signup.js
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

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return cors({}, 204);
  if (event.httpMethod !== "POST") return cors({ error: "Method not allowed" }, 405);

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return cors({ error: "Invalid JSON" }, 400); }

  const adminPassword = process.env.ADMIN_PASSWORD || "momdom2026";
  if (body.password !== adminPassword) return cors({ error: "Unauthorized" }, 401);

  const { email } = body;
  if (!email) return cors({ error: "email required" }, 400);

  try {
    const db = await getDb();
    const result = await db.collection("waitlist").deleteOne({ email });
    return cors({ deleted: result.deletedCount });
  } catch (err) {
    console.error("delete-signup error:", err);
    return cors({ error: "Database error" }, 500);
  }
};
