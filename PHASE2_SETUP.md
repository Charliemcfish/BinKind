# BinKind Phase 2 - Payment Integration & Backend Setup Guide

This guide will walk you through setting up GoCardless payment integration, Netlify Functions, and email notifications for the BinKind website.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [GoCardless Account Setup](#gocardless-account-setup)
3. [Local Development Setup](#local-development-setup)
4. [Netlify Deployment](#netlify-deployment)
5. [Environment Variables](#environment-variables)
6. [Testing the Payment Flow](#testing-the-payment-flow)
7. [Going Live](#going-live)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- ✅ Node.js installed (v14 or higher)
- ✅ A Netlify account ([Sign up here](https://app.netlify.com/signup))
- ✅ Git installed on your machine
- ✅ Access to this repository

---

## 🏦 GoCardless Account Setup

### Step 1: Create a GoCardless Account

1. Go to [GoCardless Sign Up](https://manage.gocardless.com/)
2. Choose "Sign up for a business account"
3. Complete the registration process
4. **Important**: Start with a Sandbox account for testing

### Step 2: Get Your API Credentials

1. Log in to your GoCardless dashboard
2. Go to **Developers** → **Access Tokens**
3. You'll see two types of tokens:
   - **Sandbox Access Token** - for testing (use this first!)
   - **Live Access Token** - for production (use only when ready to go live)
4. Copy your **Sandbox Access Token** - you'll need this shortly

### Step 3: Understand Payment Types

BinKind supports two payment flows:

**One-Time Payments:**
- Customer selects "One-Off Cleaning"
- Single Direct Debit payment is created
- Customer authorizes once via GoCardless

**Recurring Payments (Subscriptions):**
- Customer selects "Every 4 Weeks"
- Direct Debit mandate is created
- Customer is automatically charged every 4 weeks
- First payment processes immediately

---

## 💻 Local Development Setup

### Step 1: Install Dependencies

```bash
# Navigate to your project directory
cd BinKind

# Install Node.js dependencies
npm install
```

This will install:
- `gocardless-nodejs` - GoCardless SDK
- `node-fetch` - For making HTTP requests
- `netlify-cli` - For local development

### Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor and fill in your values:

   ```env
   # GoCardless API Credentials
   GOCARDLESS_ACCESS_TOKEN=sandbox_xxxxxxxxxxxxx
   GOCARDLESS_ENVIRONMENT=Sandbox

   # Email for booking notifications
   CLIENT_EMAIL=charlielfisher@hotmail.com

   # Site URL (for local development)
   SITE_URL=http://localhost:8888
   ```

   **Where to find each value:**
   - `GOCARDLESS_ACCESS_TOKEN`: From GoCardless Developer settings
   - `GOCARDLESS_ENVIRONMENT`: Use `Sandbox` for testing, `Live` for production
   - `CLIENT_EMAIL`: Your business email for booking notifications
   - `SITE_URL`: Use `http://localhost:8888` for local testing

3. **IMPORTANT**: Never commit your `.env` file to Git! It's already in `.gitignore`.

### Step 3: Start Local Development Server

```bash
# Start Netlify Dev server (includes Functions)
npm run dev
```

This will:
- Start a local server at `http://localhost:8888`
- Run Netlify Functions locally
- Watch for file changes

### Step 4: Test Locally

1. Open `http://localhost:8888` in your browser
2. Navigate to "Book Your Clean"
3. Complete the booking form
4. When you click "Complete Payment", you'll be redirected to GoCardless Sandbox

---

## 🚀 Netlify Deployment

### Step 1: Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git repository (GitHub, GitLab, or Bitbucket)
4. Select the BinKind repository

### Step 2: Configure Build Settings

Netlify should auto-detect the settings, but verify:

- **Build command**: `npm run build` (or leave empty)
- **Publish directory**: `.` (root directory)
- **Functions directory**: `netlify/functions` (should be auto-detected)

### Step 3: Add Environment Variables in Netlify

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Add the following variables:

   | Variable Name | Value |
   |--------------|-------|
   | `GOCARDLESS_ACCESS_TOKEN` | Your Sandbox token (from GoCardless) |
   | `GOCARDLESS_ENVIRONMENT` | `Sandbox` |
   | `CLIENT_EMAIL` | `charlielfisher@hotmail.com` |
   | `SITE_URL` | Your Netlify site URL (e.g., `https://binkind.netlify.app`) |

3. Click "Save"

### Step 4: Deploy

1. Trigger a deploy by pushing to your repository, or
2. Click "Trigger deploy" in Netlify dashboard

Your site will be live at `https://your-site-name.netlify.app`

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOCARDLESS_ACCESS_TOKEN` | Your GoCardless API token | `sandbox_xxxxxxxxxxxx` |
| `GOCARDLESS_ENVIRONMENT` | Environment mode | `Sandbox` or `Live` |
| `CLIENT_EMAIL` | Email to receive booking notifications | `charlielfisher@hotmail.com` |
| `SITE_URL` | Your website URL | `https://binkind.netlify.app` |

### Optional Variables (for future enhancements)

| Variable | Description | When to use |
|----------|-------------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key for emails | If implementing SendGrid for emails |
| `MAILGUN_API_KEY` | Mailgun API key | If implementing Mailgun for emails |

---

## 🧪 Testing the Payment Flow

### Testing in Sandbox Mode

GoCardless Sandbox provides test bank accounts for testing:

1. **Complete a booking** on your local or deployed site
2. When redirected to GoCardless, you'll see a **Sandbox warning banner**
3. Use these test details:
   - **Bank**: Any bank name
   - **Account holder**: Any name
   - **Sort code**: Any valid format (e.g., `20-00-00`)
   - **Account number**: Any 8-digit number (e.g., `55779911`)

4. Click "Continue" to authorize
5. You'll be redirected back to your success page

### Test Scenarios

✅ **Scenario 1: One-Time Payment**
- Select "One-Off Clean"
- Choose bins and date
- Complete payment flow
- Verify success page shows correct details
- Check console logs for email content

✅ **Scenario 2: Recurring Payment**
- Select "Every 4 Weeks"
- Choose bins and date
- Complete payment flow
- Verify subscription is created in GoCardless dashboard

✅ **Scenario 3: Payment Cancellation**
- Start booking process
- Click "Cancel" on GoCardless page
- Verify you're redirected to failure page

✅ **Scenario 4: Date Blocking**
- Try selecting today's date (should be blocked)
- Try selecting a weekend (should be blocked)
- Try selecting a date 2 days from now (should work)

---

## 🌍 Going Live

### ⚠️ IMPORTANT: Only do this when you're ready for real payments!

### Step 1: Switch to Live Mode

1. Log in to your GoCardless account
2. Complete business verification (required for live mode)
3. Go to **Developers** → **Access Tokens**
4. Copy your **Live Access Token**

### Step 2: Update Environment Variables

**In Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Update these variables:
   - `GOCARDLESS_ACCESS_TOKEN`: Replace with your **Live** token
   - `GOCARDLESS_ENVIRONMENT`: Change to `Live`
3. Save and redeploy

**In Local .env (for testing live):**
```env
GOCARDLESS_ACCESS_TOKEN=live_xxxxxxxxxxxxx
GOCARDLESS_ENVIRONMENT=Live
```

### Step 3: Final Pre-Launch Checklist

- [ ] GoCardless account verified and approved
- [ ] Live API credentials tested
- [ ] Email notifications working
- [ ] All pages tested on mobile, tablet, desktop
- [ ] Privacy policy and terms updated
- [ ] Contact information correct (phone number, email)
- [ ] Pricing verified
- [ ] Test booking with small real payment
- [ ] Backup plan if payment fails

### Step 4: Go Live!

1. Deploy to production
2. Test with a small real transaction
3. Monitor first few bookings closely
4. Check GoCardless dashboard for successful payments

---

## 🛠️ Troubleshooting

### Issue: "Failed to create payment"

**Possible causes:**
- Invalid GoCardless API token
- Wrong environment (Sandbox vs Live)
- Missing environment variables

**Solution:**
1. Check your environment variables in Netlify
2. Verify your GoCardless token is correct
3. Check Netlify Functions logs for errors

### Issue: Emails not sending

**Current state:**
- Emails are logged to console (not actually sent)
- You need to implement an email service

**Solution:**
To actually send emails, integrate an email service:
1. Sign up for SendGrid, Mailgun, or similar
2. Add API key to environment variables
3. Update `send-emails.js` function to use the service

### Issue: Payment callback not working

**Possible causes:**
- Incorrect `SITE_URL` environment variable
- Netlify Functions not deployed

**Solution:**
1. Verify `SITE_URL` matches your Netlify site URL
2. Check Netlify Functions are deployed
3. Test callback URL manually: `https://yoursite.netlify.app/api/payment-callback`

### Issue: Date picker not blocking dates

**Solution:**
- Check browser console for JavaScript errors
- Verify `main.js` is loaded correctly
- Clear browser cache

### How to View Logs

**Netlify Functions Logs:**
1. Go to Netlify dashboard
2. Click "Functions" tab
3. Click on a function to see logs

**Local Development Logs:**
- Check your terminal where `npm run dev` is running
- Errors will appear in the console

---

## 📞 Support & Resources

### GoCardless Documentation
- [API Documentation](https://developer.gocardless.com/)
- [Node.js Library](https://github.com/gocardless/gocardless-nodejs)
- [Direct Debit Guide](https://gocardless.com/direct-debit/)

### Netlify Documentation
- [Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Deploy Settings](https://docs.netlify.com/configure-builds/overview/)

### Need Help?
If you encounter issues not covered here:
1. Check the error logs in Netlify Functions
2. Review GoCardless API error messages
3. Ensure all environment variables are set correctly
4. Verify your GoCardless account status

---

## 🎉 Congratulations!

You've successfully set up Phase 2 of BinKind! Your website now has:

✅ Full GoCardless payment integration
✅ One-time and recurring payment support
✅ Secure Direct Debit processing
✅ Booking confirmation emails (ready for email service integration)
✅ Professional success/failure pages
✅ Complete end-to-end booking flow

**Next Steps:**
1. Test thoroughly in Sandbox mode
2. Implement email service (SendGrid, Mailgun, etc.)
3. Add booking data to Squeegee (manual process via email notifications)
4. Go live when ready!

---

**Built with ❤️ for BinKind**
