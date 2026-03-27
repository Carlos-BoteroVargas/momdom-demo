// netlify/functions/public-stats.js
// GET /api/public-stats
// No auth required — returns only public-facing counters for the proof strip

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

  try {
    const db = await getDb();
    const col = db.collection("waitlist");

    const [total, trailblazers] = await Promise.all([
      col.countDocuments(),
      col.countDocuments({ tier: "trailblazer" }),
    ]);

    return cors({
      total,
      trailblazersRemaining: Math.max(0, 100 - trailblazers),
    });
  } catch (err) {
    console.error("public-stats error:", err);
    return cors({ error: "Database error" }, 500);
  }
};
