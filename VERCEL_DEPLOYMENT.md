# Quick Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub/GitLab/Bitbucket repository (push your code first)
- Supabase project already set up

---

## Step 1: Deploy Backend (Express API)

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Sign in or create account

2. **Import Your Repository**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your `rpg-todo-main` repository

3. **Configure Backend Project**
   - **Framework Preset:** Other
   - **Root Directory:** `server` ⚠️ Important!
   - **Build Command:** `npm install` (or leave empty)
   - **Output Directory:** (leave empty)
   - **Install Command:** (leave default)

4. **Add Environment Variables** (Click "Environment Variables")
   ```
   SUPABASE_URL=https://uwxabqpwijhsgyiaioug.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3eGFicXB3aWpoc2d5aWFpb3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTM4NjYsImV4cCI6MjA3NzQ4OTg2Nn0._7qRTO_afRhlCvjQWdpnow9_WgAYe8TRKPZqGaCuzuw
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3eGFicXB3aWpoc2d5aWFpb3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkxMzg2NiwiZXhwIjoyMDc3NDg5ODY2fQ.FW0wMdb-UH0O1-a-HAZ2BHqLOjFY44aV2o9Fb97Z_3o
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
   ⚠️ **Note:** You'll update `CLIENT_URL` after deploying the frontend

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - **Copy the deployment URL** (e.g., `https://rpg-todo-backend.vercel.app`)
   - You'll need this for the frontend!

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to server directory
cd server

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NODE_ENV production

# Deploy to production
vercel --prod
```

---

## Step 2: Deploy Frontend (React/Vite)

### Option A: Via Vercel Dashboard (Recommended)

1. **Create New Project**
   - Go to https://vercel.com/new
   - Import the **same** repository (`rpg-todo-main`)

2. **Configure Frontend Project**
   - **Framework Preset:** Vite ⚠️ Important!
   - **Root Directory:** `client` ⚠️ Important!
   - **Build Command:** `npm run build` (should auto-detect)
   - **Output Directory:** `dist` (should auto-detect)
   - **Install Command:** (leave default)

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   VITE_SUPABASE_URL=https://uwxabqpwijhsgyiaioug.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3eGFicXB3aWpoc2d5aWFpb3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTM4NjYsImV4cCI6MjA3NzQ4OTg2Nn0._7qRTO_afRhlCvjQWdpnow9_WgAYe8TRKPZqGaCuzuw
   ```
   ⚠️ **Replace** `your-backend-url.vercel.app` with your actual backend URL from Step 1!

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - **Copy the frontend URL** (e.g., `https://rpg-todo.vercel.app`)

### Option B: Via Vercel CLI

```bash
# Navigate to client directory
cd client

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add VITE_API_URL production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Deploy to production
vercel --prod
```

---

## Step 3: Update Backend CORS

After deploying the frontend, update the backend's `CLIENT_URL`:

1. Go to your **backend** project in Vercel dashboard
2. Settings → Environment Variables
3. Update `CLIENT_URL` to your frontend URL:
   ```
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
4. **Redeploy** the backend (go to Deployments → Redeploy latest)

---

## Step 4: Configure Supabase Redirect URLs

1. Go to your Supabase Dashboard
2. Navigate to **Authentication → URL Configuration**
3. Update **Site URL:** `https://your-frontend-url.vercel.app`
4. Add to **Redirect URLs:**
   ```
   https://your-frontend-url.vercel.app/**
   https://your-frontend-url.vercel.app
   ```
5. Save changes

---

## Step 5: Test Your Deployment

Visit your frontend URL and test:
- ✅ Register a new account
- ✅ Login
- ✅ Create tasks
- ✅ Complete tasks (check XP gain)
- ✅ View achievements
- ✅ Check profile page

---

## Troubleshooting

### Backend Issues

**"Cannot find module" or build fails:**
- Make sure Root Directory is set to `server`
- Check that `vercel.json` exists in `server/` directory
- Verify all environment variables are set

**CORS errors:**
- Make sure `CLIENT_URL` matches your frontend URL exactly
- Redeploy backend after updating `CLIENT_URL`

### Frontend Issues

**404 on page refresh:**
- The `client/vercel.json` file should handle this automatically
- If not, verify the file exists with the rewrite rules

**API calls fail:**
- Check `VITE_API_URL` includes `/api` at the end
- Verify backend is deployed and accessible
- Check browser console for errors

**Authentication issues:**
- Verify Supabase redirect URLs are updated
- Check environment variables are correct
- Make sure Supabase project is active

---

## Environment Variables Summary

### Backend (`server/` project)
```
SUPABASE_URL=https://uwxabqpwijhsgyiaioug.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Frontend (`client/` project)
```
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_SUPABASE_URL=https://uwxabqpwijhsgyiaioug.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Quick Checklist

- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set (with backend URL)
- [ ] Backend `CLIENT_URL` updated to frontend URL
- [ ] Backend redeployed after CORS update
- [ ] Supabase redirect URLs updated
- [ ] Tested registration/login
- [ ] Tested creating/completing tasks

---

**🎉 Your app should now be live on Vercel!**

