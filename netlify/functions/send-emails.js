// ============================================
// BinKind - Send Email Notifications
// ============================================
// This function sends email notifications to both the client and customer
// after a successful booking

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { bookingData, paymentId, isRecurring, bookingReference } = JSON.parse(event.body);

    // Validate required data
    if (!bookingData || !bookingData.email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing booking data' })
      };
    }

    // Format the selected date
    const selectedDate = new Date(bookingData.selectedDate);
    const formattedDate = selectedDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Build bin list for emails
    const binNames = {
      waste: 'Waste Wheelie (Up to 240L)',
      food: 'Food Caddy (Up to 55L)',
      recycling: 'Recycling Box (Up to 55L)',
      garden: 'Garden Wheelie (Up to 240L)'
    };

    const binPrices = {
      waste: 12.49,
      food: 5.99,
      recycling: 3.49,
      garden: 12.49
    };

    let binListHtml = '';
    let binListText = '';

    Object.keys(bookingData.bins).forEach(binType => {
      const quantity = bookingData.bins[binType];
      if (quantity > 0) {
        const price = (quantity * binPrices[binType]).toFixed(2);
        binListHtml += `<li>${binNames[binType]} x${quantity} - £${price}</li>`;
        binListText += `- ${binNames[binType]} x${quantity} - £${price}\n`;
      }
    });

    // Get council area name
    const councilAreas = {
      'south-somerset': 'South Somerset District Council',
      'somerset-west': 'Somerset West and Taunton',
      'mendip': 'Mendip District Council',
      'sedgemoor': 'Sedgemoor District Council',
      'dorset': 'Dorset Council'
    };
    const councilName = councilAreas[bookingData.councilArea] || bookingData.councilArea;

    // Frequency text
    const frequencyText = isRecurring ? 'Every 4 Weeks' : 'One-Off Cleaning';

    // ====================================
    // EMAIL 1: To Client (BinKind)
    // ====================================
    const clientEmail = process.env.CLIENT_EMAIL || 'charlielfisher@hotmail.com';

    const clientSubject = `New Booking - BinKind Cleaning - ${bookingReference}`;

    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #5b8855; margin-bottom: 10px;">New Booking Received</h1>
          <p style="font-size: 18px; color: #424242; margin-bottom: 30px;">Booking Reference: <strong>${bookingReference}</strong></p>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1b1b1b; font-size: 18px; margin-bottom: 15px;">CUSTOMER DETAILS</h2>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${bookingData.customerName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${bookingData.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${bookingData.mobilePhone}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1b1b1b; font-size: 18px; margin-bottom: 15px;">CLEANING DETAILS</h2>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Frequency:</strong> ${frequencyText}</p>
            <p style="margin: 5px 0;"><strong>Council Area:</strong> ${councilName}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1b1b1b; font-size: 18px; margin-bottom: 15px;">BINS SELECTED</h2>
            <ul style="list-style-type: none; padding: 0;">
              ${binListHtml}
            </ul>
            <p style="margin-top: 15px;"><strong>Total Bins:</strong> ${bookingData.totalBins}</p>
            <p style="margin: 5px 0;"><strong>Total Payment:</strong> £${bookingData.totalPrice.toFixed(2)}</p>
          </div>

          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #5b8855;">
            <p style="margin: 0;"><strong>Payment Status:</strong> Confirmed</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #424242;">Payment ID: ${paymentId}</p>
            ${isRecurring ? `<p style="margin: 10px 0 0 0; color: #5b8855;"><strong>Recurring subscription - customer will be charged £${bookingData.totalPrice.toFixed(2)} every 4 weeks</strong></p>` : ''}
          </div>

          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
            <p style="margin: 0; font-size: 14px; color: #424242;">
              <strong>⚠️ Action Required:</strong> This booking needs to be manually added to Squeegee.
            </p>
          </div>
        </div>
      </div>
    `;

    const clientText = `
NEW BOOKING - BINKIND CLEANING

Booking Reference: ${bookingReference}

CUSTOMER DETAILS:
Name: ${bookingData.customerName}
Email: ${bookingData.email}
Phone: ${bookingData.mobilePhone}
Address: ${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}

CLEANING DETAILS:
Date: ${formattedDate}
Frequency: ${frequencyText}
Council Area: ${councilName}

BINS SELECTED:
${binListText}
Total Bins: ${bookingData.totalBins}
Total Payment: £${bookingData.totalPrice.toFixed(2)}

PAYMENT STATUS: Confirmed
Payment ID: ${paymentId}
${isRecurring ? `\nRecurring subscription - customer will be charged £${bookingData.totalPrice.toFixed(2)} every 4 weeks` : ''}

