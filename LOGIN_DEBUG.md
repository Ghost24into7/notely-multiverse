# 🔍 Login Debug Guide

## **Issue: Login Failed**

Your frontend is connecting to the backend, but login is failing. Here's how to debug:

### **🔧 Step 1: Check Vercel Backend Environment Variables**

Go to your backend Vercel project dashboard:
1. Visit: https://vercel.com/dashboard
2. Find your backend project: `notely-multiverse`
3. Go to **Settings** → **Environment Variables**
4. **VERIFY** these are set:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://mmmnnn21212_db_user:M39lJtXsDlQB6tI7@saas.fr5wbik.mongodb.net/saas-notes
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://notely-multiverse-ysqx.vercel.app
```

### **🔧 Step 2: Check Backend Logs**

1. Go to your backend project on Vercel
2. Click **Functions** tab
3. Click on any function execution
4. Check the **Logs** for errors like:
   - MongoDB connection errors
   - Missing environment variables
   - Authentication errors

### **🔧 Step 3: Test API Endpoints**

Test these URLs in your browser:

**Root Endpoint (Should work):**
https://notely-multiverse.vercel.app/

**Health Check (Should work):**
https://notely-multiverse.vercel.app/health

**Login Test (Will show method not allowed, but endpoint exists):**
https://notely-multiverse.vercel.app/api/auth/login

### **🔧 Step 4: Check Frontend Console**

1. Open your frontend: https://notely-multiverse-ysqx.vercel.app/login
2. Press F12 to open developer tools
3. Go to **Console** tab
4. Try to login and look for error messages
5. Go to **Network** tab and check if the API request is being made

### **🔧 Step 5: Redeploy Backend**

If environment variables were missing:
1. Add the missing variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment

### **🔧 Step 6: Test Local vs Production**

**Test locally:**
```bash
cd frontend
npm run dev
# Then try login on localhost:3000
```

If local works but production doesn't, it's likely an environment variable issue.

### **📋 Quick Checklist:**

- [ ] All environment variables set in Vercel backend
- [ ] Backend redeploy after setting variables
- [ ] Frontend `.env` files have correct API URL with `/api`
- [ ] MongoDB connection string is correct
- [ ] Test accounts exist in database (from seeding)
- [ ] No CORS errors in browser console

### **🆘 Most Common Issues:**

1. **Missing MONGODB_URI** in Vercel backend
2. **Wrong API URL** in frontend (missing `/api`)
3. **Test accounts not seeded** in production database
4. **CORS issues** (check browser console)
5. **JWT_SECRET missing** in backend environment

**Try these steps and let me know what you find in the logs!**