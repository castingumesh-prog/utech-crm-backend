# U TECH CRM Backend — Railway Deployment Guide

## GitHub Repo (Already Pushed ✅)
https://github.com/castingumesh-prog/utech-crm-backend

---

## Step 1 — Create Railway Account (Free)
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize with castingumesh-prog

## Step 2 — Deploy from GitHub
1. Click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Select **"castingumesh-prog/utech-crm-backend"**
4. Railway auto-detects Node.js and deploys

## Step 3 — Add MySQL Database
1. In your Railway project, click **"+ New"**
2. Click **"Database"** → **"MySQL"**
3. Railway creates a MySQL instance automatically
4. Click on the MySQL service → **"Variables"** tab
5. Copy these values:
   - MYSQL_HOST → use as DB_HOST
   - MYSQL_PORT → use as DB_PORT
   - MYSQL_USER → use as DB_USER
   - MYSQL_PASSWORD → use as DB_PASSWORD
   - MYSQL_DATABASE → use as DB_NAME

## Step 4 — Set Environment Variables
In Railway → your app service → "Variables" tab, add ALL of these:

```
NODE_ENV=production
DB_HOST=<paste MYSQLHOST from Railway MySQL service>
DB_PORT=<paste MYSQLPORT>
DB_USER=<paste MYSQLUSER>
DB_PASSWORD=<paste MYSQLPASSWORD>
DB_NAME=<paste MYSQLDATABASE>
JWT_SECRET=UTECH_PROD_SECRET_2024_CHANGEME
JWT_EXPIRES_IN=7d
WEBHOOK_VERIFY_TOKEN=utech_whatsapp_verify_2024
WHATSAPP_APP_SECRET=<from Meta Developer Console>
WHATSAPP_TOKEN=<from Meta Developer Console>
WHATSAPP_PHONE_NUMBER_ID=<from Meta Developer Console>
OPENAI_API_KEY=<optional>
RAZORPAY_KEY_ID=<optional>
RAZORPAY_KEY_SECRET=<optional>
SMTP_HOST=<optional>
SMTP_PORT=587
SMTP_USER=<optional>
SMTP_PASS=<optional>
```

## Step 5 — Import Database Schema
1. In Railway MySQL service → "Data" tab → "Query"
2. Paste contents of database/schema.sql and run

## Step 6 — Get Your Public URL
Railway gives you a URL like:
https://utech-crm-backend-production.up.railway.app

## Step 7 — Test Live
curl https://utech-crm-backend-production.up.railway.app/health

## Step 8 — Configure Meta WhatsApp Webhook
- Callback URL: https://YOUR-RAILWAY-URL/api/webhooks/whatsapp
- Verify Token: utech_whatsapp_verify_2024

---

## All API Endpoints (Live)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| GET | /api/leads | JWT |
| POST | /api/leads | JWT |
| GET | /api/customers | JWT |
| POST | /api/customers | JWT |
| GET | /api/quotations | JWT |
| POST | /api/quotations | JWT |
| GET | /api/work-orders | JWT |
| POST | /api/work-orders | JWT |
| GET | /api/products | JWT |
| POST | /api/products | JWT |
| POST | /api/payments/create-order | JWT |
| POST | /api/payments/verify | JWT |
| GET | /api/follow-ups | JWT |
| POST | /api/follow-ups | JWT |
| GET | /api/webhooks/whatsapp | No (Meta verify) |
| POST | /api/webhooks/whatsapp | No (Meta webhook) |
| GET | /health | No |
| GET | /api/health/db | No |
