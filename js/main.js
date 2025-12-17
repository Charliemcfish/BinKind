// ============================================
// BinKind - Main JavaScript
// ============================================

// ============================================
// GLOBAL STATE
// ============================================

// FIRST-TIME DISCOUNT TOGGLE
// Set this to true to enable 20% off first-time discount
// Set this to false to disable the discount
const FIRST_TIME_DISCOUNT_ENABLED = true;
const FIRST_TIME_DISCOUNT_PERCENTAGE = 20;

let currentStep = 1;
let bookingData = {
  // Step 1
  customerName: '',
  streetAddress: '',
  townCity: '',
  postcode: '',
  mobilePhone: '',
  email: '',
  confirmEmail: '',

  // Step 2
  frequency: '',

  // Step 3
  bins: {
    waste: 0,
    food: 0,
    recycling: 0,
    garden: 0,
    recyclingBag: 0
  },
  totalBins: 0,
  totalPrice: 0,

  // Step 4
  selectedDate: null
};

// Bin pricing - separate rates for one-off and monthly
const binPrices = {
  oneoff: {
    waste: 12,
    food: 3,
    recycling: 3,
    garden: 12,
    recyclingBag: 3
  },
  every6weeks: {
    waste: 6,
    food: 2,
    recycling: 2,
    garden: 6,
    recyclingBag: 2
  }
};

