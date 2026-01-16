# 🚀 Deployment Guide - Vercel + Railway

## Overview

This guide will help you deploy your Event Attendance System to production:
- **Frontend**: Vercel (free tier)
- **Backend**: Railway (free tier with PostgreSQL database)

**Total Time**: ~20 minutes

---

## Prerequisites

Before you begin:
- ✅ GitHub account
- ✅ Git installed and project committed to a repository
- ✅ Email address for Railway and Vercel accounts

---

## Part 1: Deploy Backend to Railway (10 minutes)

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not already connected
4. Select your repository: `event-attendance-system` (or your repo name)
5. Railway will detect it's a Node.js project

### Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Railway will create a PostgreSQL database automatically
5. Wait for the database to be provisioned (~30 seconds)

### Step 4: Configure Backend Service

1. Click on your backend service (the one from GitHub)
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Set it to: `backend`
5. Scroll to **"Start Command"**
6. Verify it shows: `npm start`

### Step 5: Set Environment Variables

1. In your backend service, go to **"Variables"** tab
2. Click **"+ New Variable"** and add each of these:

```
NODE_ENV=production
PORT=5000
API_PREFIX=/api

# Database (Railway will auto-populate these from PostgreSQL service)
DB_DIALECT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}

# OR manually set these if DATABASE_URL doesn't work:
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string_min_32_chars
JWT_EXPIRY=24h

# CORS (we'll update this after deploying frontend)
CORS_ORIGIN=*

# QR Code API
QR_API_BASE_URL=https://api.qrserver.com/v1
QR_CODE_SIZE=300x300

# Other settings
BCRYPT_ROUNDS=10
LOG_LEVEL=info
```

