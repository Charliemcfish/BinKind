# BinKind Development Setup Guide

## The 405 Error Issue

You're getting a **405 Method Not Allowed** error because you're running the site through Live Server (localhost:5500), which doesn't support Netlify Functions.

**Netlify Functions only work when running through Netlify Dev CLI.**

---

## Quick Fix - How to Run Locally

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `netlify-cli` - Needed to run Netlify Functions locally
- `gocardless-nodejs` - GoCardless payment integration
- `node-fetch` - HTTP requests

### Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with your GoCardless credentials:

```env
GOCARDLESS_ACCESS_TOKEN=your_sandbox_access_token_here
GOCARDLESS_ENVIRONMENT=Sandbox
SITE_URL=http://localhost:8888
```

**Note:** The `.env` file is already in `.gitignore` so your secrets won't be committed.

### Step 3: Run the Development Server
```bash
npm run dev
```

This will start the Netlify Dev server at **http://localhost:8888**

### Step 4: Test Your Booking Flow
1. Open http://localhost:8888 in your browser
2. Navigate to the booking page
3. Fill out the form and test the payment flow
4. The API endpoints will now work correctly at `/api/create-payment`

---

## Why This Is Necessary

- **Live Server** is just a static file server - it can't run serverless functions
- **Netlify Dev** creates a local environment that mimics Netlify's production environment
- It properly routes `/api/*` requests to your Netlify Functions
- It loads environment variables from `.env` file

---

## Production Deployment

When you deploy to Netlify:
1. Set environment variables in Netlify dashboard (Settings > Environment Variables)
2. Push your code to GitHub
3. Netlify will automatically build and deploy
4. The functions will work at `https://your-site.netlify.app/api/*`

---

## Troubleshooting

### Port 8888 already in use?
Stop any other Netlify Dev instances or change the port:
```bash
netlify dev --port 9999
```

### Functions not working?
- Check `.env` file exists with correct credentials
- Check `netlify.toml` redirects are configured
- Look at Netlify Dev console for function logs

### GoCardless errors?
- Verify you're using Sandbox credentials for testing
- Check GoCardless dashboard for API access token
- Ensure redirect URLs are whitelisted in GoCardless settings