// Calendar state
let currentCalendarDate = new Date();
let selectedDate = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initScrollAnimations();
  initContactForm();
  initBookingForm();
  initCalendar();
});

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const toggle = document.querySelector('.navbar-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
      if (e.target === mobileMenu) {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-left, .animate-right, .animate-scale');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Optionally unobserve after animation to improve performance
        // observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));

  // Add stagger delay to grid items
  const grids = document.querySelectorAll('.features-grid, .how-it-works-grid, .pricing-grid');
  grids.forEach(grid => {
    const cards = grid.querySelectorAll('.feature-card, .step-card, .pricing-card');
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.1}s`;
    });
  });
}

// ============================================
// CONTACT FORM
// ============================================
function initContactForm() {
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Validate form
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      let isValid = true;

      // Name validation
      if (name === '') {
        showError('nameError');
        isValid = false;
      } else {
        hideError('nameError');
      }

      // Email validation
      if (!isValidEmail(email)) {
        showError('emailError');
        isValid = false;
      } else {
        hideError('emailError');
      }

      // Message validation
      if (message === '') {
        showError('messageError');
        isValid = false;
      } else {
        hideError('messageError');
      }

      // If validation fails, prevent submission
      if (!isValid) {
        e.preventDefault();
      }
      // If valid, allow Netlify Forms to handle submission (don't prevent default)
    });
  }
}

// ============================================
// BOOKING FORM - INITIALIZATION
// ============================================
function initBookingForm() {
  const bookingForm = document.getElementById('bookingForm');

  if (bookingForm) {
    // Prevent form submission
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
    });

    // Initialize bin displays
    ['waste', 'food', 'recycling', 'garden', 'recyclingBag'].forEach(binType => {
      updateBinDisplay(binType);
    });

    // Update progress bar
    updateProgressBar();
  }
}

// ============================================
// BOOKING FORM - NAVIGATION
// ============================================
function nextStep() {
  // Validate current step
  if (!validateStep(currentStep)) {
    return;
  }

  // Save current step data
  saveStepData(currentStep);

  // Move to next step
  if (currentStep < 4) {
    currentStep++;
    showStep(currentStep);
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If moving to step 4, populate summary
    if (currentStep === 4) {
      populateSummary();
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(s => {
    s.classList.remove('active');
  });

  // Show current step
  const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (currentStepEl) {
    currentStepEl.classList.add('active');
  }

  // Update progress indicator
  document.querySelectorAll('.progress-step').forEach((s, index) => {
    s.classList.remove('active', 'completed');
    if (index + 1 < step) {
      s.classList.add('completed');
    } else if (index + 1 === step) {
      s.classList.add('active');
    }
  });
}

function updateProgressBar() {
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    const progress = ((currentStep - 1) / 3) * 100;
    progressBar.style.width = progress + '%';
  }
}

// ============================================
// BOOKING FORM - VALIDATION
// ============================================
function validateStep(step) {
  let isValid = true;

  switch(step) {
    case 1:
      isValid = validateStep1();
      break;
    case 2:
      isValid = validateStep2();
      break;
    case 3:
      isValid = validateStep3();
      break;
    case 4:
      isValid = validateStep4();
      break;
  }

  return isValid;
}

function validateStep1() {
  let isValid = true;

  const name = document.getElementById('customerName').value.trim();
  const streetAddress = document.getElementById('streetAddress').value.trim();
  const townCity = document.getElementById('townCity').value.trim();
  const postcode = document.getElementById('postcode').value.trim();
  const mobilePhone = document.getElementById('mobilePhone').value.trim();
  const email = document.getElementById('email').value.trim();
  const confirmEmail = document.getElementById('confirmEmail').value.trim();

  // Name
  if (name === '') {
    showError('customerNameError');
    isValid = false;
  } else {
    hideError('customerNameError');
  }

  // Street Address
  if (streetAddress === '') {
    showError('streetAddressError');
    isValid = false;
  } else {
    hideError('streetAddressError');
  }

  // Town/City
  if (townCity === '') {
    showError('townCityError');
    isValid = false;
  } else {
    hideError('townCityError');
  }

  // Postcode
  if (postcode === '') {
    showError('postcodeError');
    isValid = false;
  } else {
    hideError('postcodeError');
  }

  // Mobile Phone
  if (mobilePhone === '') {
    showError('mobilePhoneError');
    isValid = false;
  } else {
    hideError('mobilePhoneError');
  }

  // Email
  if (!isValidEmail(email)) {
    showError('emailError');
    isValid = false;
  } else {
    hideError('emailError');
  }

  // Confirm Email
  if (email !== confirmEmail) {
    showError('confirmEmailError');
    isValid = false;
  } else {
    hideError('confirmEmailError');
  }

  return isValid;
}

function validateStep2() {
  let isValid = true;

  const frequency = document.getElementById('frequency').value;

  // Frequency
  if (frequency === '') {
    showError('frequencyError');
    isValid = false;
  } else {
    hideError('frequencyError');
  }

  return isValid;
}

function validateStep3() {
  const totalBins = parseInt(document.getElementById('totalBins').textContent);

  if (totalBins === 0) {
    document.getElementById('binsError').style.display = 'block';
    return false;
  } else {
    document.getElementById('binsError').style.display = 'none';
    return true;
  }
}

function validateStep4() {
  let isValid = true;

  // Check if date is selected
  if (!selectedDate) {
    document.getElementById('dateError').style.display = 'block';
    isValid = false;
  } else {
    document.getElementById('dateError').style.display = 'none';
  }

  // Check terms agreement
  const termsAgree = document.getElementById('termsAgree').checked;
  if (!termsAgree) {
    showError('termsError');
    isValid = false;
  } else {
    hideError('termsError');
  }

  return isValid;
}

function showError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.classList.add('visible');
  }
}

function hideError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.classList.remove('visible');
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// BOOKING FORM - DATA MANAGEMENT
// ============================================
function saveStepData(step) {
  switch(step) {
    case 1:
      bookingData.customerName = document.getElementById('customerName').value.trim();
      bookingData.streetAddress = document.getElementById('streetAddress').value.trim();
      bookingData.townCity = document.getElementById('townCity').value.trim();
      bookingData.postcode = document.getElementById('postcode').value.trim();
      bookingData.mobilePhone = document.getElementById('mobilePhone').value.trim();
      bookingData.email = document.getElementById('email').value.trim();
      bookingData.confirmEmail = document.getElementById('confirmEmail').value.trim();
      break;
    case 2:
      bookingData.frequency = document.getElementById('frequency').value;
      break;
    case 3:
      // Bins are already saved in real-time
      break;
    case 4:
      bookingData.selectedDate = selectedDate;
      break;
  }
}

// ============================================
// FREQUENCY UPDATE
// ============================================
function selectFrequency(frequency) {
  // Update hidden input
  document.getElementById('frequency').value = frequency;

  // Update button styles
  document.querySelectorAll('.frequency-btn').forEach(btn => {
    if (btn.dataset.frequency === frequency) {
      btn.style.borderColor = '#5b8855';
      btn.style.backgroundColor = 'rgba(91, 136, 85, 0.05)';
      btn.style.boxShadow = '0 4px 12px rgba(91, 136, 85, 0.2)';
    } else {
      btn.style.borderColor = '#e0e0e0';
      btn.style.backgroundColor = 'white';
      btn.style.boxShadow = 'none';
    }
  });

  // Hide error if shown
  hideError('frequencyError');

  // Update frequency info
  updateFrequencyInfo();
}

function updateFrequencyInfo() {
  const frequencyEl = document.getElementById('frequency');
  const recurringInfo = document.getElementById('recurringInfo');

  if (!frequencyEl || !recurringInfo) return;

  const frequency = frequencyEl.value;

  if (frequency === 'every6weeks') {
    recurringInfo.style.display = 'block';
  } else {
    recurringInfo.style.display = 'none';
  }

  // Update bin price labels
  updateBinPriceLabels();

  // Update bundle prices
  updateBundlePrices();
}

function updateBinPriceLabels() {
  const frequencyEl = document.getElementById('frequency');
  if (!frequencyEl) return;

  const frequency = frequencyEl.value;
  const label = frequency === 'every6weeks' ? '(Every 6 Weeks)' : '(One-Off)';
  const priceSet = binPrices[frequency] || binPrices.oneoff;

  // Update labels
  const wastePriceLabel = document.getElementById('wastePriceLabel');
  const foodPriceLabel = document.getElementById('foodPriceLabel');
  const recyclingPriceLabel = document.getElementById('recyclingPriceLabel');
  const gardenPriceLabel = document.getElementById('gardenPriceLabel');
  const recyclingBagPriceLabel = document.getElementById('recyclingBagPriceLabel');

  if (wastePriceLabel) wastePriceLabel.textContent = label;
  if (foodPriceLabel) foodPriceLabel.textContent = label;
  if (recyclingPriceLabel) recyclingPriceLabel.textContent = label;
  if (gardenPriceLabel) gardenPriceLabel.textContent = label;
  if (recyclingBagPriceLabel) recyclingBagPriceLabel.textContent = label;

  // Update prices with discount if enabled
  const wastePrice = document.getElementById('wastePrice');
  const foodPrice = document.getElementById('foodPrice');
  const recyclingPrice = document.getElementById('recyclingPrice');
  const gardenPrice = document.getElementById('gardenPrice');
  const recyclingBagPrice = document.getElementById('recyclingBagPrice');

  // Get price containers for styling
  const wastePriceContainer = document.getElementById('wastePriceContainer');
  const foodPriceContainer = document.getElementById('foodPriceContainer');
  const recyclingPriceContainer = document.getElementById('recyclingPriceContainer');
  const gardenPriceContainer = document.getElementById('gardenPriceContainer');
  const recyclingBagPriceContainer = document.getElementById('recyclingBagPriceContainer');

  // Function to update price display with discount
  function updatePriceDisplay(priceElement, priceContainer, originalPrice) {
    if (!priceElement || !priceContainer) return;

    if (FIRST_TIME_DISCOUNT_ENABLED) {
      const discountedPrice = originalPrice * (1 - FIRST_TIME_DISCOUNT_PERCENTAGE / 100);
      priceContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
          <span style="text-decoration: line-through; color: #9e9e9e; font-size: 1.25rem;">£${originalPrice}</span>
          <span style="color: #5b8855; font-size: 1.75rem; font-weight: 800;">£${discountedPrice.toFixed(2)}</span>
          <span style="color: #4caf50; font-size: 0.85rem; font-weight: 600; background: #e8f5e9; padding: 0.25rem 0.5rem; border-radius: 4px;">20% OFF</span>
        </div>
      `;
    } else {
      priceContainer.innerHTML = `<div class="price">£${originalPrice}</div>`;
    }
  }

  updatePriceDisplay(wastePrice, wastePriceContainer, priceSet.waste);
  updatePriceDisplay(foodPrice, foodPriceContainer, priceSet.food);
  updatePriceDisplay(recyclingPrice, recyclingPriceContainer, priceSet.recycling);
  updatePriceDisplay(gardenPrice, gardenPriceContainer, priceSet.garden);
  updatePriceDisplay(recyclingBagPrice, recyclingBagPriceContainer, priceSet.recyclingBag);

  // Recalculate total with new prices
  updateTotal();
}

