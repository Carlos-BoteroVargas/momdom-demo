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

const VALID_TIERS = ["founding_circle", "early_access", "general_launch"];

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return cors({}, 204);

  const adminPassword = process.env.ADMIN_PASSWORD || "momdom2026";

  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    if (params.password !== adminPassword) return cors({ error: "Unauthorized" }, 401);
    const db = await getDb();
    const doc = await db.collection("config").findOne({ key: "activeTier" });
    return cors({ activeTier: doc?.value ?? "founding_circle" });
  }

  if (event.httpMethod === "POST") {
    let body;
    try { body = JSON.parse(event.body || "{}"); } catch { return cors({ error: "Invalid JSON" }, 400); }
    if (body.password !== adminPassword) return cors({ error: "Unauthorized" }, 401);
    if (!VALID_TIERS.includes(body.activeTier)) return cors({ error: "Invalid tier" }, 400);
    const db = await getDb();
    await db.collection("config").updateOne(
      { key: "activeTier" },
      { $set: { key: "activeTier", value: body.activeTier } },
      { upsert: true }
    );
    return cors({ activeTier: body.activeTier });
  }

  return cors({ error: "Method not allowed" }, 405);
};
