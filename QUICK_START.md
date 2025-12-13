# Quick Start: Deploy Sweet Shop to GitHub, Render & Vercel

## 🚀 Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `Sweet-Shop`
3. Description: "Full-stack Sweet Shop Management System"
4. Make it **Public** (or Private)
5. **DO NOT** check any boxes (no README, .gitignore, or license)
6. Click **"Create repository"**

## 📤 Step 2: Push to GitHub

After creating the repo, run this command:

```bash
git push -u origin main
```

If you get authentication errors:
- Use a **Personal Access Token** instead of password
- Or use GitHub CLI: `gh auth login`

---

## 🗄️ Step 3: Deploy Database on Render (FREE)

1. Go to: https://dashboard.render.com
2. Sign up/Login (use GitHub for easy connection)
3. Click **"New +"** → **"PostgreSQL"**
4. Settings:
   - Name: `sweet-shop-db`
   - Database: `sweet_shop_db`
   - Plan: **Free**
   - Region: Choose closest
5. Click **"Create Database"**
6. Wait 2-3 minutes
7. Once ready, go to database → **"Connect"** tab
8. Copy the **"Internal Database URL"** (save it!)

---

## ⚙️ Step 4: Deploy Backend on Render

1. In Render, click **"New +"** → **"Web Service"**
2. Connect GitHub → Select **"Zygarde641/Sweet-Shop"**
3. Settings:
   - Name: `sweet-shop-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Click **"Advanced"** → Add Environment Variables:

   ```
   DATABASE_URL = <paste Internal Database URL from Step 3>
   JWT_SECRET = <generate random 32+ character string>
   NODE_ENV = production
   FRONTEND_URL = https://your-app.vercel.app (update after Step 5)
   ```

   **Generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. Copy your backend URL (e.g., `https://sweet-shop-backend.onrender.com`)

### Initialize Database:

1. Go to your Web Service → **"Shell"** tab
2. Run:
   ```bash
   psql $DATABASE_URL -f migrations/001_initial_schema.sql
   ```
   Or manually:
   ```bash
   psql $DATABASE_URL
   ```
   Then paste contents of `backend/migrations/001_initial_schema.sql`

---

## 🎨 Step 5: Deploy Frontend on Vercel

1. Go to: https://vercel.com
2. Sign up/Login with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import **"Zygarde641/Sweet-Shop"**
5. Settings:
   - Framework: Vite (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto)
   - Output Directory: `dist` (auto)
6. Add Environment Variables:
   ```
   VITE_API_URL = https://sweet-shop-backend.onrender.com
   ```
   (Use your actual Render backend URL)
7. Click **"Deploy"**
8. Wait 2-3 minutes
9. Copy your frontend URL (e.g., `https://sweet-shop.vercel.app`)

---

## 🔗 Step 6: Connect Everything

1. Go back to Render → Your Backend Service
2. **Environment** tab → Update:
   ```
   FRONTEND_URL = https://your-frontend.vercel.app
   ```
3. Save (auto-redeploys)

---

## ✅ Step 7: Test

1. Open your Vercel frontend URL
2. Register a new account
3. Login
4. You're live! 🎉

---

## 🆓 Free Tier Notes

- **Render**: Backend sleeps after 15 min inactivity (wakes in ~30 sec)
- **Render PostgreSQL**: 90-day free trial
- **Vercel**: Always free for personal projects
- **Alternative DB**: Use Supabase (https://supabase.com) for free PostgreSQL

---

## 📝 Need Help?

Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting!
