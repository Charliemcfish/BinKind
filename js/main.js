// ============================================
// BinKind - Main JavaScript
// ============================================

// ============================================
// GLOBAL STATE
// ============================================
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
  councilArea: '',

  // Step 3
  bins: {
    waste: 0,
    food: 0,
    recycling: 0,
    garden: 0
  },
  totalBins: 0,
  totalPrice: 0,

  // Step 4
  selectedDate: null
};

// Bin pricing
const binPrices = {
  waste: 12.49,
  food: 5.99,
  recycling: 3.49,
  garden: 12.49
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
      e.preventDefault();

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

      if (isValid) {
        // Show success message
        contactForm.style.display = 'none';
        document.getElementById('contactFormSuccess').style.display = 'block';

        // Reset form after 3 seconds
        setTimeout(() => {
          contactForm.reset();
          contactForm.style.display = 'block';
          document.getElementById('contactFormSuccess').style.display = 'none';
        }, 5000);
      }
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
    ['waste', 'food', 'recycling', 'garden'].forEach(binType => {
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
  const councilArea = document.getElementById('councilArea').value;

  // Frequency
  if (frequency === '') {
    showError('frequencyError');
    isValid = false;
  } else {
    hideError('frequencyError');
  }

  // Council Area
  if (councilArea === '') {
    showError('councilAreaError');
    isValid = false;
  } else {
    hideError('councilAreaError');
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
      bookingData.councilArea = document.getElementById('councilArea').value;
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
  const frequency = document.getElementById('frequency').value;
  const recurringInfo = document.getElementById('recurringInfo');

  if (frequency === 'every4weeks') {
    recurringInfo.style.display = 'block';
  } else {
    recurringInfo.style.display = 'none';
  }

  // Update bin price labels
  updateBinPriceLabels();
}

function updateBinPriceLabels() {
  const frequency = document.getElementById('frequency').value;
  const label = frequency === 'every4weeks' ? '(Every 4 Weeks)' : '(One-Off)';

  document.getElementById('wastePriceLabel').textContent = label;
  document.getElementById('foodPriceLabel').textContent = label;
  document.getElementById('recyclingPriceLabel').textContent = label;
  document.getElementById('gardenPriceLabel').textContent = label;
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
  document.getElementById(binType + 'Quantity').textContent = quantity;

  // Enable/disable decrement button
  const decrementBtn = document.getElementById(binType + 'Decrement');
  if (quantity === 0) {
    decrementBtn.disabled = true;
  } else {
    decrementBtn.disabled = false;
  }
}

function updateCardSelection(binType) {
  const card = document.querySelector(`.bin-selection-card[data-bin="${binType}"]`);
  if (bookingData.bins[binType] > 0) {
    card.classList.add('selected');
  } else {
    card.classList.remove('selected');
  }
}

function updateTotal() {
  let totalBins = 0;
  let totalPrice = 0;

  Object.keys(bookingData.bins).forEach(binType => {
    const quantity = bookingData.bins[binType];
    totalBins += quantity;
    totalPrice += quantity * binPrices[binType];
  });

  bookingData.totalBins = totalBins;
  bookingData.totalPrice = totalPrice;

  document.getElementById('totalBins').textContent = totalBins;
  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
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
    waste: 'Waste Wheelie (Up to 240L)',
    food: 'Food Caddy (Up to 55L)',
    recycling: 'Recycling Box (Up to 55L)',
    garden: 'Garden Wheelie (Up to 240L)'
  };

  const binEmojis = {
    waste: '🗑️',
    food: '🥫',
    recycling: '♻️',
    garden: '🌿'
  };

  Object.keys(bookingData.bins).forEach(binType => {
    const quantity = bookingData.bins[binType];
    if (quantity > 0) {
      const price = (quantity * binPrices[binType]).toFixed(2);
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
  const frequencyText = bookingData.frequency === 'every4weeks' ? 'Every 4 Weeks (Recurring)' : 'One-Off Clean';
  document.getElementById('summaryFrequency').textContent = frequencyText;

  // Total
  document.getElementById('summaryTotal').textContent = bookingData.totalPrice.toFixed(2);
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
function completeBooking() {
  if (!validateStep4()) {
    return;
  }

  saveStepData(4);

  // Generate booking reference
  const bookingRef = 'BK' + Date.now().toString().slice(-8);

  // Populate modal
  document.getElementById('bookingRef').textContent = bookingRef;
  document.getElementById('modalName').textContent = bookingData.customerName;

  const dateStr = selectedDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('modalDate').textContent = dateStr;

  document.getElementById('modalBins').textContent = bookingData.totalBins;
  document.getElementById('modalTotal').textContent = bookingData.totalPrice.toFixed(2);

  const frequencyText = bookingData.frequency === 'every4weeks' ?
    'Every 4 Weeks (Recurring)' : 'One-Off Clean';
  document.getElementById('modalFrequency').textContent = frequencyText;

  document.getElementById('modalEmail').textContent = bookingData.email;

  // Show modal
  showModal();
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
    councilArea: '',
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
  ['waste', 'food', 'recycling', 'garden'].forEach(binType => {
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
