// netlify/functions/emails.js
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
  if (event.httpMethod !== "GET") return cors({ error: "Method not allowed" }, 405);

  const params = event.queryStringParameters || {};
  const adminPassword = process.env.ADMIN_PASSWORD || "momdom2026";
  if (params.password !== adminPassword) return cors({ error: "Unauthorized" }, 401);

  const filter = {};
  if (params.tier)   filter.tier   = params.tier;
  if (params.status) filter.status = params.status;

  try {
    const db = await getDb();
    const docs = await db.collection("waitlist")
      .find(filter, { projection: { email: 1, _id: 0 } })
      .sort({ position: 1 })
      .toArray();
    return cors({ emails: docs.map(d => d.email) });
  } catch (err) {
    console.error("emails error:", err);
    return cors({ error: "Database error" }, 500);
  }
};
