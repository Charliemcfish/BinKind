# BinKind - Testing Guide (Phase 2)

Complete guide for testing the GoCardless payment integration and booking flow.

## 🎯 Overview

This guide covers testing the complete end-to-end booking and payment flow in both **Sandbox** (testing) and **Live** (production) modes.

**IMPORTANT**: Always test thoroughly in Sandbox mode before switching to Live mode with real payments.

---

## 📋 Prerequisites

Before testing, ensure you have:

- ✅ GoCardless Sandbox account created
- ✅ GoCardless Sandbox API token obtained
- ✅ Netlify site deployed (or running locally)
- ✅ Environment variables configured
- ✅ All dependencies installed (`npm install`)

---

## 🧪 Sandbox Testing

### Step 1: Configure Sandbox Mode

Ensure your environment variables are set for Sandbox:

```bash
GOCARDLESS_ACCESS_TOKEN=sandbox_xxxxx
GOCARDLESS_ENVIRONMENT=Sandbox
CLIENT_EMAIL=your-test-email@example.com
SITE_URL=http://localhost:8888  # or your Netlify URL
```

### Step 2: Start Local Development Server

```bash
netlify dev
```

Navigate to `http://localhost:8888`

### Step 3: Test One-Time Payment Flow

1. **Navigate to booking page**:
   - Go to `http://localhost:8888/book-your-clean.html`

2. **Fill out Step 1 (Your Details)**:
   - Name: `Test Customer`
   - Street Address: `123 Test Street`
   - Town/City: `Yeovil`
   - Postcode: `BA20 1AA`
   - Mobile Phone: `7777777777`
   - Email: `test@example.com`
   - Confirm Email: `test@example.com`
   - Click "Next Step"

3. **Fill out Step 2 (Cleaning Options)**:
   - Select: "One-Off Clean"
   - Council Area: Select any option
   - Click "Next Step"

4. **Fill out Step 3 (Select Bins)**:
   - Add at least 1 bin (e.g., Waste Wheelie)
   - Verify total price calculates correctly
   - Click "Next Step"

5. **Fill out Step 4 (Confirmation)**:
   - Review booking summary (verify all details are correct)
   - Select a valid date (Mon-Fri, at least 2 days in future)
   - Check "I agree to terms and conditions"
   - Click "Complete Payment via GoCardless"

6. **GoCardless Payment Page**:
   - You'll be redirected to GoCardless sandbox
   - Use GoCardless sandbox test bank details:
     - Account Holder: Any name
     - Sort Code: `20-00-00`
     - Account Number: `55779911`
   - Complete the payment setup

7. **Success Page**:
   - You should be redirected to `/booking-success.html`
   - Verify booking reference is displayed
   - Verify all booking details are correct
   - Verify payment amount is shown

