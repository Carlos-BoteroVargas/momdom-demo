# MomDom Demo — Netlify + MongoDB Atlas

Landing page · Waitlist signup · Admin dashboard  
Built for demo deployment. Short-lived, no commitments.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Static HTML (one file) |
| Functions | Netlify Functions (Node 18, ES modules) |
| Database | MongoDB Atlas M0 (free tier, permanent) |
| Hosting | Netlify (free tier) |

---

## Step 1 — MongoDB Atlas Setup (5 min)

### 1a. Create a free cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Sign up / Log in
2. Click **"Build a Database"**
3. Choose **M0 Free** (no credit card needed)
4. Pick a cloud provider (AWS recommended) and region closest to you
5. Name the cluster: `momdom-demo`
6. Click **Create**

### 1b. Create a database user

1. In the left sidebar → **Security → Database Access**
2. Click **"Add New Database User"**
3. Authentication: **Password**
4. Username: `momdom_app`
5. Password: generate a strong one, **save it** — you'll need it shortly
6. Role: **Atlas admin** (for demo simplicity)
7. Click **Add User**

### 1c. Allow network access

1. In the left sidebar → **Security → Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   > This is fine for a demo. For production, you'd restrict to Netlify's IPs.
4. Click **Confirm**

### 1d. Get your connection string

1. In the left sidebar → **Deployment → Database**
2. Click **Connect** on your cluster
3. Choose **"Drivers"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://momdom_app:<password>@momdom-demo.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you created in step 1b

**Save this string** — it's your `MONGODB_URI`.

---

## Step 2 — Create the GitHub repo

```bash
# In your terminal, from this folder:
git init
git add .
git commit -m "Initial MomDom demo"

# Create a new repo on GitHub (momdom-demo or similar)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/momdom-demo.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Deploy to Netlify

### 3a. Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com) → Log in
2. Click **"Add new site" → "Import an existing project"**
3. Choose **GitHub** → select your `momdom-demo` repo
4. Build settings (Netlify auto-detects from `netlify.toml`):
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
5. Click **"Deploy site"**

### 3b. Set environment variables

1. After deploy → **Site settings → Environment variables**
2. Add these two variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string from Step 1d |
| `ADMIN_PASSWORD` | A password of your choice (e.g. `momdom2026`) |

3. Click **Save**, then **Trigger redeploy** (Deploys tab → Trigger deploy)

---

## Step 4 — Test it

Once deployed, your site URL will be something like `https://momdom-demo-xxx.netlify.app`

- **Landing page:** `https://your-site.netlify.app`
- **Admin dashboard:** Click "Admin ↗" in the nav (or go to `/#admin`)
  - Password = whatever you set as `ADMIN_PASSWORD`

### Test the signup flow
1. Enter an email on the landing page
2. You should see your tier and position number
3. Go to the Admin dashboard to see the signup appear

---

## Local development (optional)

```bash
npm install
npx netlify login        # first time only
npx netlify link         # link to your Netlify site

# Create .env for local dev
echo 'MONGODB_URI=your_connection_string_here' > .env
echo 'ADMIN_PASSWORD=momdom2026' >> .env

npm run dev              # starts on http://localhost:8888
```

---

## File structure

```
momdom-demo/
├── netlify.toml                  ← routing + build config
├── package.json
├── netlify/functions/
│   ├── _db.js                    ← shared MongoDB connection
│   ├── signup.js                 ← POST /api/signup
│   ├── signups.js                ← GET  /api/signups (admin, password-protected)
│   └── stats.js                  ← GET  /api/stats  (admin, password-protected)
└── public/
    └── index.html                ← entire frontend (landing + waitlist + admin)
```

---

## MongoDB collection created automatically

Collection: `momdom_demo.waitlist`

Each signup document:
```json
{
  "email": "mom@example.com",
  "firstName": null,
  "position": 1,
  "tier": "trailblazer",
  "discount": 40,
  "status": "pending",
  "utm_source": "direct",
  "utm_medium": null,
  "utm_campaign": null,
  "referralCode": null,
  "createdAt": "2026-03-26T...",
  "updatedAt": "2026-03-26T..."
}
```

---

## Migrating your existing Google Sheet signups

Once you have Atlas running, you can import your existing signups:

1. Export your Google Sheet as CSV
2. In Atlas → Browse Collections → `waitlist` → **INSERT DOCUMENT**
   - Or use **mongoimport** from terminal:
   ```bash
   mongoimport --uri "your_connection_string" \
     --db momdom_demo --collection waitlist \
     --type csv --headerline --file signups.csv
   ```
3. Run a quick script to backfill `position`, `tier`, and `discount` fields
   (happy to write this for you)

---

## Notes for the demo

- The admin password lives in the `ADMIN_PASSWORD` env variable — never in code
- MongoDB Atlas M0 is permanently free (512MB limit — more than enough for thousands of signups)
- Netlify free tier supports 125k function calls/month — plenty for a demo
- The collection and indexes are created automatically on first signup
