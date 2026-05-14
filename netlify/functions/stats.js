// netlify/functions/stats.js
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

  const params = event.queryStringParameters || {};
  const adminPassword = process.env.ADMIN_PASSWORD || "momdom2026";
  if (params.password !== adminPassword) return cors({ error: "Unauthorized" }, 401);

  try {
    const db = await getDb();
    const col = db.collection("waitlist");

    const [
      total,
      foundingCircle,
      earlyAccess,
      generalLaunch,
      pending,
      notified,
      active,
      bySource,
      recentSignups,
    ] = await Promise.all([
      col.countDocuments(),
      col.countDocuments({ tier: "founding_circle" }),
      col.countDocuments({ tier: "early_access" }),
      col.countDocuments({ tier: "general_launch" }),
      col.countDocuments({ status: "pending" }),
      col.countDocuments({ status: "notified" }),
      col.countDocuments({ status: "active" }),
      col.aggregate([
        { $group: { _id: "$utm_source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]).toArray(),
      col.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
    ]);

    return cors({
      total,
      tiers: { founding_circle: foundingCircle, early_access: earlyAccess, general_launch: generalLaunch },
      foundingCircleRemaining: Math.max(0, 50 - foundingCircle),
      statuses: { pending, notified, active },
      bySource: bySource.map(s => ({ source: s._id || "direct", count: s.count })),
      recentSignups: recentSignups.map(d => ({ date: d._id, count: d.count })),
    });
  } catch (err) {
    console.error("stats error:", err);
    return cors({ error: "Database error" }, 500);
  }
};
