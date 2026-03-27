// netlify/functions/signup.js
// POST /api/signup
// Body: { email, firstName?, utm_source?, utm_medium?, utm_campaign? }

import { getDb } from "./_db.js";

const TIER_RULES = [
  { max: 100,  tier: "trailblazer", discount: 40 },
  { max: 500,  tier: "pioneer",     discount: 25 },
  { max: 1000, tier: "founding",    discount: 15 },
  { max: Infinity, tier: "community", discount: 10 },
];

function assignTier(position) {
  return TIER_RULES.find((r) => position <= r.max);
}

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
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return cors({}, 204);
  }
  if (event.httpMethod !== "POST") {
    return cors({ error: "Method not allowed" }, 405);
  }

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

    // Check duplicate
    const existing = await col.findOne({ email });
    if (existing) {
      return cors({
        duplicate: true,
        position: existing.position,
        tier: existing.tier,
        discount: existing.discount,
        message: "You're already on the list!",
      });
    }

    // Assign sequential position
    const count = await col.countDocuments();
    const position = count + 1;
    const { tier, discount } = assignTier(position);

    const doc = {
      email,
      firstName: (body.firstName || "").trim() || null,
      position,
      tier,
      discount,
      status: "pending",
      utm_source:   body.utm_source   || "direct",
      utm_medium:   body.utm_medium   || null,
      utm_campaign: body.utm_campaign || null,
      referralCode: body.referralCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await col.insertOne(doc);

    return cors({
      success: true,
      position,
      tier,
      discount,
      message: `You're in at #${position}!`,
    });
  } catch (err) {
    console.error("signup error:", err);
    return cors({ error: "Database error. Please try again." }, 500);
  }
};
