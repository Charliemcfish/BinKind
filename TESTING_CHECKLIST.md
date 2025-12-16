# BinKind Website - Testing Checklist

## Pre-Launch Configuration

### Environment Variables (Netlify)
- [ ] Set `GOCARDLESS_ACCESS_TOKEN` to `live_I5jWqY47KhYlDsLKPW9TCbMLaNTHs6PrgGtBXL1f`
- [ ] Set `GOCARDLESS_ENVIRONMENT` to `Live`
- [ ] Set `SITE_URL` to `https://binkind.co.uk`
- [ ] Verify all environment variables are saved in Netlify dashboard

### Domain Configuration
- [ ] Domain `binkind.co.uk` is properly connected to Netlify
- [ ] SSL certificate is active and working
- [ ] DNS records are correctly configured
- [ ] Website accessible via https://binkind.co.uk

---

## Visual & Design Testing

### Navigation Bar (All Pages)
- [ ] Logo displays correctly (Black + Green version on grey background)
- [ ] Grey navbar background displays correctly
- [ ] Dark text is readable on grey background
- [ ] All navigation links work properly
- [ ] Mobile menu hamburger icon is visible (dark color)
- [ ] Mobile menu opens and closes correctly
- [ ] "Book Your Clean" button is prominent and clickable

### Homepage [index.html](index.html)
- [ ] Hero image (vanhero.webp) loads quickly
- [ ] Introductory offer banner displays (20% off first clean)
- [ ] All bin icons display correctly in pricing section
- [ ] Recycling Bag option is visible in pricing (£2 monthly / £3 one-off)
- [ ] Pricing emphasizes monthly subscription (larger text)
- [ ] One-off pricing shown as secondary option
- [ ] "All Four Bins" bundle shows £25 (not £30)
- [ ] Reviews section displays with 3 customer reviews
- [ ] All sections load without layout issues
- [ ] No mention of commercial/business bin cleaning

### About Page [about.html](about.html)
- [ ] Hero image loads correctly
- [ ] All content loads properly
- [ ] Reviews section displays with 3 customer reviews
- [ ] No mention of commercial/business services

### Areas Covered [areas-covered.html](areas-covered.html)
- [ ] New areas are listed: Castle Cary, Langport, South Petherton
- [ ] Map/coverage area displays correctly
- [ ] No mention of business/commercial services

### Contact Page [contact.html](contact.html)
- [ ] Phone number shows 07494 250556 (not 07777777777)
- [ ] Email displays correctly
- [ ] Twitter link has been removed (only Facebook and Instagram remain)
- [ ] Contact form works properly
- [ ] No commercial bin cleaning FAQ

### Booking Form [book-your-clean.html](book-your-clean.html)
- [ ] Bundle deal buttons display correctly
  - [ ] Two Large Bins: £20 one-off / £10 monthly
  - [ ] Four Bins: £25 one-off / £15 monthly (updated from £30)
- [ ] Bundle buttons are clickable and auto-select bins
- [ ] All bin icons display correctly (new assets)
- [ ] Recycling Bag option appears (£3 one-off / £2 monthly)
- [ ] Price updates correctly when switching between one-off/monthly
- [ ] Bundle prices update when changing frequency
- [ ] Running total calculates correctly
- [ ] All bins bundle applies £25 pricing (one-off)
- [ ] All bins bundle applies £15 pricing (monthly)
- [ ] Form validation works on all steps
- [ ] Calendar date selector works
- [ ] Progress bar updates correctly

---

## Functionality Testing

### Booking Flow
- [ ] Step 1: Postcode validation works
- [ ] Step 2: Frequency selection works (one-off vs every 4 weeks)
- [ ] Step 3: Bundle buttons correctly select bins
- [ ] Step 3: Individual bin selection works
- [ ] Step 3: Quantity increment/decrement works
- [ ] Step 3: Total price updates correctly
- [ ] Step 3: Bundle deal notifications appear when applicable
- [ ] Step 4: Date picker allows only future dates
- [ ] Step 4: Contact form validation works
- [ ] Step 4: Summary shows correct information
- [ ] Navigation between steps works (back/next buttons)

### Payment Integration (CRITICAL)
- [ ] **Test Mode First**: Use GoCardless sandbox to verify flow
- [ ] Click "Complete Booking & Pay" redirects to GoCardless
- [ ] GoCardless payment page loads correctly
- [ ] Test bank details work in sandbox
- [ ] Returns to correct success/failure URLs
- [ ] **Live Mode**: Switch to live environment variables
- [ ] Test with real bank details (small amount)
- [ ] Payment completes successfully
- [ ] Redirects to success page with correct booking reference
- [ ] Success page displays all booking details correctly

### Email Notifications
- [ ] Customer receives confirmation email
- [ ] Business receives booking notification
- [ ] Emails contain correct booking details
- [ ] Phone number in emails is 07494 250556
- [ ] Unsubscribe/cancel information is correct

