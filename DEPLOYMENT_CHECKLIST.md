# Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment
- [ ] Code committed to GitHub repository
- [ ] All environment variables documented
- [ ] Database migrations tested locally
- [ ] Application tested locally (frontend + backend)

## Railway Backend Deployment
- [ ] Railway account created
- [ ] New project created from GitHub repo
- [ ] PostgreSQL database added
- [ ] Backend root directory set to `backend`
- [ ] Environment variables configured:
  - [ ] NODE_ENV=production
  - [ ] JWT_SECRET (random 32+ chars)
  - [ ] Database variables linked
  - [ ] CORS_ORIGIN set
  - [ ] QR_API_BASE_URL set
- [ ] Database migrations run
- [ ] Backend domain generated
- [ ] Health check endpoint tested (`/health`)
- [ ] Backend URL saved: ___________________________

## Vercel Frontend Deployment
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Build settings verified (Vite)
- [ ] Environment variable set:
  - [ ] VITE_API_URL (Railway backend URL + /api)
- [ ] Frontend deployed successfully
- [ ] Frontend URL saved: ___________________________

## Post-Deployment Configuration
- [ ] CORS_ORIGIN updated in Railway with Vercel URL
- [ ] Backend redeployed after CORS update

## Testing on Production
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays correctly
- [ ] Create event group works
- [ ] Create event works
- [ ] Access code displays
- [ ] QR code displays
- [ ] Text code check-in works
- [ ] QR code scanner works (HTTPS required)
- [ ] Attendance list displays
- [ ] CSV export downloads
- [ ] XLSX export downloads
- [ ] Responsive design works on mobile
- [ ] No console errors in browser

## Optional Enhancements
- [ ] Custom domain configured (Vercel)
- [ ] Custom API domain configured (Railway)
- [ ] Database backup created
- [ ] Analytics enabled (Vercel)
- [ ] Error monitoring set up (Sentry)

## Documentation
- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Deployment date recorded: ___________________________
- [ ] Screenshots taken for demo

## Demo Preparation
- [ ] Test user account created
- [ ] Sample event group created
- [ ] Sample events created
- [ ] Demo script prepared
- [ ] Presentation slides ready

---

## Quick Reference

**Frontend URL**: ___________________________
**Backend URL**: ___________________________
**Database**: Railway PostgreSQL
**Deployment Date**: ___________________________

## Rollback Plan

If deployment fails:
1. Check Railway logs for backend errors
2. Check Vercel build logs for frontend errors
3. Verify all environment variables
4. Test database connection
5. Redeploy from last working commit

---

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Complete
