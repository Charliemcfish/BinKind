# BinKind - Professional Bin Cleaning Service Website

A modern, responsive website for BinKind's professional wheelie bin cleaning service in Yeovil and Somerset.

## 🌟 Project Overview

BinKind is a complete website solution for a mobile bin cleaning service, featuring an intuitive booking system, service area information, and professional branding. This is **Phase 1** of the project, focusing on the complete UI/UX and frontend functionality.

## 🎨 Design & Branding

### Color Palette
- **Primary Green**: `#5b8855` - Headers, CTAs, accents
- **Primary Dark**: `#1b1b1b` - Text, backgrounds
- **White/Light**: `#ffffff`, `#f5f5f5` - Backgrounds and contrast

### Design Principles
- Clean, modern, minimalist aesthetic
- Professional and trustworthy appearance
- Smooth animations and micro-interactions
- Fully responsive across all devices
- Accessible with good contrast ratios

### Typography
- **Font**: Inter (Google Fonts)
- Clear hierarchy with multiple font weights (400-800)
- Generous line-height for readability

## 📁 Project Structure

```
BinKind/
├── index.html                 # Homepage
├── areas-covered.html         # Service coverage areas
├── contact.html              # Contact form and information
├── book-your-clean.html      # Multi-step booking system
├── css/
│   └── styles.css            # Comprehensive stylesheet
├── js/
│   └── main.js               # All interactive functionality
├── assets/
│   ├── BinKind Icon Black + Green.png
│   ├── BinKind Icon White + Green.png
│   ├── BinKind Logo Black + Green.png
│   ├── BinKind Logo White + Green.png
│   └── binkind-van.jpg
└── README.md
```

## 🚀 Features

### 1. Homepage (`index.html`)
- **Hero Section**: Full-width with van background image
- **How It Works**: 4-step process explanation
- **Benefits/Features**: 6 key selling points with icons
- **Pricing Preview**: 4 bin types with pricing
- **Areas Covered**: Quick overview with link to detailed page
- **Call-to-Action**: Multiple CTAs throughout
- **Sticky Navigation**: Always accessible menu

### 2. Areas Covered (`areas-covered.html`)
- Visual service area display
- Coverage details for:
  - Yeovil
  - Chard
  - Crewkerne
  - Sherborne
  - Surrounding areas
- "Why Local Matters" section
- Postcode enquiry CTA

### 3. Contact Page (`contact.html`)
- Contact information with click-to-call/email
- Working contact form with validation
- Success message display
- FAQ section with expandable details
- Business hours and service area info

### 4. Booking System (`book-your-clean.html`) ⭐

The most sophisticated page featuring a **4-step booking process**:

#### Step 1: Your Details
- Name, address, town/city, postcode
- Mobile phone with UK country code
- Email with confirmation field
- Real-time validation

#### Step 2: Cleaning Options
- Frequency selector (Every 4 Weeks / One-Off)
- Council area dropdown
- Dynamic info message for recurring payments

#### Step 3: Select Bins
- **Visual bin cards** with emojis
- **4 bin types**:
  - Waste Wheelie (Up to 240L) - £12.49
  - Food Caddy (Up to 55L) - £5.99
  - Recycling Box (Up to 55L) - £3.49
  - Garden Wheelie (Up to 240L) - £12.49
- Quantity selectors (+/- buttons)
- Dynamic total calculator
- Price labels update based on frequency
- Card selection highlighting

#### Step 4: Confirmation
- Complete booking summary
- **Interactive calendar date picker**:
  - Blocks weekends (Saturday/Sunday)
  - Requires 2 days notice
  - Visual date selection
  - Monday-Friday operation only
- Payment placeholder (GoCardless integration planned for Phase 2)
- Terms & conditions checkbox
- Complete booking button

### Progress Indicator
- Visual 4-step progress bar
- Step numbers and labels
- Completed/active state highlighting
- Smooth transitions between steps

### Success Modal
- Animated success confirmation
- Booking reference number
- Complete booking summary
- Contact information for changes
- Email confirmation notice
- "Book Another Clean" option

## 🔧 Technical Implementation

### HTML5
- Semantic markup
- Accessible structure
- Proper meta tags and SEO-friendly

### CSS3
- Custom properties (CSS variables)
- Flexbox and Grid layouts
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Hover effects throughout
- Print styles included

### JavaScript (Vanilla)
- **Mobile Menu**: Hamburger toggle with overlay
- **Form Validation**:
  - Email format checking
  - Required field validation
  - Email confirmation matching
  - Inline error messages
- **Multi-Step Form**:
  - Navigation between steps
  - Data persistence
  - Progress tracking
- **Bin Selection**:
  - Increment/decrement quantity
  - Real-time price calculation
  - Visual card selection
- **Calendar System**:
  - Month navigation
  - Business rule enforcement (weekends, 2-day notice)
  - Date selection and display
