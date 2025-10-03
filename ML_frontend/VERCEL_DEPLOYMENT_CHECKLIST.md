# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Steps (COMPLETED)

- ✅ Fixed vite.config.js with polyfills
- ✅ Added vercel.json for SPA routing
- ✅ Pushed changes to GitHub
- ✅ Created .env.production template

---

## 📋 CURRENT TASK: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Select your project: **MedPath**
3. Click: **Settings** → **Environment Variables**

### Step 2: Add These Variables (Copy-Paste from .env.production)

```bash
# API URLs - TEMPORARY (Update after backend deployment)
VITE_AUTH_API_URL=https://your-backend-url.onrender.com/api
VITE_ML_API_URL=https://your-backend-url.onrender.com
VITE_NEET_API_URL=https://your-backend-url.onrender.com
VITE_NEET_BACKEND_PORT=443
VITE_API_TIMEOUT=30000

# Google OAuth (CRITICAL!)
VITE_GOOGLE_CLIENT_ID=949440451657-d2kb359v20cu0ii7ngs2avlbm2bb2d8m.apps.googleusercontent.com

# Razorpay Payment (CRITICAL!)
VITE_RAZORPAY_KEY_ID=rzp_test_RO7fuROP8GTo31

# App Configuration
VITE_APP_NAME=MedPath
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION=AI-Powered NEET College Finder
VITE_APP_URL=https://medpath-9ejxugm6i-harsh-mishras-projects-98c00e4d.vercel.app

# Production Settings
VITE_NODE_ENV=production
VITE_DEBUG=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_PDF_EXPORT=true
VITE_ENABLE_NEET_FINDER=true
```

**For each variable:**
- Click "Add New"
- Name: `VITE_GOOGLE_CLIENT_ID` (for example)
- Value: `949440451657-d2kb359v20cu0ii7ngs2avlbm2bb2d8m.apps.googleusercontent.com`
- Environment: Select **ALL** (Production, Preview, Development)
- Click "Save"

---

## 🔐 Step 3: Update Google OAuth Console

### IMPORTANT: Add Vercel URL to Google Console

1. Go to: https://console.cloud.google.com/
2. Navigate: **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click **Edit**
5. Under **Authorized JavaScript origins**, add:
   ```
   https://medpath-9ejxugm6i-harsh-mishras-projects-98c00e4d.vercel.app
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   https://medpath-9ejxugm6i-harsh-mishras-projects-98c00e4d.vercel.app
   https://medpath-9ejxugm6i-harsh-mishras-projects-98c00e4d.vercel.app/
   ```
7. Click **Save**

---

## 🔄 Step 4: Redeploy

After adding environment variables:

**Option A: Automatic**
- Vercel will auto-detect changes and redeploy

**Option B: Manual**
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **⋮** (three dots)
4. Click **Redeploy**
5. Confirm

---

## 🎯 Step 5: Verify Deployment

After redeployment completes:

1. **Check Console Logs:**
   - Open: https://medpath-9ejxugm6i-harsh-mishras-projects-98c00e4d.vercel.app
   - Press `F12` (Developer Tools)
   - Check Console tab
   - Should see: `🚀 Environment configuration loaded successfully`

2. **Test Key Features:**
   - ✅ Homepage loads
   - ✅ No "Request undefined" error
   - ✅ Google login button shows
   - ✅ Razorpay loads (if payment feature exists)

3. **Check Network Tab:**
   - Look for API calls
   - Should show your backend URL (not localhost)

---

## ⚠️ Common Issues & Solutions

### Issue 1: Still showing blank screen
**Solution:** Check browser console for errors. Usually missing env vars.

### Issue 2: Google login not working
**Solution:** Verify Google Console has Vercel URL in authorized origins.

### Issue 3: API calls failing
**Reason:** Backend not deployed yet or backend URL incorrect.
**Solution:** 
- Option A: Deploy backend first, then update env vars
- Option B: Temporarily use localhost (only for testing, won't work in production)

### Issue 4: site.webmanifest 401 error
**Solution:** Already fixed in vercel.json. Should work after redeploy.

---

## 📝 Post-Deployment TODO

- [ ] Add environment variables to Vercel
- [ ] Update Google OAuth Console
- [ ] Trigger redeploy
- [ ] Verify no console errors
- [ ] Test Google login
- [ ] **Deploy backend** (if not done yet)
- [ ] Update `VITE_AUTH_API_URL`, `VITE_ML_API_URL`, `VITE_NEET_API_URL` with real backend URL
- [ ] Redeploy again after backend URL update

---

## 🎉 Success Criteria

✅ No blank screen
✅ No "Cannot destructure 'Request'" error
✅ No site.webmanifest 401 error
✅ Environment variables loaded
✅ Google OAuth working
✅ Razorpay keys loaded
✅ API calls pointing to correct backend

---

## 🆘 Need Help?

If still facing issues, check:
1. Vercel build logs: Deployments → Click deployment → Build Logs
2. Vercel function logs: If using serverless functions
3. Browser console: F12 → Console tab
4. Network tab: Check API call URLs

---

**Current Status:** ⏳ Waiting for environment variables to be added to Vercel
