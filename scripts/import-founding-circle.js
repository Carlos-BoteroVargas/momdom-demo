import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is not set.");

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new MongoClient(uri);

function parseCsv(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const header = lines[0].toLowerCase().split(",").map(h => h.trim());
  const nameIdx  = header.indexOf("firstname");
  const emailIdx = header.indexOf("email");
  const dateIdx  = header.indexOf("date");
  if (emailIdx === -1) throw new Error("CSV must have an 'email' column");
  return lines.slice(1).map(line => {
    // Handle quoted fields (e.g. "Smith, Jane")
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(c => c.replace(/^"|"$/g, "").trim()) ?? line.split(",").map(c => c.trim());
    const rawDate = dateIdx !== -1 ? cols[dateIdx] : null;
    return {
      firstName: nameIdx !== -1 ? cols[nameIdx] || null : null,
      email: (cols[emailIdx] || "").toLowerCase(),
      createdAt: rawDate ? new Date(rawDate) : new Date("2026-02-01"),
    };
  }).filter(r => r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));
}

async function run() {
  const rows = parseCsv(readFileSync(join(__dirname, "founding-emails.csv"), "utf8"));
  console.log(`Parsed ${rows.length} emails from CSV`);

  await client.connect();
  const col = client.db("momdom_demo").collection("waitlist");

  const last = await col.find().sort({ position: -1 }).limit(1).toArray();
  let nextPos = last.length ? last[0].position + 1 : 1;

  let inserted = 0, skipped = 0;

  for (const { firstName, email, createdAt } of rows) {
    if (await col.findOne({ email })) {
      console.log(`SKIP  ${email}`);
      skipped++;
      continue;
    }
    await col.insertOne({
      email,
      firstName: firstName || null,
      position: nextPos++,
      tier: "founding_circle",
      status: "pending",
      utm_source: "direct",
      utm_medium: null,
      utm_campaign: null,
      referralCode: null,
      createdAt,
      updatedAt: createdAt,
    });
    console.log(`INSERT ${email} (${firstName || "no name"}, joined ${createdAt.toDateString()}, pos ${nextPos - 1})`);
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}  Skipped: ${skipped}`);
  await client.close();
}

run().catch(err => { console.error(err); process.exit(1); });