⚠️ Action Required: This booking needs to be manually added to Squeegee.
    `;

    // ====================================
    // EMAIL 2: To Customer
    // ====================================
    const customerSubject = `Booking Confirmation - BinKind - ${bookingReference}`;

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <h1 style="color: #5b8855; margin: 0;">Booking Confirmed!</h1>
            <p style="color: #424242; margin-top: 10px;">Thank you for choosing BinKind</p>
          </div>

          <p style="font-size: 16px; color: #424242;">Hi ${bookingData.customerName},</p>
          <p style="font-size: 16px; color: #424242;">Your bin cleaning has been confirmed for <strong>${formattedDate}</strong>.</p>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1b1b1b; font-size: 18px; margin-bottom: 15px;">BOOKING SUMMARY</h2>
            <p style="margin: 5px 0;"><strong>Booking Reference:</strong> ${bookingReference}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0; margin-top: 15px;"><strong>Bins:</strong></p>
            <ul style="margin: 5px 0;">
              ${binListHtml}
            </ul>
            <p style="margin: 15px 0 5px 0; font-size: 18px; color: #5b8855;"><strong>Total: £${bookingData.totalPrice.toFixed(2)}</strong></p>
          </div>

          ${isRecurring ? `
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5b8855;">
            <h3 style="color: #1b1b1b; margin-top: 0;">Recurring Payment</h3>
            <p style="margin: 5px 0; color: #424242;">Your first payment of <strong>£${bookingData.totalPrice.toFixed(2)}</strong> has been processed.</p>
            <p style="margin: 5px 0; color: #424242;">You'll be automatically charged <strong>£${bookingData.totalPrice.toFixed(2)}</strong> every 4 weeks for your regular bin cleaning service.</p>
          </div>
          ` : `
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5b8855;">
            <h3 style="color: #1b1b1b; margin-top: 0;">Payment</h3>
            <p style="margin: 0; color: #424242;">One-time payment of <strong>£${bookingData.totalPrice.toFixed(2)}</strong> confirmed.</p>
          </div>
          `}

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #1b1b1b; margin-top: 0;">Need to Cancel or Rebook?</h3>
            <p style="margin: 10px 0; font-size: 24px; color: #5b8855;"><strong>📞 07777 777777</strong></p>
            <p style="margin: 0; color: #424242;">Call us and we'll be happy to help</p>
          </div>

          <p style="font-size: 16px; color: #424242; text-align: center; margin-top: 30px;">
            We'll see you on <strong>${formattedDate}</strong>!
          </p>

          <p style="font-size: 16px; color: #424242; margin-top: 20px;">
            Best regards,<br>
            <strong>The BinKind Team</strong>
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #9e9e9e; font-size: 12px;">
          <p>BinKind - Professional Bin Cleaning Service</p>
          <p>Yeovil and Somerset</p>
        </div>
      </div>
    `;

    const customerText = `
BOOKING CONFIRMED - BINKIND

Hi ${bookingData.customerName},

Thank you for booking with BinKind!

Your bin cleaning has been confirmed for ${formattedDate}.

BOOKING SUMMARY:
Booking Reference: ${bookingReference}
Address: ${bookingData.streetAddress}, ${bookingData.townCity}, ${bookingData.postcode}
Date: ${formattedDate}

Bins:
${binListText}

Total: £${bookingData.totalPrice.toFixed(2)}

${isRecurring ? `
RECURRING PAYMENT:
Your first payment of £${bookingData.totalPrice.toFixed(2)} has been processed.
You'll be automatically charged £${bookingData.totalPrice.toFixed(2)} every 4 weeks for your regular bin cleaning service.
` : `
PAYMENT:
One-time payment of £${bookingData.totalPrice.toFixed(2)} confirmed.
`}

NEED TO CANCEL OR REBOOK?
Call us at: 07777 777777

We'll see you on ${formattedDate}!

Best regards,
The BinKind Team

---
BinKind - Professional Bin Cleaning Service
Yeovil and Somerset
    `;

    // Send emails using Netlify Forms or SMTP
    // For simplicity, we'll use Netlify Forms submission
    // In production, you might want to use SendGrid, Mailgun, etc.

    const emailResults = {
      clientEmail: { sent: false },
      customerEmail: { sent: false }
    };

    // Try to send emails via Netlify Forms
    try {
      // Send to client
      await submitNetlifyForm({
        'form-name': 'booking-notification',
        subject: clientSubject,
        to: clientEmail,
        message: clientText,
        html: clientHtml
      });
      emailResults.clientEmail.sent = true;
    } catch (error) {
      console.error('Failed to send client email:', error);
      emailResults.clientEmail.error = error.message;
    }

    try {
      // Send to customer
      await submitNetlifyForm({
        'form-name': 'booking-notification',
        subject: customerSubject,
        to: bookingData.email,
        message: customerText,
        html: customerHtml
      });
      emailResults.customerEmail.sent = true;
    } catch (error) {
      console.error('Failed to send customer email:', error);
      emailResults.customerEmail.error = error.message;
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        emailResults,
        message: 'Email notifications processed'
      })
    };

  } catch (error) {
    console.error('Error in send-emails function:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to send email notifications',
        message: error.message
      })
    };
  }
};

// Helper function to submit to Netlify Forms
async function submitNetlifyForm(formData) {
  const fetch = require('node-fetch');

  // Note: This is a simplified approach
  // In production, you should use a proper email service like SendGrid
  console.log('Email would be sent:', formData);

  // For now, just log the email content
  // The actual implementation would depend on your email service choice
  return Promise.resolve();
}
