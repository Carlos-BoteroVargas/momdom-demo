// netlify/functions/signups.js
// GET /api/signups?password=XXX&page=1&status=&tier=
// Password-protected admin endpoint

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

  // Password check
  const adminPassword = process.env.ADMIN_PASSWORD || "momdom2026";
  if (params.password !== adminPassword) {
    return cors({ error: "Unauthorized" }, 401);
  }

  try {
    const db = await getDb();
    const col = db.collection("waitlist");

    // Build filter
    const filter = {};
    if (params.status) filter.status = params.status;
    if (params.tier)   filter.tier   = params.tier;
    if (params.search) {
      filter.email = { $regex: params.search, $options: "i" };
    }

    const page     = Math.max(1, parseInt(params.page || "1", 10));
    const pageSize = 20;
    const skip     = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      col.find(filter).sort({ position: 1 }).skip(skip).limit(pageSize).toArray(),
      col.countDocuments(filter),
    ]);

    // Strip _id for cleanliness
    const rows = docs.map(({ _id, ...rest }) => rest);

    return cors({ rows, total, page, pageSize });
  } catch (err) {
    console.error("signups error:", err);
    return cors({ error: "Database error" }, 500);
  }
};
