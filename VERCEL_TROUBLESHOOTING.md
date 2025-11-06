# How to Check and Trigger Vercel Deployment

## Check Deployment Status

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Find your frontend project (the one with Root Directory: `client`)

2. **Check Deployments Tab**
   - Click on your project
   - Go to the **"Deployments"** tab
   - Look at the latest deployment:
     - ✅ **Green checkmark** = Successfully deployed
     - 🟡 **Yellow circle** = Building/in progress
     - ❌ **Red X** = Failed
     - ⏸️ **Gray** = Cancelled

3. **Check Commit Hash**
   - Click on the latest deployment
   - Look for the commit message: "Fix offline fallback: Hide by default, show only when needed"
   - The commit hash should be `b68113f` or newer

## Verify GitHub Integration

1. **Go to Project Settings**
   - In your Vercel project, click **"Settings"**
   - Click **"Git"** in the sidebar

2. **Check Configuration**
   - **Repository:** Should show `jackrobertspb/rpg-todo-fin`
   - **Production Branch:** Should be `main`
   - **Auto-deploy:** Should be enabled ✅

## Manual Redeploy (If Auto-Deploy Didn't Work)

### Option 1: Via Dashboard
1. Go to **"Deployments"** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for it to finish

### Option 2: Via Deploy Button
1. In your project overview, click **"Deploy"** button
2. Select **"Redeploy"**
3. Choose the latest commit
4. Click **"Redeploy"**

## Check Build Logs

1. Click on any deployment
2. Scroll down to **"Build Logs"**
3. Look for:
   - ✅ "Build Completed"
   - ❌ Any error messages
   - ⚠️ Warnings (usually okay)

## Common Issues

### "No deployments found"
- Make sure you're looking at the correct project
- Check that GitHub integration is connected

### "Build failed"
- Check the build logs for specific errors
- Common issues:
  - Missing environment variables
  - Build command errors
  - Dependency installation failures

### "Deployment succeeded but app doesn't work"
- Check the deployment URL
- Open browser console (F12) for errors
- Verify environment variables are set correctly

## Force a New Deployment

If auto-deploy isn't working, you can trigger it manually:

1. Make a small change to trigger a new commit:
   ```bash
   # Add a comment or whitespace change
   git commit --allow-empty -m "Trigger Vercel deployment"
   git push
   ```

2. Or redeploy directly from Vercel dashboard

## Verify the Fix is Deployed

After redeploying, check:
1. Open your frontend URL
2. Open browser console (F12)
3. Look for:
   - ✅ No "Failed to load module script" errors
   - ✅ App loads normally
   - ❌ If still seeing errors, check the console for new error messages