// ============================================
// BIN SELECTION
// ============================================
function incrementBin(binType) {
  bookingData.bins[binType]++;
  updateBinDisplay(binType);
  updateTotal();
  updateCardSelection(binType);
}

function decrementBin(binType) {
  if (bookingData.bins[binType] > 0) {
    bookingData.bins[binType]--;
    updateBinDisplay(binType);
    updateTotal();
    updateCardSelection(binType);
  }
}

function updateBinDisplay(binType) {
  const quantity = bookingData.bins[binType];
  const quantityEl = document.getElementById(binType + 'Quantity');
  const decrementBtn = document.getElementById(binType + 'Decrement');

  // Only update if elements exist (on booking page)
  if (quantityEl) {
    quantityEl.textContent = quantity;
  }

  // Enable/disable decrement button
  if (decrementBtn) {
    if (quantity === 0) {
      decrementBtn.disabled = true;
    } else {
      decrementBtn.disabled = false;
    }
  }
}

function updateCardSelection(binType) {
  const card = document.querySelector(`.bin-selection-card[data-bin="${binType}"]`);
  if (card) {
    if (bookingData.bins[binType] > 0) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  }
}

function updateTotal() {
  let totalBins = 0;
  let totalPrice = 0;

  // Get current frequency (default to oneoff if not set)
  const frequency = document.getElementById('frequency')?.value || 'oneoff';
  const priceSet = binPrices[frequency] || binPrices.oneoff;

  // Count total bins
  Object.keys(bookingData.bins).forEach(binType => {
    const quantity = bookingData.bins[binType];
    totalBins += quantity;
  });

  // Check for bundle deals
  const wasteCount = bookingData.bins.waste || 0;
  const gardenCount = bookingData.bins.garden || 0;
  const foodCount = bookingData.bins.food || 0;
  const recyclingCount = bookingData.bins.recycling || 0;
  const recyclingBagCount = bookingData.bins.recyclingBag || 0;

  const largeBinsCount = wasteCount + gardenCount; // Both are 240L bins
  const smallBinsCount = foodCount + recyclingCount + recyclingBagCount;

  // Bundle Deal 1: Two large waste bins (waste or garden) for £20 one-off / £10 monthly
  const hasTwoLargeBins = largeBinsCount === 2 && smallBinsCount === 0;

  // Bundle Deal 2: All bins for £30 one-off / £15 monthly
  const hasAllBins = wasteCount >= 1 && gardenCount >= 1 && foodCount >= 1 && recyclingCount >= 1;

  // Check if we can apply stacked bundle deals (e.g., 2 waste + 2 garden = 2x bundle deal)
  const twoBinBundlePrice = frequency === 'oneoff' ? 20 : 10;
  const numOfTwoBinBundles = Math.floor(largeBinsCount / 2);
  const canStackBundles = largeBinsCount >= 4 && largeBinsCount % 2 === 0 && smallBinsCount === 0;

  if (hasAllBins) {
    // Apply "all bins" bundle pricing
    totalPrice = frequency === 'oneoff' ? 25 : 15;
  } else if (canStackBundles) {
    // Stack multiple 2-bin bundles (e.g., 4 large bins = 2x £20 or 2x £10)
    totalPrice = numOfTwoBinBundles * twoBinBundlePrice;
  } else if (hasTwoLargeBins) {
    // Apply "two waste bins" bundle pricing
    totalPrice = twoBinBundlePrice;
  } else {
    // Regular pricing
    Object.keys(bookingData.bins).forEach(binType => {
      const quantity = bookingData.bins[binType];
      totalPrice += quantity * priceSet[binType];
    });
  }

  // Apply first-time discount if enabled
  if (FIRST_TIME_DISCOUNT_ENABLED) {
    totalPrice = totalPrice * (1 - FIRST_TIME_DISCOUNT_PERCENTAGE / 100);
  }

  bookingData.totalBins = totalBins;
  bookingData.totalPrice = totalPrice;

  const totalBinsEl = document.getElementById('totalBins');
  const totalPriceEl = document.getElementById('totalPrice');

  if (totalBinsEl) {
    totalBinsEl.textContent = totalBins;
  }
  if (totalPriceEl) {
    totalPriceEl.textContent = totalPrice.toFixed(2);
  }

  // Show bundle deal notification if applicable
  showBundleNotification(hasAllBins, hasTwoLargeBins, frequency);
}