8. **Check Email Notifications** (console logs):
   - Check Netlify Function logs
   - You should see email content logged (actual emails won't send in dev)

### Step 4: Test Recurring Payment Flow

Repeat Steps 1-7 above, but in **Step 2**, select:
- ✅ "Every 4 Weeks" instead of "One-Off Clean"

Additional verification:
- Verify recurring payment information is displayed
- Verify subscription is created in GoCardless dashboard
- Verify email mentions recurring payments

### Step 5: Test Payment Cancellation

1. Complete steps 1-5 from the One-Time Payment test
2. On the GoCardless payment page, **click "Cancel"** or close the window
3. You should be redirected to `/booking-failed.html`
4. Verify error message explains cancellation
5. Verify "Try Again" button works

### Step 6: Test Error Handling

#### Test Invalid Data Submission

1. Try to proceed through steps without filling required fields
2. Verify validation errors appear
3. Verify you cannot proceed without fixing errors

#### Test Calendar Date Blocking

1. On Step 4, try to select:
   - ❌ Today's date (should be blocked)
   - ❌ Tomorrow's date (should be blocked)
   - ❌ Saturday (should be blocked)
   - ❌ Sunday (should be blocked)
   - ✅ Valid weekday 2+ days in future (should work)

#### Test API Failures

To test error handling:

1. Temporarily set an invalid API token in `.env`
2. Try to complete a booking
3. You should see a user-friendly error message
4. Restore correct API token

---

## 🔍 Verification Checklist

### One-Time Payment Test

- [ ] Form validation works on all steps
- [ ] Calendar blocks invalid dates
- [ ] Payment button shows loading state
- [ ] Redirect to GoCardless works
- [ ] Can complete payment in sandbox
- [ ] Redirected back to success page
- [ ] Success page shows correct booking details
- [ ] Email notification content appears in logs
- [ ] GoCardless dashboard shows payment

### Recurring Payment Test

- [ ] Recurring info message appears in Step 2
- [ ] Bin price labels show "(Every 4 Weeks)"
- [ ] Summary shows recurring frequency
- [ ] Payment page mentions Direct Debit
- [ ] Success page mentions recurring payments
- [ ] Email mentions recurring subscription
- [ ] GoCardless dashboard shows subscription

### Error Handling Test

- [ ] Form validation prevents invalid submissions
- [ ] Calendar correctly blocks dates
- [ ] Payment cancellation shows error page
- [ ] Error page has "Try Again" button
- [ ] API errors show user-friendly messages
- [ ] User data is preserved on errors

### Responsive Design Test

- [ ] Mobile: All steps work on mobile view
- [ ] Mobile: Calendar is touch-friendly
- [ ] Tablet: Layout adapts correctly
- [ ] Desktop: Full layout displays properly

---

## 🚀 GoCardless Sandbox Testing Details

### Sandbox Test Bank Details

GoCardless provides test bank accounts for sandbox testing:

**Valid Account (Success)**:
- Account Holder: Any name
- Sort Code: `20-00-00`
- Account Number: `55779911`

**Invalid Account (Will Fail)**:
- Sort Code: `20-00-00`
- Account Number: `00000000`

### Sandbox Limitations

- Payments are simulated (no real money)
- Some timing delays are instant (vs. 3-5 days in live)
- Webhooks still work in sandbox mode
- All API features available

### Checking Sandbox Payments

1. Log in to GoCardless sandbox: https://manage-sandbox.gocardless.com
2. Navigate to "Payments" to see one-time payments
3. Navigate to "Subscriptions" to see recurring payments
4. Check webhook events in "Developers" > "Events"

---

## 📧 Email Testing

### Local Development

Emails won't actually send in local development. Instead:

1. Check Netlify Function logs in terminal
2. Email content will be logged to console
3. Verify email content is formatted correctly

### Production Testing

For production email testing, you'll need to:

1. Configure an email service (SendGrid, Mailgun, etc.)
2. Update `send-emails.js` function to use the email service
3. Test with real email addresses

**Current Implementation**: Email content is prepared but logged only (no actual sending). You'll need to integrate an email service for production.

---

## 🔴 Live Mode Testing (Production)

**⚠️ WARNING**: Only test in Live mode when ready for production. Real payments will be processed!

### Before Testing Live

1. **Update Environment Variables**:
   ```bash
   GOCARDLESS_ACCESS_TOKEN=live_xxxxx
   GOCARDLESS_ENVIRONMENT=Live
   CLIENT_EMAIL=charlielfisher@hotmail.com
   SITE_URL=https://your-production-site.netlify.app
   ```

2. **Verify GoCardless Account**:
   - Ensure business verification is complete
   - Bank account is connected
   - Know your processing fees

3. **Update Contact Details**:
   - Replace placeholder phone: `07777 777777`
   - Verify client email is correct

### Live Testing Process

1. **Small Test Payment**:
   - Create a booking with minimal amount (1 bin)
   - Use your own bank account for testing
   - Complete the payment
   - Verify success

2. **Verify Everything**:
   - Check GoCardless dashboard for payment
   - Check email notifications were sent
   - Verify booking details are correct
   - Check Netlify Function logs

3. **Test Cancellation/Refund**:
   - Know how to cancel/refund in GoCardless
   - Test the process once

4. **Monitor First Real Customer**:
   - Closely monitor the first real customer booking
   - Be ready to provide support
   - Verify all emails send correctly

---

## 🐛 Common Issues & Troubleshooting

### Issue: "Failed to initialize payment"

**Causes**:
- Invalid API token
- Wrong environment (Sandbox vs Live mismatch)
- GoCardless API down

**Solutions**:
- Verify `GOCARDLESS_ACCESS_TOKEN` is correct
- Verify `GOCARDLESS_ENVIRONMENT` matches token type
- Check GoCardless status page

### Issue: "Redirect URL not working"

**Causes**:
- Incorrect `SITE_URL` in environment variables
- Missing redirect configuration

**Solutions**:
- Verify `SITE_URL` matches your actual site URL
- Check `netlify.toml` has correct redirects

### Issue: "Emails not sending"

**Causes**:
- Email service not configured
- Function error

**Solutions**:
- Check Netlify Function logs
- Email sending is logged only by default
- Implement email service for production

### Issue: "Calendar won't select dates"

**Causes**:
- Date is blocked (weekend, past, or too soon)
- JavaScript error

**Solutions**:
- Only weekdays 2+ days in future can be selected
- Check browser console for errors

### Issue: "Payment succeeds but redirects to failed page"

**Causes**:
- Error in payment-callback function
- Booking data not passed correctly

**Solutions**:
- Check Netlify Function logs for errors
- Verify session token is being passed

---

## 📊 Testing Metrics

Track these metrics during testing:

### Success Metrics
- ✅ Payment success rate (should be 100% in sandbox with valid details)
- ✅ Email delivery rate (check logs)
- ✅ Page load times (< 3 seconds)
- ✅ Mobile usability

### Error Metrics
- ❌ Form validation errors (expected - good UX)
- ❌ Payment failures (investigate causes)
- ❌ API errors (should be rare)

---

## 🎓 Test Scenarios

### Scenario 1: Happy Path - One-Time Payment
1. Customer completes entire booking flow
2. Selects 2 waste bins (£24.98)
3. Pays successfully
4. Receives confirmation email
5. Business receives notification

**Expected Result**: ✅ All steps complete successfully

### Scenario 2: Happy Path - Recurring Payment
1. Customer selects "Every 4 Weeks"
2. Adds 1 waste bin, 1 food caddy (£18.48)
3. Sets up Direct Debit
4. Receives subscription confirmation

**Expected Result**: ✅ Subscription created successfully

### Scenario 3: User Cancels Payment
1. Customer completes form
2. Redirects to GoCardless
3. Clicks "Cancel"

**Expected Result**: ✅ Shows failed page with retry option

### Scenario 4: Invalid Payment Details
1. Customer enters invalid bank account
2. GoCardless rejects payment

**Expected Result**: ✅ Shows error and allows retry

### Scenario 5: Mobile Booking
1. Customer books on mobile device
2. Completes all steps
3. Pays successfully

**Expected Result**: ✅ Mobile-friendly throughout

---

## 📝 Test Documentation

After testing, document:

1. **Test Date & Time**
2. **Environment** (Sandbox or Live)
3. **Test Scenarios Completed**
4. **Issues Found** (and resolutions)
5. **Success Rate**

Example:

```
Date: 2024-11-15
Environment: Sandbox
Scenarios Tested:
- ✅ One-time payment (success)
- ✅ Recurring payment (success)
- ✅ Payment cancellation (success)
- ✅ Mobile booking (success)
- ❌ Email sending (not configured - expected)

Issues: None
Success Rate: 100% (4/4 scenarios)
```

---

## 🔒 Security Testing

### Check These Security Aspects:

- [ ] API keys not exposed in frontend code
- [ ] `.env` file is in `.gitignore`
- [ ] Environment variables set in Netlify (not in code)
- [ ] HTTPS enforced (Netlify does this automatically)
- [ ] No sensitive data in logs (production)
- [ ] Webhook signature verification works

---

## 🎯 Ready for Production?

Before going live, ensure:

- [x] All sandbox tests pass
- [x] Mobile testing complete
- [x] Error handling tested
- [ ] Email service configured (or manual process in place)
- [ ] Live API credentials obtained
- [ ] Small test payment successful in live mode
- [ ] Client contact details updated
- [ ] GoCardless webhooks configured
- [ ] Monitoring in place

---

## 📞 Support

If you encounter issues during testing:

1. **Check Netlify Function Logs**:
   - Netlify Dashboard > Functions > View logs

2. **Check GoCardless Dashboard**:
   - Review payment/subscription status
   - Check for API errors

3. **Check Browser Console**:
   - F12 > Console tab
   - Look for JavaScript errors

4. **Review Documentation**:
   - README.md for setup
   - SETUP_GUIDE.md for detailed steps
   - GoCardless API docs

---

**Good luck with testing! 🚀**

Remember: Test thoroughly in Sandbox before going live with real payments!
