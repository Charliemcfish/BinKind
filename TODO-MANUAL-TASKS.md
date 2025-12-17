# BinKind - Manual Tasks Checklist

## ⚠️ IMPORTANT: Manual Task Required

### Area Map Updates
**Status:** PENDING - MUST BE DONE MANUALLY

Add the following towns to the Snazzy Maps embed:
- South Petherton
- Langport
- Castle Cary

**Instructions:**
1. Go to https://snazzymaps.com
2. Log into the account
3. Update the map with ID 754063
4. Add markers for the three towns listed above
5. Save and verify the embed is still working on the website

---

## Summary of Automated Changes Completed

### ✅ Completed Changes:

1. **Frequency Changes (4 weeks → 6 weeks)**
   - Updated all JavaScript references from `every4weeks` to `every6weeks`
   - Updated booking form frequency button text
   - Updated all pricing labels from "monthly" to "every 6 weeks"
   - Updated recurring payment info text

2. **20% First-Time Discount**
   - Added toggle in JavaScript (`FIRST_TIME_DISCOUNT_ENABLED`)
   - Implemented strikethrough pricing with discount display
   - Added green "20% OFF" badges
   - Applied discount to final booking price
   - Easy to toggle on/off by changing `FIRST_TIME_DISCOUNT_ENABLED` to `false` in main.js line 12

3. **Homepage Updates**
   - Added CTA button to 20% discount section
   - Changed "All Four Bins" to "All Bins"
   - Updated hero CTA button text to "Get 20% off your first clean! Book now"
   - Changed hero image from vanhero.webp to vanhero1.jpeg
   - Updated footer contact number to 07494 250556

4. **Bundle Deals**
   - Updated "All 4 bins" to "All Bins" on booking form
   - Added recycling bag to the "All Bins" bundle selection

5. **Discount Logic Fixes**
   - Fixed discount stacking for 2 waste + 2 garden bins (now correctly applies 2x £10 or 2x £20)
   - Improved bundle deal detection logic

6. **Contact Number Updates**
   - Updated index.html footer to 07494 250556

### ⚠️ Still Need Manual Updates:

**Contact Numbers - Need to update in these files:**
- [ ] contact.html (multiple locations)
- [ ] about.html (footer)
- [ ] areas-covered.html (if it exists)
- [ ] book-your-clean.html (footer and success modal)
- [ ] Any other HTML pages

**Hero Images - Need to check:**
- [ ] about.html - change to vanhero2.jpeg or vanhero3.jpeg
- [ ] contact.html - change to vanhero2.jpeg or vanhero3.jpeg
- [ ] areas-covered.html - change to vanhero2.jpeg or vanhero3.jpeg
- [ ] book-your-clean.html - already uses leaf pattern background

**Mobile Responsiveness:**
- [ ] Test calendar on mobile devices
- [ ] Check "How It Works" section spacing on mobile
- [ ] May need CSS media query updates

**Netlify Email Integration:**
- [ ] The email function is already set up in netlify/functions/send-emails.js
- [ ] Verify the hidden form in index.html is working
- [ ] Test email delivery after a booking
- [ ] Update the contact number in send-emails.js to 07494 250556

---

## Testing Checklist

Before going live, test:
- [ ] Booking form with 20% discount enabled
- [ ] Booking form with 20% discount disabled (toggle in JS)
- [ ] Bundle selections (especially "All Bins" with recycling bag)
- [ ] 2 waste + 2 garden bins discount stacking
- [ ] Calendar on mobile devices
- [ ] Email notifications after booking
- [ ] All contact numbers throughout site
- [ ] Hero images on all pages