function showBundleNotification(hasAllBins, hasTwoLargeBins, frequency) {
  // Remove existing bundle notification if any
  const existingNotif = document.getElementById('bundleNotification');
  if (existingNotif) {
    existingNotif.remove();
  }

  const totalContainer = document.querySelector('.booking-total');
  if (!totalContainer) return;

  let message = '';
  if (hasAllBins) {
    const price = frequency === 'oneoff' ? '£25' : '£15';
    message = `🎉 Bundle Deal Applied! All bins for ${price}`;
  } else if (hasTwoLargeBins) {
    const price = frequency === 'oneoff' ? '£20' : '£10';
    message = `🎉 Bundle Deal Applied! Two waste bins for ${price}`;
  }

  if (message) {
    const notification = document.createElement('div');
    notification.id = 'bundleNotification';
    notification.style.cssText = 'background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #5b8855; border-radius: 8px; padding: 1rem; margin-top: 1rem; text-align: center; color: #1b5e20; font-weight: 600; font-size: 1.125rem;';
    notification.textContent = message;
    totalContainer.parentNode.insertBefore(notification, totalContainer.nextSibling);
  }
}

// ============================================
// BOOKING SUMMARY
// ============================================
function populateSummary() {
  // Your Details
  document.getElementById('summaryName').textContent = bookingData.customerName;
  document.getElementById('summaryAddress').textContent =
    `${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}`;
  document.getElementById('summaryPhone').textContent = bookingData.mobilePhone;
  document.getElementById('summaryEmail').textContent = bookingData.email;

  // Selected Bins
  const summaryBinsEl = document.getElementById('summaryBins');
  summaryBinsEl.innerHTML = '';

  const binNames = {
    waste: 'General Waste Bin (Up to 240L)',
    food: 'Food Caddy (Up to 55L)',
    recycling: 'Recycling Container (Boxes & Bags)',
    garden: 'Garden Waste Bin (Up to 240L)',
    recyclingBag: 'Recycling Bag (Bags Only)'
  };

  const binEmojis = {
    waste: '🗑️',
    food: '🥫',
    recycling: '♻️',
    garden: '🌿',
    recyclingBag: '♻️'
  };

  // Get price set based on frequency
  const frequency = bookingData.frequency || 'oneoff';
  const priceSet = binPrices[frequency] || binPrices.oneoff;

  Object.keys(bookingData.bins).forEach(binType => {
    const quantity = bookingData.bins[binType];
    if (quantity > 0) {
      const price = (quantity * priceSet[binType]).toFixed(2);
      const div = document.createElement('div');
      div.className = 'summary-item';
      div.innerHTML = `
        <span><span style="font-size: 1.25rem; margin-right: 0.5rem;">${binEmojis[binType]}</span>${binNames[binType]} x${quantity}</span>
        <span>£${price}</span>
      `;
      summaryBinsEl.appendChild(div);
    }
  });

  // Frequency
  const frequencyText = bookingData.frequency === 'every6weeks' ? 'Every 6 Weeks (Recurring)' : 'One-Off Clean';
  document.getElementById('summaryFrequency').textContent = frequencyText;

  // Total
  document.getElementById('summaryTotal').textContent = bookingData.totalPrice.toFixed(2);

  // Update payment method info
  const paymentMethodInfo = document.getElementById('paymentMethodInfo');
  if (paymentMethodInfo) {
    if (bookingData.frequency === 'every6weeks') {
      paymentMethodInfo.textContent = 'You will set up a Direct Debit mandate for automatic recurring payments.';
    } else {
      paymentMethodInfo.textContent = 'You will authorize a one-time Direct Debit payment.';
    }
  }
}