- **Booking Summary**: Auto-population from form data
- **Modal Management**: Success confirmation display

### Responsive Breakpoints
- **Mobile**: 375px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

All elements are fully responsive with appropriate mobile navigation and touch-friendly interactions.

## 🎯 Form Validation

### Step 1 Validation
- ✓ Name required
- ✓ Complete address required
- ✓ Valid email format
- ✓ Email confirmation match
- ✓ Phone number required

### Step 2 Validation
- ✓ Frequency selection required
- ✓ Council area required

### Step 3 Validation
- ✓ At least 1 bin must be selected

### Step 4 Validation
- ✓ Date must be selected
- ✓ Date must be weekday (Mon-Fri)
- ✓ Date must be 2+ days in future
- ✓ Terms & conditions must be accepted

## 📱 Browser Compatibility

- ✓ Chrome (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Edge (latest)
- ✓ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚦 Phase 1 vs Phase 2

### ✅ Phase 1 (COMPLETE)
- Full website design and UI/UX
- All 4 pages built and styled
- Multi-step booking form
- Calendar date picker
- Form validation
- Success modal
- Responsive design
- All animations and interactions

### 🔜 Phase 2 (Planned)
- **GoCardless Integration**:
  - Direct Debit setup
  - Payment processing
  - Recurring payment management
- **Backend/Serverless**:
  - Netlify Functions
  - Form submission handling
  - Booking storage
- **Email Notifications**:
  - Customer confirmation emails
  - Business notification emails
  - Booking reminders
- **Calendar Integration**:
  - Real booking slot management
  - Availability tracking
  - Admin dashboard

## 🛠️ Setup & Installation

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Charliemcfish/BinKind.git
   cd BinKind
   ```

2. **Open in browser**:
   Simply open `index.html` in your web browser, or use a local server:

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (http-server)
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```

3. **View the site**:
   Navigate to `http://localhost:8000`

### Deployment

The site is pure HTML/CSS/JavaScript and can be deployed to any static hosting service:

- **Netlify**: Drag and drop the entire folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Enable in repository settings
- **Traditional hosting**: Upload via FTP to web server

## 📋 Testing Checklist

### Homepage
- [x] Hero section displays correctly
- [x] All sections load and animate
- [x] Navigation works on all devices
- [x] CTAs link to booking page
- [x] Footer displays contact info

### Areas Covered
- [x] Coverage areas display
- [x] Map section visible
- [x] Contact CTA works

### Contact
- [x] Form validation works
- [x] Success message displays
- [x] Click-to-call works on mobile
- [x] Email links functional

### Booking System
- [x] Step 1: All fields validate
- [x] Step 2: Frequency info shows/hides
- [x] Step 3: Bins increment/decrement
- [x] Step 3: Total calculates correctly
- [x] Step 4: Calendar blocks weekends
- [x] Step 4: Calendar blocks past dates
- [x] Step 4: Summary populates correctly
- [x] Success modal displays
- [x] "Book Another" resets form

### Responsive Design
- [x] Mobile menu works
- [x] Forms work on mobile
- [x] Calendar usable on touch devices
- [x] No horizontal scrolling
- [x] Text remains readable

## 🎨 Customization Guide

### Changing Colors
Edit CSS variables in `/css/styles.css`:
```css
:root {
  --primary-green: #5b8855;
  --primary-dark: #1b1b1b;
  /* ... other variables */
}
```

### Updating Pricing
Edit the `binPrices` object in `/js/main.js`:
```javascript
const binPrices = {
  waste: 12.49,
  food: 5.99,
  recycling: 3.49,
  garden: 12.49
};
```

### Adding Service Areas
Edit the council dropdown in `book-your-clean.html`:
```html
<select id="councilArea">
  <option value="new-area">New Area Council</option>
</select>
```

### Changing Contact Details
Update placeholder contact info in all HTML files:
- Phone: `07777 777777`
- Email: `info@binkind.com`

## 🐛 Known Issues / Limitations (Phase 1)

1. **No actual payment processing** - Placeholder only
2. **No email sending** - Success message is visual only
3. **No booking persistence** - Data is client-side only
4. **Calendar doesn't check real availability** - Just blocks weekends and past dates
5. **Contact form doesn't send emails** - Shows success message only

All of these are intentional for Phase 1 and will be addressed in Phase 2.

## 📧 Support & Contact

For questions or issues:
- **Email**: info@binkind.com
- **Phone**: 07777 777777

## 📄 License

All rights reserved © 2024 BinKind

## 🙏 Acknowledgments

- Design inspired by research of BinButler.co.uk
- Google Fonts (Inter)
- Pure vanilla JavaScript - no frameworks needed!

---

**Built with ❤️ for BinKind - Professional Bin Cleaning Service**
