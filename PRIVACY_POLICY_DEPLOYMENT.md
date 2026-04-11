# Privacy Policy Deployment Guide

## Step-by-Step Instructions to Deploy on GitHub Pages

### 1. Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the **"+"** icon in the top-right corner → **"New repository"**
3. Fill in the details:
   - **Repository name:** `synclexia-privacy-policy`
   - **Description:** "Privacy Policy for Synclexia App"
   - **Visibility:** ✅ Public (required for GitHub Pages free hosting)
   - **Initialize:** ❌ Don't add README, .gitignore, or license
4. Click **"Create repository"**

### 2. Upload the Privacy Policy File

**Option A: Using GitHub Web Interface (Easiest)**
1. In your new repository, click **"uploading an existing file"**
2. Drag and drop the `index.html` file from `c:\Users\James Kevin Velasco\Synclexia\index.html`
3. Add commit message: "Add privacy policy"
4. Click **"Commit changes"**

**Option B: Using Git Command Line**
```bash
# Navigate to a new directory for the privacy policy repo
cd c:\Users\James Kevin Velasco\
mkdir synclexia-privacy-policy
cd synclexia-privacy-policy

# Copy the index.html file here
copy "..\Synclexia\index.html" .

# Initialize git and push
git init
git add index.html
git commit -m "Add privacy policy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/synclexia-privacy-policy.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. In your repository, go to **Settings** (top menu)
2. Scroll down to **"Pages"** in the left sidebar
3. Under **"Source"**, select:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **"Save"**
5. Wait 1-2 minutes for deployment
6. GitHub will show your URL: `https://YOUR_USERNAME.github.io/synclexia-privacy-policy/`

### 4. Verify the Privacy Policy

1. Visit the GitHub Pages URL
2. Confirm the privacy policy displays correctly
3. Test on mobile devices to ensure responsiveness

### 5. Add URL to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your **Synclexia** app
3. Navigate to **App content** → **Privacy policy**
4. Paste your GitHub Pages URL:
   ```
   https://YOUR_USERNAME.github.io/synclexia-privacy-policy/
   ```
5. Click **"Save"**

### 6. Add URL to Apple App Store Connect (iOS)

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your **Synclexia** app
3. Go to **App Information**
4. Add Privacy Policy URL:
   ```
   https://YOUR_USERNAME.github.io/synclexia-privacy-policy/
   ```
5. Click **"Save"**

---

## Alternative Hosting Options

If you prefer not to use GitHub Pages:

### Option 1: Netlify (Free)
1. Sign up at [netlify.com](https://www.netlify.com)
2. Drag and drop the `index.html` file
3. Get instant URL: `https://your-site.netlify.app`

### Option 2: Vercel (Free)
1. Sign up at [vercel.com](https://vercel.com)
2. Import from GitHub or upload directly
3. Get instant URL: `https://your-site.vercel.app`

### Option 3: Your Own Domain
1. Purchase a domain (e.g., `synclexia.com`)
2. Host the `index.html` file on any web server
3. Use `https://synclexia.com/privacy` or similar

---

## Updating the Privacy Policy

When you need to update the privacy policy:

1. Edit the `index.html` file
2. Update the **"Last Updated"** date at the top
3. Commit and push changes to GitHub (or re-upload)
4. Changes will automatically reflect on GitHub Pages within minutes
5. **No need to update the URL** in Play Console/App Store

---

## Important Notes

✅ **Keep the repository PUBLIC** - Required for free GitHub Pages hosting  
✅ **Use HTTPS URLs only** - Both Play Store and App Store require secure URLs  
✅ **Test on mobile** - Ensure the policy is readable on all devices  
✅ **Keep it updated** - Review and update the policy when adding new features  
✅ **Notify users** - If you make significant changes, notify users via in-app update

---

## Quick Reference

**Repository Name:** `synclexia-privacy-policy`  
**File Name:** `index.html`  
**Expected URL:** `https://YOUR_USERNAME.github.io/synclexia-privacy-policy/`  
**Current Version:** 1.1.0  
**Last Updated:** April 2, 2026  

---

## Need Help?

If you encounter issues:
- Check that the repository is **public**
- Verify GitHub Pages is enabled in **Settings → Pages**
- Wait 2-5 minutes for initial deployment
- Clear your browser cache if changes don't appear
- Check the **Actions** tab in GitHub for build status