// ============================================
// CALENDAR
// ============================================
function initCalendar() {
  const calendarDays = document.getElementById('calendarDays');
  if (calendarDays) {
    renderCalendar();
  }
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // Update month header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust so Monday = 0
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  // Get last day of month
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Clear calendar
  const calendarDays = document.getElementById('calendarDays');
  calendarDays.innerHTML = '';

  // Add empty cells for days before month starts
  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyDiv = document.createElement('div');
    calendarDays.appendChild(emptyDiv);
  }

  // Add days of month
  const today = new Date();
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(today.getDate() + 2);

  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;

    // Check if weekend (Saturday = 6, Sunday = 0)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check if in past or within 2 days
    const isPastOrTooSoon = date < twoDaysFromNow;

    // Disable if weekend or too soon
    if (isWeekend || isPastOrTooSoon) {
      dayDiv.classList.add('disabled');
    } else {
      // Check if this is the selected date
      if (selectedDate &&
          selectedDate.getDate() === day &&
          selectedDate.getMonth() === month &&
          selectedDate.getFullYear() === year) {
        dayDiv.classList.add('selected');
      }

      // Add click handler
      dayDiv.addEventListener('click', function() {
        selectDate(date);
      });
    }

    // Mark today
    if (date.toDateString() === today.toDateString()) {
      dayDiv.classList.add('today');
    }

    calendarDays.appendChild(dayDiv);
  }
}

