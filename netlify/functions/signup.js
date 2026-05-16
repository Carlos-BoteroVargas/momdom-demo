// netlify/functions/signup.js
import { readFileSync } from "fs";
import { resolve } from "path";
import { Resend } from "resend";
import { getDb } from "./_db.js";

const TIER_LABELS = {
  founding_circle: "Founding Circle",
};
function tierLabel(slug) {
  return TIER_LABELS[slug] ?? slug.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function fillTemplate(template, vars) {
  return Object.entries(vars).reduce(
    (html, [key, val]) => html.replaceAll(`{{${key}}}`, val ?? ""),
    template
  );
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

    const firstName = (body.firstName || "").trim() || null;

    await col.insertOne({
      email,
      firstName,
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

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const adminTo = process.env.ADMIN_EMAIL;
      if (!adminTo) console.warn("ADMIN_EMAIL env var not set — admin notification skipped");

      const adminHtml = readFileSync(
        resolve(process.cwd(), "email-templates/email-admin.html"),
        "utf8"
      );
      const subscriberHtml = readFileSync(
        resolve(process.cwd(), "email-templates/email-subscriber.html"),
        "utf8"
      );

      const timestamp = new Date().toLocaleString("en-US", {
        month: "long", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", timeZoneName: "short",
      });

      const emailPromises = [];

      if (adminTo) {
        emailPromises.push(
          resend.emails.send({
            from: "notifications@momdom.app",
            to: adminTo,
            subject: `New waitlist signup #${position} — ${tier}`,
            html: fillTemplate(adminHtml, {
              position,
              email,
              firstName: firstName ?? "—",
              tier: tierLabel(tier),
              utmSource: body.utm_source || "direct",
              timestamp,
            }),
          })
        );
      }

      emailPromises.push(
        resend.emails.send({
          from: "Lesley at MomDom <hello@momdom.app>",
          reply_to: "heymama.momdom@gmail.com",
          to: email,
          subject: "You're on the MomDom waitlist! 🎉",
          html: fillTemplate(subscriberHtml, {
            firstName: firstName ?? "Friend",
            position,
            tier: tierLabel(tier),
          }),
        })
      );

      const results = await Promise.allSettled(emailPromises);
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error(`Resend email[${i}] failed:`, r.reason);
      });
    }

    return cors({ success: true, position, tier, message: `You're in at #${position}!` });
  } catch (err) {
    console.error("signup error:", err);
    return cors({ error: "Database error. Please try again." }, 500);
  }
};
