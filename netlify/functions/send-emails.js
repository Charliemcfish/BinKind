/**
 * BinKind - Send Emails Function using Resend
 *
 * This Netlify Function sends confirmation emails using Resend API
 * 1. Client (business owner) - detailed booking information
 * 2. Customer - friendly confirmation email
 *
 * Setup Required:
 * 1. Sign up at https://resend.com (free: 3,000 emails/month)
 * 2. Verify your domain OR use resend's test domain
 * 3. Get API key from Resend dashboard
 * 4. Add RESEND_API_KEY to Netlify environment variables
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
  const isRecurring = bookingData.frequency === 'every6weeks';
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
Frequency: ${isRecurring ? 'Every 6 Weeks (Recurring)' : 'One-Off Cleaning'}
Council Area: ${bookingData.councilArea}

BINS SELECTED:
${binsList}
TOTAL BINS: ${bookingData.totalBins}
TOTAL PAYMENT: £${bookingData.totalPrice.toFixed(2)}

PAYMENT STATUS: ${paymentStatus}
${isRecurring ? `\nRECURRING: Customer will be automatically charged £${bookingData.totalPrice.toFixed(2)} every 6 weeks via Direct Debit.` : ''}

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
  const isRecurring = bookingData.frequency === 'every6weeks';

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
You'll be automatically charged £${bookingData.totalPrice.toFixed(2)} every 6 weeks for your regular bin cleaning service.
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

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      console.log('=== CLIENT EMAIL ===');
      console.log(clientEmailContent);
      console.log('\n=== CUSTOMER EMAIL ===');
      console.log(customerEmailContent);

      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Email service not configured. Please contact support.',
          debug: 'RESEND_API_KEY environment variable not set'
        })
      };
    }

    // Send emails using Resend API
    const clientEmail = process.env.CLIENT_EMAIL || 'charlielfisher@hotmail.com';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Use your verified domain

    // Send email to client (business owner)
    const clientResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: clientEmail,
        subject: `New Booking - ${bookingData.bookingReference}`,
        text: clientEmailContent
      })
    });

    if (!clientResponse.ok) {
      const error = await clientResponse.text();
      console.error('Failed to send client email:', error);
      throw new Error('Failed to send client notification email');
    }

    // Send confirmation email to customer
    const customerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: bookingData.email,
        subject: 'Booking Confirmation - BinKind',
        text: customerEmailContent
      })
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.text();
      console.error('Failed to send customer email:', error);
      // Don't fail the whole request if customer email fails
    }

    console.log('Emails sent successfully');

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Emails sent successfully'
      })
    };

  } catch (error) {
    console.error('Error sending emails:', error);

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to send emails',
        details: error.message
      })
    };
  }
};
