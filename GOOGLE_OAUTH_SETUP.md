# Google OAuth Setup - Step by Step

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing):**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: `Sweet Shop` (or any name)
   - Click "Create"
   - Wait for project to be created, then select it

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "People API"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - **User Type**: External (for testing) or Internal (if you have Google Workspace)
     - Click "Create"
     - **App name**: `Sweet Shop Management System`
     - **User support email**: Your email
     - **Developer contact**: Your email
     - Click "Save and Continue"
     - **Scopes**: Click "Add or Remove Scopes"
       - Select: `.../auth/userinfo.email`
       - Select: `.../auth/userinfo.profile`
       - Click "Update" → "Save and Continue"
     - **Test users**: Add your email (for testing)
     - Click "Save and Continue" → "Back to Dashboard"

5. **Create OAuth Client ID:**
   - Application type: **Web application**
   - Name: `Sweet Shop Web Client`
   - **Authorized JavaScript origins:**
     - Add: `https://sweet-shop-sigma.vercel.app`
     - Add: `http://localhost:5173` (for local development)
   - **Authorized redirect URIs:**
     - Add: `https://sweet-shop-sigma.vercel.app` (Vercel handles this)
     - Add: `http://localhost:5173` (for local development)
   - Click "Create"

6. **Copy Your Credentials:**
   - You'll see a popup with:
     - **Client ID**: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
     - **Client secret**: (you won't need this for frontend-only OAuth)
   - **Copy the Client ID** - you'll need this!

---

## Step 2: Add Client ID to Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: `Sweet-Shop`

2. **Add Environment Variable:**
   - Go to "Settings" → "Environment Variables"
   - Click "Add New"
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Paste your Google Client ID from Step 1
   - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

3. **Redeploy:**
   - Go to "Deployments"
   - Click the "..." menu on latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger auto-deploy

---

## Step 3: Update Backend to Handle Google OAuth

You'll need to add a backend endpoint to verify Google tokens and create/login users.

### Backend Route (Add to `backend/src/routes/auth.ts`):

```typescript
router.post(
  '/google',
  [body('token').notEmpty().withMessage('Token is required')],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      
      // Verify Google token (you'll need to install google-auth-library)
      // For now, this is a placeholder
      // You'll need to: npm install google-auth-library
      
      // const { OAuth2Client } = require('google-auth-library');
      // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      // const ticket = await client.verifyIdToken({ idToken: token });
      // const payload = ticket.getPayload();
      
      res.json({ message: 'Google OAuth endpoint - implement token verification' });
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  }
);
```

---

## Step 4: Update Frontend to Use Google OAuth

The frontend is already set up with `@react-oauth/google`. You just need to:

1. **Make sure Client ID is loaded:**
   - Check `frontend/src/main.tsx` - it should read from `import.meta.env.VITE_GOOGLE_CLIENT_ID`

2. **Update Login/Register pages:**
   - The Google login button is already there
   - It just needs the backend endpoint to be implemented

---

## Quick Setup Summary

1. ✅ Create Google Cloud Project
2. ✅ Enable Google+ API
3. ✅ Create OAuth 2.0 Client ID
4. ✅ Add `VITE_GOOGLE_CLIENT_ID` to Vercel
5. ✅ Redeploy frontend
6. ⚠️ Implement backend Google token verification (optional for now)

---

## Testing

1. After adding the Client ID to Vercel and redeploying:
2. Open your frontend: `https://sweet-shop-sigma.vercel.app/login`
3. Click "Continue with Google"
4. You should see Google's login popup
5. After login, you'll get a token (backend needs to handle it)

---

## Note

The Google OAuth button will work (show Google login), but you'll need to implement the backend token verification to actually create/login users. For now, you can use regular email/password registration and login.