function selectDate(date) {
  selectedDate = date;
  renderCalendar();

  // Show selected date
  const dateStr = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  document.getElementById('selectedDateDisplay').style.display = 'block';
  document.getElementById('selectedDateText').textContent = dateStr;
  document.getElementById('dateError').style.display = 'none';
}

function previousMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  renderCalendar();
}

// ============================================
// COMPLETE BOOKING
// ============================================
async function completeBooking() {
  if (!validateStep4()) {
    return;
  }

  saveStepData(4);

  // Show loading state
  const completeButton = document.querySelector('[onclick="completeBooking()"]');
  const originalButtonText = completeButton.innerHTML;
  completeButton.disabled = true;
  completeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  try {
    // Prepare booking data for API
    const bookingPayload = {
      customerName: bookingData.customerName,
      email: bookingData.email,
      streetAddress: bookingData.streetAddress,
      townCity: bookingData.townCity,
      postcode: bookingData.postcode,
      mobilePhone: bookingData.mobilePhone,
      frequency: bookingData.frequency,
      bins: bookingData.bins,
      totalBins: bookingData.totalBins,
      totalPrice: bookingData.totalPrice,
      selectedDate: selectedDate.toISOString()
    };

    // Call create-payment API
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment');
    }

    const result = await response.json();

    // Store booking data and redirect URL for return flow
    sessionStorage.setItem('bookingData', JSON.stringify(result.bookingData));
    sessionStorage.setItem('bookingReference', result.bookingReference);

    // Redirect to GoCardless payment page
    window.location.href = result.redirectUrl;

  } catch (error) {
    console.error('Error creating payment:', error);

    // Reset button
    completeButton.disabled = false;
    completeButton.innerHTML = originalButtonText;

    // Show error message
    alert('Payment Error: ' + error.message + '\n\nPlease try again or contact us at 07494 250556 if the problem persists.');
  }
}