---

## Content Verification

### Pricing Accuracy
- [ ] General Waste Bin: £6 monthly / £12 one-off
- [ ] Garden Waste Bin: £6 monthly / £12 one-off
- [ ] Food Caddy: £2 monthly / £3 one-off
- [ ] Recycling Container: £2 monthly / £3 one-off
- [ ] **Recycling Bag: £2 monthly / £3 one-off** (NEW)
- [ ] Two bins bundle: £10 monthly / £20 one-off
- [ ] All four bins bundle: £15 monthly / £25 one-off (UPDATED)

### Contact Information
- [ ] Phone: 07494 250556 (everywhere)
- [ ] Email: binkindsw@gmail.com
- [ ] Business hours: Mon-Fri 8am-6pm
- [ ] No 07777 777777 anywhere on site

### Service Areas
- [ ] Yeovil listed
- [ ] Sherborne listed
- [ ] Somerton listed
- [ ] Martock listed
- [ ] Ilchester listed
- [ ] **Castle Cary listed** (NEW)
- [ ] **Langport listed** (NEW)
- [ ] **South Petherton listed** (NEW)

### Content Accuracy
- [ ] No mention of "commercial bins"
- [ ] No mention of "businesses" getting service
- [ ] All text refers to "homes" only
- [ ] Twitter social links removed
- [ ] Facebook and Instagram links present

---

## Performance & Technical

### Images & Assets
- [ ] All van hero images use vanhero.webp (not .png)
- [ ] Van hero image loads quickly
- [ ] All bin icons load correctly
- [ ] Favicon displays in browser tab
- [ ] Logo loads quickly in navigation

### Mobile Responsiveness
- [ ] Homepage displays correctly on mobile
- [ ] Booking form works on mobile
- [ ] Bundle buttons are tappable on mobile
- [ ] Forms are easy to fill on mobile
- [ ] Text is readable without zooming
- [ ] Images scale appropriately
- [ ] Navigation menu works on mobile

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on iOS (iPhone/iPad)
- [ ] Test on Android

### Performance
- [ ] Page load time under 3 seconds
- [ ] Images load progressively
- [ ] No console errors in browser developer tools
- [ ] Forms submit without errors
- [ ] Smooth scrolling animations work

---

## Security & Legal

- [ ] HTTPS is enforced (no HTTP access)
- [ ] GoCardless payment flow is secure
- [ ] No sensitive data exposed in URLs
- [ ] Contact form has spam protection
- [ ] Privacy policy is accessible (if you have one)
- [ ] Terms and conditions are accessible (if you have one)

---

## Post-Launch Monitoring

### First 24 Hours
- [ ] Monitor for any booking errors
- [ ] Verify email notifications are being sent
- [ ] Check GoCardless dashboard for payments
- [ ] Monitor website uptime
- [ ] Check for any browser console errors reported

### First Week
- [ ] Verify all bookings are processing correctly
- [ ] Confirm customers are receiving emails
- [ ] Check payment success rate
- [ ] Monitor for any customer feedback about issues
- [ ] Verify mobile experience is smooth

---

## Quick Reference

### Important Phone Numbers to Verify
- ✅ Correct: **07494 250556**
- ❌ Old (remove): 07777 777777
- ❌ Other: 07979 404342 (this appears in contact.html - may need updating too!)

### Bundle Pricing Summary
| Bundle | One-Off | Monthly |
|--------|---------|---------|
| 2 Large Bins | £20 | £10 |
| All 4 Bins | **£25** | £15 |

### Environment Variables
```
GOCARDLESS_ACCESS_TOKEN=live_I5jWqY47KhYlDsLKPW9TCbMLaNTHs6PrgGtBXL1f
GOCARDLESS_ENVIRONMENT=Live
SITE_URL=https://binkind.co.uk
```

---

## Common Issues to Watch For

1. **GoCardless Errors**: If payments fail, check environment variables are set correctly
2. **Email Not Sending**: Verify Netlify Functions are deployed and SITE_URL is correct
3. **Bundle Buttons Not Working**: Check JavaScript console for errors
4. **Images Not Loading**: Verify all paths use forward slashes and correct filenames
5. **Mobile Menu Not Opening**: Test on actual mobile device, not just browser resize

---

## Final Checklist Before Going Live

- [ ] All changes committed to git
- [ ] Deployed to Netlify
- [ ] Environment variables set in Netlify
- [ ] Domain connected and SSL active
- [ ] Test booking completed successfully
- [ ] All phone numbers updated
- [ ] No references to localhost
- [ ] GoCardless in Live mode
- [ ] Email notifications working
- [ ] Customer can complete end-to-end booking

---

**Note**: Test the entire booking and payment flow with a small test payment before promoting the site to customers!
