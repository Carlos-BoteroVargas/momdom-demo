// netlify/functions/signup.js
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

async function getActiveTier(db) {
  const doc = await db.collection("config").findOne({ key: "activeTier" });
  return doc?.value ?? "founding_circle";
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return cors({}, 204);
  if (event.httpMethod !== "POST") return cors({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return cors({ error: "Invalid JSON" }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return cors({ error: "Invalid email address" }, 400);
  }

  try {
    const db = await getDb();
    const col = db.collection("waitlist");

    const existing = await col.findOne({ email });
    if (existing) {
      return cors({
        duplicate: true,
        position: existing.position,
        tier: existing.tier,
        message: "You're already on the list!",
      });
    }

    const count = await col.countDocuments();
    const position = count + 1;
    const tier = await getActiveTier(db);

    await col.insertOne({
      email,
      firstName: (body.firstName || "").trim() || null,
      position,
      tier,
      status: "pending",
      utm_source:   body.utm_source   || "direct",
      utm_medium:   body.utm_medium   || null,
      utm_campaign: body.utm_campaign || null,
      referralCode: body.referralCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return cors({ success: true, position, tier, message: `You're in at #${position}!` });
  } catch (err) {
    console.error("signup error:", err);
    return cors({ error: "Database error. Please try again." }, 500);
  }
};
