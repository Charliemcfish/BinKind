/**
 * BinKind - Send Emails Function
 *
 * This Netlify Function sends confirmation emails to both:
 * 1. The client (business owner) - detailed booking information
 * 2. The customer - friendly confirmation email
 *
 * NOTE: This implementation uses Netlify Forms for email delivery.
 * In production, you may want to use a dedicated email service like:
 * - SendGrid
 * - Mailgun
 * - AWS SES
 * - Postmark
 *
 * For now, this will log the emails and you should configure Netlify Form
 * notifications to receive them.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Format booking data for email display
 */
function formatBookingForEmail(bookingData) {
  const binNames = {
    waste: 'General Waste Bin (Up to 240L)',
    food: 'Food Caddy (Up to 55L)',
    recycling: 'Recycling Container (Boxes & Bags)',
    garden: 'Garden Waste Bin (Up to 240L)',
    recyclingBag: 'Recycling Bag (Bags Only)'
  };

  let binsList = '';
  Object.keys(bookingData.bins).forEach(binType => {
    const quantity = bookingData.bins[binType];
    if (quantity > 0) {
      binsList += `- ${binNames[binType]} x${quantity}\n`;
    }
  });

  return binsList;
}

/**
 * Generate client (business owner) email content
 */
function generateClientEmail(bookingData, paymentInfo) {
  const binsList = formatBookingForEmail(bookingData);
  const isRecurring = bookingData.frequency === 'every4weeks';
  const paymentStatus = isRecurring ? 'Confirmed (Recurring Subscription)' : 'Confirmed (One-time Payment)';

  const dateFormatted = new Date(bookingData.selectedDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
NEW BOOKING RECEIVED - BinKind Cleaning

CUSTOMER DETAILS:
Name: ${bookingData.customerName}
Email: ${bookingData.email}
Phone: ${bookingData.mobilePhone}
Address: ${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}

CLEANING DETAILS:
Date: ${dateFormatted}
Frequency: ${isRecurring ? 'Every 4 Weeks (Recurring)' : 'One-Off Cleaning'}
Council Area: ${bookingData.councilArea}

BINS SELECTED:
${binsList}
TOTAL BINS: ${bookingData.totalBins}
TOTAL PAYMENT: £${bookingData.totalPrice.toFixed(2)}

PAYMENT STATUS: ${paymentStatus}
${isRecurring ? `\nRECURRING: Customer will be automatically charged £${bookingData.totalPrice.toFixed(2)} every 4 weeks via Direct Debit.` : ''}

BOOKING REFERENCE: ${bookingData.bookingReference}

${paymentInfo.paymentId ? `GoCardless Payment ID: ${paymentInfo.paymentId}` : ''}
${paymentInfo.subscriptionId ? `GoCardless Subscription ID: ${paymentInfo.subscriptionId}` : ''}

---
ACTION REQUIRED: This booking needs to be manually added to Squeegee.
---
  `.trim();
}

/**
 * Generate customer confirmation email content
 */
function generateCustomerEmail(bookingData) {
  const binsList = formatBookingForEmail(bookingData);
  const isRecurring = bookingData.frequency === 'every4weeks';

  const dateFormatted = new Date(bookingData.selectedDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
Hi ${bookingData.customerName.split(' ')[0]},

Thank you for booking with BinKind!

Your bin cleaning has been confirmed for ${dateFormatted}.

BOOKING SUMMARY:
Address: ${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}
Date: ${dateFormatted}

Bins:
${binsList}
Total: £${bookingData.totalPrice.toFixed(2)}

${isRecurring ? `
PAYMENT DETAILS:
Your first payment of £${bookingData.totalPrice.toFixed(2)} has been processed via Direct Debit.
You'll be automatically charged £${bookingData.totalPrice.toFixed(2)} every 4 weeks for your regular bin cleaning service.
` : `
PAYMENT DETAILS:
Payment: £${bookingData.totalPrice.toFixed(2)} (One-time payment)
Your payment has been processed successfully.
`}

NEED TO CANCEL OR REBOOK?
Call us at: 07494 250556
Email: binkindsw@gmail.com

We'll see you on ${dateFormatted}!

Best regards,
The BinKind Team

---
Booking Reference: ${bookingData.bookingReference}
  `.trim();
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { bookingData, paymentId, subscriptionId } = JSON.parse(event.body);

    if (!bookingData) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing booking data' })
      };
    }

    const paymentInfo = {
      paymentId: paymentId || null,
      subscriptionId: subscriptionId || null
    };

    // Generate email content
    const clientEmailContent = generateClientEmail(bookingData, paymentInfo);
    const customerEmailContent = generateCustomerEmail(bookingData);

    // Submit booking to Netlify Forms for email notification
    // This will trigger Netlify to send email notifications to configured addresses
    const formData = new URLSearchParams();
    formData.append('form-name', 'booking-notification');
    formData.append('booking-reference', bookingData.bookingReference);
    formData.append('customer-name', bookingData.customerName);
    formData.append('customer-email', bookingData.email);
    formData.append('customer-phone', bookingData.mobilePhone);
    formData.append('customer-address', `${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}`);
    formData.append('booking-date', bookingData.selectedDate);
    formData.append('frequency', bookingData.frequency === 'every4weeks' ? 'Every 4 Weeks (Recurring)' : 'One-Off Cleaning');
    formData.append('total-bins', bookingData.totalBins);
    formData.append('total-price', `£${bookingData.totalPrice.toFixed(2)}`);
    formData.append('payment-id', paymentInfo.paymentId || 'N/A');
    formData.append('subscription-id', paymentInfo.subscriptionId || 'N/A');
    formData.append('client-email-content', clientEmailContent);
    formData.append('customer-email-content', customerEmailContent);

    try {
      // Submit to Netlify Forms
      const netlifyResponse = await fetch(`${process.env.SITE_URL || 'https://binkind.co.uk'}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      console.log('Booking notification submitted to Netlify Forms');
    } catch (netlifyError) {
      console.error('Error submitting to Netlify Forms:', netlifyError);
      // Continue anyway - payment was successful
    }

    // Also log for debugging
    console.log('=== CLIENT EMAIL ===');
    console.log('To:', process.env.CLIENT_EMAIL || 'charlielfisher@hotmail.com');
    console.log('Subject: New Booking - BinKind Cleaning');
    console.log(clientEmailContent);
    console.log('\n=== CUSTOMER EMAIL ===');
    console.log('To:', bookingData.email);
    console.log('Subject: Booking Confirmation - BinKind');
    console.log(customerEmailContent);

    // For development: Return email content in response
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Emails queued for sending',
        // Include email content in development mode
        emails: process.env.GOCARDLESS_ENVIRONMENT === 'Sandbox' ? {
          client: {
            to: process.env.CLIENT_EMAIL || 'charlielfisher@hotmail.com',
            subject: 'New Booking - BinKind Cleaning',
            content: clientEmailContent
          },
          customer: {
            to: bookingData.email,
            subject: 'Booking Confirmation - BinKind',
            content: customerEmailContent
          }
        } : undefined
      })
    };

  } catch (error) {
    console.error('Error sending emails:', error);

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to send emails',
        details: process.env.GOCARDLESS_ENVIRONMENT === 'Sandbox' ? error.message : undefined
      })
    };
  }
};
