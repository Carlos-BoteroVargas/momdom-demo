import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is not set.");

const client = new MongoClient(uri);

async function migrate() {
  await client.connect();
  const col = client.db("momdom_demo").collection("waitlist");

  const tierMaps = [
    { from: "trailblazer", to: "founding_circle" },
    { from: "pioneer",     to: "early_access"    },
    { from: "founding",    to: "general_launch"  },
    { from: "community",   to: "general_launch"  },
  ];
  for (const { from, to } of tierMaps) {
    const r = await col.updateMany({ tier: from }, { $set: { tier: to } });
    console.log(`tier ${from} → ${to}: ${r.modifiedCount} updated`);
  }

  const statusMaps = [
    { from: "invited",   to: "notified" },
    { from: "onboarded", to: "active"   },
  ];
  for (const { from, to } of statusMaps) {
    const r = await col.updateMany({ status: from }, { $set: { status: to } });
    console.log(`status ${from} → ${to}: ${r.modifiedCount} updated`);
  }

  console.log("Migration complete.");
  await client.close();
}

migrate().catch(err => { console.error(err); process.exit(1); });
