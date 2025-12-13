# Deployment Guide: Sweet Shop Management System

This guide will walk you through deploying your Sweet Shop Management System to Render (backend) and Vercel (frontend) with a free PostgreSQL database.

## Prerequisites

- GitHub account (username: Zygarde641)
- Render account (sign up at https://render.com - free tier available)
- Vercel account (sign up at https://vercel.com - free tier available)

---

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Sweet-Shop`
3. Description: "Full-stack Sweet Shop Management System"
4. Make it **Public** (or Private if you prefer)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 1.2 Push Your Code

The code has already been committed locally. Now push it:

```bash
git push -u origin main
```

If you get an authentication error, you may need to:
- Use a Personal Access Token instead of password
- Or use GitHub CLI: `gh auth login`

---

## Step 2: Deploy Backend on Render (with Free PostgreSQL)

### 2.1 Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `sweet-shop-db`
   - **Database**: `sweet_shop_db`
   - **User**: `sweet_shop_user`
   - **Region**: Choose closest to you
   - **Plan**: **Free** (512 MB RAM, 1 GB storage)
4. Click **"Create Database"**
5. **Wait 2-3 minutes** for database to be created
6. Once created, go to the database dashboard
7. Copy the **"Internal Database URL"** (you'll need this later)
   - Format: `postgresql://user:password@hostname:5432/database_name`

### 2.2 Create Web Service (Backend)

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select the repository: **"Zygarde641/Sweet-Shop"**
4. Configure the service:
   - **Name**: `sweet-shop-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **"Advanced"** and add Environment Variables:

   ```
   DATABASE_URL = <paste the Internal Database URL from step 2.1>
   JWT_SECRET = <generate a random long string, at least 32 characters>
   NODE_ENV = production
   FRONTEND_URL = https://your-frontend.vercel.app (we'll update this after deploying frontend)
   PORT = 10000 (Render sets this automatically, but you can specify)
   ```

   **To generate JWT_SECRET**, you can use:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Or use an online generator: https://randomkeygen.com/

6. Click **"Create Web Service"**
7. Render will start building and deploying your backend
8. **Wait 5-10 minutes** for the first deployment
9. Once deployed, copy your backend URL (e.g., `https://sweet-shop-backend.onrender.com`)

### 2.3 Initialize Database Schema

1. Go to your PostgreSQL database dashboard on Render
2. Click on **"Connect"** tab
3. Copy the **"Internal Database URL"**
4. You have two options:

   **Option A: Using Render's Shell (Recommended)**
   - Go to your Web Service dashboard
   - Click **"Shell"** tab
   - Run:
     ```bash
     psql $DATABASE_URL -f migrations/001_initial_schema.sql
     ```
   - Or manually run the SQL:
     ```bash
     psql $DATABASE_URL
     ```
   - Then paste the contents of `backend/migrations/001_initial_schema.sql`

   **Option B: Using Local psql (if you have PostgreSQL installed)**
   - Use the External Database URL from Render
   - Run:
     ```bash
     psql <external-database-url> -f backend/migrations/001_initial_schema.sql
     ```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Connect GitHub to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### 3.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find and select **"Zygarde641/Sweet-Shop"**
3. Click **"Import"**

### 3.3 Configure Frontend

1. **Framework Preset**: Vite (should auto-detect)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (auto-filled)
4. **Output Directory**: `dist` (auto-filled)
5. **Install Command**: `npm install` (auto-filled)

### 3.4 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL = https://sweet-shop-backend.onrender.com
VITE_GOOGLE_CLIENT_ID = (optional, leave empty for now or add your Google OAuth client ID)
```

**Important**: Replace `sweet-shop-backend.onrender.com` with your actual Render backend URL from Step 2.2

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. Once deployed, copy your frontend URL (e.g., `https://sweet-shop.vercel.app`)

### 3.6 Update Backend CORS

1. Go back to Render dashboard
2. Open your backend Web Service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel frontend URL:
   ```
   FRONTEND_URL = https://sweet-shop.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy with the new environment variable

---

## Step 4: Test Your Deployment

### 4.1 Test Frontend

1. Open your Vercel frontend URL
2. You should see the login page
3. Try registering a new account
4. If you get errors, check the browser console (F12)

### 4.2 Test Backend

1. Open: `https://your-backend.onrender.com/health`
2. You should see: `{"status":"ok","message":"Sweet Shop API is running"}`

### 4.3 Test Full Flow

1. Register a new user on the frontend
2. Login
3. You should see the dashboard (empty if no sweets added)
4. If you have admin access, add some sweets

---

## Step 5: Create Admin User (Optional)

To create an admin user, you can:

**Option A: Using Render Shell**
1. Go to your backend Web Service → Shell
2. Run Node:
   ```bash
   node
   ```
3. Then:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your-admin-password', 10);
   console.log(hash);
   ```
4. Copy the hash, then connect to database:
   ```bash
   psql $DATABASE_URL
   ```
5. Insert admin user:
   ```sql
   INSERT INTO users (email, password, name, role) 
   VALUES ('admin@example.com', '<paste-hash-here>', 'Admin User', 'admin');
   ```

**Option B: Modify Registration (Temporary)**
- Temporarily modify the backend to allow admin registration
- Register, then change it back

---

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Render logs: Go to your Web Service → Logs
- Verify all environment variables are set correctly
- Check that DATABASE_URL is correct

**Problem**: Database connection errors
- Verify DATABASE_URL uses Internal Database URL (for Render services)
- Check that database is fully created (wait a few minutes)
- Ensure database schema is initialized

**Problem**: CORS errors
- Verify FRONTEND_URL in backend environment variables matches your Vercel URL exactly
- Check that frontend is using the correct VITE_API_URL

### Frontend Issues

**Problem**: Can't connect to backend
- Check VITE_API_URL in Vercel environment variables
- Verify backend is running (check Render logs)
- Check browser console for specific error messages

**Problem**: 401 Unauthorized errors
- Clear browser localStorage
- Try logging in again
- Check that JWT_SECRET is set in backend

### Database Issues

**Problem**: Tables don't exist
- Run the migration SQL manually
- Check Render database dashboard → Connect → Use psql

**Problem**: Can't connect to database
- Use Internal Database URL for Render services
- External URL is only for local connections

---

## Free Tier Limits

### Render Free Tier
- **Web Services**: Sleeps after 15 minutes of inactivity (takes ~30 seconds to wake up)
- **PostgreSQL**: 90 days free trial, then $7/month (or use external free database)
- **Bandwidth**: 100 GB/month

### Vercel Free Tier
- **Bandwidth**: 100 GB/month
- **Builds**: Unlimited
- **Deployments**: Unlimited

### Alternative: Free PostgreSQL Options

If Render's free tier expires, consider:
1. **Supabase** (https://supabase.com) - Free PostgreSQL database
2. **Neon** (https://neon.tech) - Free PostgreSQL with generous limits
3. **Railway** (https://railway.app) - Free PostgreSQL included

To use external database:
1. Create database on Supabase/Neon
2. Get connection string
3. Update DATABASE_URL in Render environment variables

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy backend on Render
3. ✅ Deploy frontend on Vercel
4. ✅ Connect database
5. ✅ Test the application
6. ✅ Share your live URLs!

---

## Quick Reference URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: Managed by Render (internal access only)

---

## Support

If you encounter issues:
1. Check Render logs (Web Service → Logs)
2. Check Vercel build logs (Project → Deployments → Click on deployment)
3. Check browser console (F12 → Console tab)
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀
