# PlumbPro - Vercel Deployment Guide (Free Subdomain)

## Overview
Deploy PlumbPro to Vercel for free with a `plumbpro.vercel.app` subdomain.
Your app will be live and accessible to paying customers immediately.

---

## Prerequisites
1. A **GitHub account** (free at github.com)
2. A **Vercel account** (free at vercel.com — sign up with GitHub)
3. Your PlumbPro code pushed to a GitHub repository

## Step 1: Save Code to GitHub
1. In Emergent, click the **"Save to GitHub"** button in the chat input
2. Follow the prompts to create a new repository (e.g., `plumbpro-app`)
3. Your code will be pushed to GitHub

## Step 2: Set Up Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account

## Step 3: Import Project to Vercel
1. In the Vercel dashboard, click **"Add New" → "Project"**
2. Select your `plumbpro-app` repository from the list
3. Configure the project:

### Frontend Deployment Settings
```
Framework Preset: Create React App
Root Directory: frontend
Build Command: yarn build
Output Directory: build
Install Command: yarn install
```

### Environment Variables (Add these in Vercel)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

> **Note**: Vercel is great for frontend hosting. For the backend (FastAPI + MongoDB),
> you'll need a separate service. See Step 5.

## Step 4: Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Your app will be live at: **https://plumbpro.vercel.app**

> If `plumbpro` is taken, try: `plumbpro-app`, `getplumbpro`, `plumbprofield`, etc.

## Step 5: Backend Deployment Options

Your FastAPI backend needs a Python-compatible hosting service:

### Option A: Railway (Recommended - Easiest)
1. Go to [railway.app](https://railway.app) — sign up with GitHub
2. Click **"New Project" → "Deploy from GitHub Repo"**
3. Select your repo, set the root directory to `backend`
4. Add environment variables:
   ```
   MONGO_URL=mongodb+srv://your-atlas-connection-string
   JWT_SECRET=your-secret-key
   STRIPE_SECRET_KEY=your-stripe-key
   STRIPE_WEBHOOK_SECRET=your-webhook-secret
   EMERGENT_API_KEY=your-emergent-key
   ```
5. Railway gives you a free URL like: `plumbpro-backend.up.railway.app`
6. Update your Vercel frontend `REACT_APP_BACKEND_URL` to this URL

### Option B: Render (Free Tier Available)
1. Go to [render.com](https://render.com) — sign up with GitHub
2. Create a **"New Web Service"** from your repo
3. Set root directory to `backend`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Add the same environment variables as above

### Option C: Fly.io
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in the backend directory
3. Set secrets: `fly secrets set MONGO_URL=... JWT_SECRET=...`

## Step 6: Database (MongoDB Atlas - Free Tier)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) — create a free account
2. Create a **free M0 cluster** (512MB storage, free forever)
3. Create a database user with username/password
4. Whitelist IP address: `0.0.0.0/0` (allow all — needed for cloud hosting)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/plumbpro`
6. Use this as your `MONGO_URL` in Railway/Render

## Step 7: Stripe Setup (For Real Payments)
1. Go to [stripe.com](https://stripe.com) — create an account
2. Complete identity verification to activate live mode
3. Get your **live** API keys from Dashboard → Developers → API Keys
4. Create your subscription products:
   - Basic: $4.99/month
   - Pro: $9.99/month  
   - Enterprise: $19.99/month
5. Set up a webhook endpoint pointing to: `https://your-backend-url/api/stripe/webhook`
6. Update your backend environment variables with live Stripe keys

## Step 8: Custom Domain (When Ready)
When you're ready to upgrade from `plumbpro.vercel.app`:
1. Buy a domain from [Namecheap](https://namecheap.com) (~$10/year for .com)
2. In Vercel: Settings → Domains → Add your domain
3. Update DNS records as Vercel instructs
4. Vercel provides free SSL automatically

---

## Quick Start Checklist
- [ ] Save code to GitHub
- [ ] Create Vercel account
- [ ] Deploy frontend to Vercel
- [ ] Create MongoDB Atlas free cluster
- [ ] Deploy backend to Railway/Render
- [ ] Update REACT_APP_BACKEND_URL in Vercel
- [ ] Set up Stripe live keys
- [ ] Test the full flow (register → subscribe → use app)
- [ ] Share your link and start getting users!

## Estimated Costs (Monthly)
| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel (Frontend) | Free | $20/mo (Pro) |
| Railway (Backend) | $5 credit/mo | $5-10/mo |
| MongoDB Atlas | Free (512MB) | $9/mo (shared) |
| Stripe | 2.9% + 30¢ per transaction | Same |
| Domain | N/A | $10-12/year |
| **Total** | **~$0/mo to start** | **~$20-30/mo** |

## Need Help?
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Contact: support@plumbpro.com