**Important**: 
- Replace `JWT_SECRET` with a random 32+ character string
- You can generate one at [randomkeygen.com](https://randomkeygen.com/)

### Step 6: Link Database to Backend

1. In your backend service, go to **"Settings"** tab
2. Scroll to **"Service Variables"**
3. Click **"+ Reference"**
4. Select your PostgreSQL database
5. This will automatically add database connection variables

### Step 7: Deploy Backend

1. Go to **"Deployments"** tab
2. Railway will automatically deploy when you push to GitHub
3. Or click **"Deploy"** to trigger manual deployment
4. Wait for deployment to complete (~2-3 minutes)
5. Check the **"Logs"** tab for any errors

### Step 8: Run Database Migrations

1. In your backend service, go to **"Settings"** tab
2. Scroll to **"Deploy"** section
3. Under **"Custom Start Command"**, temporarily change to:
   ```
   npm run migrate && npm start
   ```
4. Redeploy the service
5. After successful deployment, you can remove the migration command

**Alternative**: Use Railway CLI to run migrations manually:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run migrate
```

### Step 9: Get Backend URL

1. In your backend service, go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Railway will give you a URL like: `your-app.railway.app`
5. **Copy this URL** - you'll need it for the frontend!

### Step 10: Test Backend

1. Open your browser
2. Go to: `https://your-app.railway.app/health`
3. You should see: `{"status":"ok","env":"production"}`

✅ **Backend deployed successfully!**

---

## Part 2: Deploy Frontend to Vercel (5 minutes)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository in the list
3. Click **"Import"**

### Step 3: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Set Environment Variables

1. Scroll to **"Environment Variables"**
2. Add this variable:

```
Name: VITE_API_URL
Value: https://your-backend-url.railway.app/api
```

**Replace** `your-backend-url.railway.app` with your actual Railway backend URL from Part 1, Step 9.

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend (~2-3 minutes)
3. Watch the build logs for any errors

### Step 6: Get Frontend URL

1. After deployment completes, Vercel will show your URL
2. It will be something like: `your-app.vercel.app`
3. Click on the URL to open your application

### Step 7: Update CORS on Backend

1. Go back to Railway
2. Open your backend service
3. Go to **"Variables"** tab
4. Update the `CORS_ORIGIN` variable:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
5. Replace with your actual Vercel URL
6. The backend will automatically redeploy

✅ **Frontend deployed successfully!**

---

## Part 3: Test Deployed Application (5 minutes)

### Test Checklist

1. **Open your Vercel URL** in a browser
2. **Register a new user**
   - Should redirect to login after success
3. **Login with credentials**
   - Should redirect to dashboard
4. **Create an event group**
   - Should appear in the list
5. **Create an event**
   - Should generate access code and QR code
6. **Open check-in page** (in incognito window)
   - Test text code check-in
   - Test QR code scanner (requires HTTPS ✅)
7. **View attendance**
   - Should show check-ins
8. **Export CSV/XLSX**
   - Files should download

### Common Issues

**Issue**: CORS errors in browser console
- **Fix**: Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly (including `https://`)

**Issue**: API calls failing
- **Fix**: Check `VITE_API_URL` in Vercel environment variables includes `/api` at the end

**Issue**: Database connection errors
- **Fix**: Verify PostgreSQL service is running in Railway and linked to backend

**Issue**: QR scanner not working
- **Fix**: This is normal - QR scanner requires HTTPS, which Vercel provides ✅

---

## Part 4: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. In Vercel project, go to **"Settings"** → **"Domains"**
2. Enter your domain name
3. Follow DNS configuration instructions
4. Update `CORS_ORIGIN` in Railway to include your custom domain

### Add Custom Domain to Railway

1. In Railway backend service, go to **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Configure DNS as instructed
5. Update `VITE_API_URL` in Vercel to use your custom domain

---

## Part 5: Continuous Deployment

### Automatic Deployments

Both Vercel and Railway support automatic deployments:

1. **Push to GitHub** → Both platforms auto-deploy
2. **Pull Request** → Vercel creates preview deployments
3. **Merge to main** → Production deployment

### Manual Deployment

**Vercel**:
- Go to project → "Deployments" → "Redeploy"

**Railway**:
- Go to service → "Deployments" → "Deploy"

---

## Monitoring & Logs

### View Logs

**Railway Backend**:
1. Go to your backend service
2. Click **"Deployments"** tab
3. Click on latest deployment
4. View real-time logs

**Vercel Frontend**:
1. Go to your project
2. Click **"Deployments"** tab
3. Click on latest deployment
4. View build and runtime logs

### Monitor Performance

**Railway**:
- View CPU, Memory, Network usage in the "Metrics" tab

**Vercel**:
- View analytics in the "Analytics" tab (may require upgrade)

---

## Cost Breakdown

### Free Tier Limits

**Railway** (Free Trial):
- $5 credit per month
- Enough for small projects
- PostgreSQL database included
- After trial: ~$5-10/month for small apps

**Vercel** (Hobby - Free):
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless functions included
- Perfect for frontend hosting

**Total Cost**: $0 initially, ~$5-10/month after Railway trial

---

## Backup & Security

### Database Backups

**Railway**:
1. Go to PostgreSQL service
2. Click **"Data"** tab
3. Click **"Backup"** to create manual backup
4. Automatic backups available on paid plans

### Environment Variables Security

- ✅ Never commit `.env` files to Git
- ✅ Use Railway/Vercel dashboards to manage secrets
- ✅ Rotate JWT_SECRET periodically
- ✅ Use strong database passwords

---

## Troubleshooting

### Backend Issues

**Problem**: Migrations not running
```bash
# Use Railway CLI
railway run npm run migrate
```

**Problem**: Database connection timeout
- Check if PostgreSQL service is running
- Verify DATABASE_URL is correctly set

### Frontend Issues

**Problem**: Blank page after deployment
- Check browser console for errors
- Verify VITE_API_URL is set correctly
- Check build logs in Vercel

**Problem**: API calls return 404
- Verify backend URL includes `/api`
- Check CORS settings

---

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Share URLs with your professor/team
3. ✅ Monitor logs for errors
4. ✅ Set up custom domain (optional)
5. ✅ Enable analytics (optional)
6. ✅ Create database backups

---

## URLs to Save

After deployment, save these URLs:

```
Frontend: https://your-app.vercel.app
Backend API: https://your-backend.railway.app/api
Health Check: https://your-backend.railway.app/health
Check-In Page: https://your-app.vercel.app/check-in
```

---

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)

---

**Deployment Complete! 🎉**

Your Event Attendance System is now live and accessible from anywhere!
