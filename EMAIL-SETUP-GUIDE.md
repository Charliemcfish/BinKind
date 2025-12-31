# Email Confirmation Setup Guide - BinKind

## Quick Setup (5 minutes)

### Step 1: Create Resend Account (FREE)
1. Go to: https://resend.com/signup
2. Sign up with your email
3. Verify your email address

### Step 2: Get Your API Key
1. Log into Resend dashboard: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "BinKind Production"
4. Copy the API key (starts with `re_...`)
5. **SAVE THIS KEY** - you'll only see it once!

### Step 3: Add API Key to Netlify
1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your BinKind site
3. Go to **Site Settings** → **Environment Variables**
4. Click **Add a variable**
5. Add these variables:

   **Variable 1:**
   - Key: `RESEND_API_KEY`
   - Value: `re_your_api_key_here` (paste the key from Step 2)

   **Variable 2 (Optional):**
   - Key: `CLIENT_EMAIL`
   - Value: `charlielfisher@hotmail.com`

   **Variable 3 (Initially use default):**
   - Key: `FROM_EMAIL`
   - Value: `onboarding@resend.dev` (Resend's test domain)

6. Click **Save**

### Step 4: Redeploy Your Site
1. In Netlify dashboard, go to **Deploys**
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete (~2 minutes)

### Step 5: Test It!
1. Go to your website
2. Make a test booking
3. Complete the payment flow
4. Check your email (charlielfisher@hotmail.com) for the booking notification
5. Check the customer email for the confirmation

---

## ✅ You're Done! Emails Will Now Be Sent Automatically

### What Happens When Someone Books:
1. Customer completes booking and payment
2. **You receive an email** at charlielfisher@hotmail.com with:
   - Customer details
   - Booking information
   - Payment details
   - Reminder to add to Squeegee

3. **Customer receives an email** with:
   - Booking confirmation
   - Cleaning date
   - Total payment
   - Your contact number for changes

---

## Optional: Use Your Own Domain (Recommended for Production)

Using `onboarding@resend.dev` is fine for testing, but emails might go to spam. To use your own domain:

### Option A: Use BinKind.co.uk (Recommended)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `binkind.co.uk`
4. Resend will show you DNS records to add
5. Add these DNS records to your domain registrar:
   - TXT record for verification
   - MX records for receiving
   - DKIM records for authentication
6. Wait for verification (~10 minutes)
7. Update Netlify environment variable:
   - `FROM_EMAIL` = `bookings@binkind.co.uk` or `noreply@binkind.co.uk`

### Option B: Continue with Resend Test Domain
- Keep using `onboarding@resend.dev`
- Works fine but might go to spam occasionally
- Free and no setup required

---

## Troubleshooting

### Emails Not Sending?
1. Check Netlify function logs:
   - Netlify Dashboard → Functions → send-emails
   - Look for error messages

2. Verify environment variables are set:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Make sure `RESEND_API_KEY` exists

3. Check Resend dashboard:
   - https://resend.com/emails
   - See if emails were sent (even if they failed)

4. Check spam folder

### Still Not Working?
- Make sure you redeployed after adding environment variables
- Check the API key is correct (starts with `re_`)
- Verify Resend account is active

---

## Pricing (Current Usage)

**Resend Free Tier:**
- ✅ 3,000 emails per month
- ✅ 100 emails per day
- ✅ Perfect for your business

**Cost Estimate:**
- If you get 50 bookings/month = 100 emails (2 per booking)
- Well within free tier!
- No credit card required unless you exceed limits

---

## Summary

**What you need to do:**
1. ✅ Sign up at Resend.com
2. ✅ Get API key
3. ✅ Add `RESEND_API_KEY` to Netlify environment variables
4. ✅ Redeploy site
5. ✅ Test with a booking

**Total time:** 5 minutes
**Cost:** FREE (3,000 emails/month)

---

**Need Help?**
- Resend docs: https://resend.com/docs
- Resend support: support@resend.com
