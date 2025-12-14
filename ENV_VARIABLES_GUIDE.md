# Environment Variables Guide

## Backend (Render) Environment Variables

### Required Variables:

1. **DATABASE_URL**
   - Format: `postgresql://user:password@host:port/database`
   - Example: `postgresql://sweet_shop_user:password@dpg-xxxxx-a/sweet_shop_db_uvfy`
   - ✅ **Your current value looks correct**

2. **FRONTEND_URL**
   - Format: `https://your-frontend-domain.vercel.app` (NO trailing slash)
   - Current: `https://sweet-shop-sigma.vercel.app/` ❌ **Has trailing slash - remove it!**
   - Should be: `https://sweet-shop-sigma.vercel.app` ✅
   - **Action Required**: Remove the trailing slash `/` from this value

3. **JWT_SECRET**
   - Format: Any random string (at least 32 characters recommended)
   - ✅ **Your current value looks correct**

4. **NODE_ENV**
   - Value: `production`
   - ✅ **Your current value is correct**

5. **PORT** (Optional)
   - Render sets this automatically, but you can specify if needed
   - Default: Render will set this

## Frontend (Vercel) Environment Variables

### Required Variables:

1. **VITE_API_URL**
   - Format: `https://your-backend.onrender.com` (NO trailing slash)
   - Current: `https://sweet-shop-backend-fcnj.onrender.com` ✅ **Looks correct**
   - **Note**: The warning icon in Vercel is normal - it's just indicating this is a build-time variable

2. **VITE_GOOGLE_CLIENT_ID** (Optional)
   - Only needed if you want Google OAuth
   - Currently not implemented on backend, so can be removed
   - Format: `xxxxx-xxxxx.apps.googleusercontent.com`

## Fix Required

**In Render Dashboard:**
1. Go to your backend service → Environment
2. Find `FRONTEND_URL`
3. Change from: `https://sweet-shop-sigma.vercel.app/`
4. Change to: `https://sweet-shop-sigma.vercel.app` (remove trailing slash)
5. Save and redeploy

This trailing slash can cause CORS issues and prevent the frontend from communicating with the backend properly.