// ============================================
// MODAL
// ============================================
function showModal() {
  const modal = document.getElementById('successModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function bookAnother() {
  // Reset form
  currentStep = 1;
  bookingData = {
    customerName: '',
    streetAddress: '',
    townCity: '',
    postcode: '',
    mobilePhone: '',
    email: '',
    confirmEmail: '',
    frequency: '',
    bins: {
      waste: 0,
      food: 0,
      recycling: 0,
      garden: 0
    },
    totalBins: 0,
    totalPrice: 0,
    selectedDate: null
  };

  // Reset form inputs
  document.getElementById('bookingForm').reset();

  // Reset bins
  ['waste', 'food', 'recycling', 'garden', 'recyclingBag'].forEach(binType => {
    updateBinDisplay(binType);
    updateCardSelection(binType);
  });

  updateTotal();

  // Reset calendar
  selectedDate = null;
  currentCalendarDate = new Date();
  renderCalendar();
  document.getElementById('selectedDateDisplay').style.display = 'none';

  // Go to step 1
  showStep(1);
  updateProgressBar();

  // Close modal
  closeModal();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('successModal');
  if (e.target === modal) {
    closeModal();
  }
});

// ============================================
// BUNDLE SELECTION
// ============================================
function selectBundle(bundleType) {
  // Reset all bins first
  bookingData.bins = {
    waste: 0,
    food: 0,
    recycling: 0,
    garden: 0,
    recyclingBag: 0
  };

  // Apply bundle based on type
  if (bundleType === 'twoBins') {
    // Two large bins - 1 waste + 1 garden
    bookingData.bins.waste = 1;
    bookingData.bins.garden = 1;
  } else if (bundleType === 'fourBins') {
    // All bins including recycling bag
    bookingData.bins.waste = 1;
    bookingData.bins.garden = 1;
    bookingData.bins.food = 1;
    bookingData.bins.recycling = 1;
    bookingData.bins.recyclingBag = 1;
  }

  // Update displays
  ['waste', 'food', 'recycling', 'garden', 'recyclingBag'].forEach(binType => {
    updateBinDisplay(binType);
    updateCardSelection(binType);
  });

  // Update total
  updateTotal();

  // Visual feedback
  document.querySelectorAll('.bundle-btn').forEach(btn => {
    btn.style.borderColor = 'transparent';
  });
  event.target.closest('.bundle-btn').style.borderColor = '#5b8855';

  // Scroll to bins section
  setTimeout(() => {
    document.querySelector('.bin-selection-grid').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 300);
}

// Update bundle deal prices when frequency changes
function updateBundlePrices() {
  const frequency = document.getElementById('frequency')?.value || 'oneoff';

  // Two bins bundle
  const twoBinsPrice = document.getElementById('twoBinsPrice');
  const twoBinsLabel = document.getElementById('twoBinsLabel');
  const twoBinsMonthly = document.getElementById('twoBinsMonthly');

  if (twoBinsPrice) {
    twoBinsPrice.textContent = frequency === 'oneoff' ? '20' : '10';
  }
  if (twoBinsLabel) {
    twoBinsLabel.textContent = frequency === 'oneoff' ? 'one-off' : 'monthly';
  }
  if (twoBinsMonthly) {
    twoBinsMonthly.textContent = frequency === 'oneoff' ? '£10/month' : 'subscription';
  }

  // Four bins bundle
  const fourBinsPrice = document.getElementById('fourBinsPrice');
  const fourBinsLabel = document.getElementById('fourBinsLabel');
  const fourBinsMonthly = document.getElementById('fourBinsMonthly');

  if (fourBinsPrice) {
    fourBinsPrice.textContent = frequency === 'oneoff' ? '25' : '15';
  }
  if (fourBinsLabel) {
    fourBinsLabel.textContent = frequency === 'oneoff' ? 'one-off' : 'monthly';
  }
  if (fourBinsMonthly) {
    fourBinsMonthly.textContent = frequency === 'oneoff' ? '£15/month' : 'subscription';
  }
}
