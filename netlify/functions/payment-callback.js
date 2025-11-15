// ============================================
// BinKind - Payment Callback Function
// ============================================
// This function handles the redirect back from GoCardless
// after the user completes or cancels the payment

const gocardless = require('gocardless-nodejs');
const { constants } = gocardless;

exports.handler = async (event, context) => {
  // This handles GET requests from GoCardless redirect
  if (event.httpMethod !== 'GET') {
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
    // Get redirect flow ID from query parameters
    const params = event.queryStringParameters || {};
    const redirectFlowId = params.redirect_flow_id;
    const sessionToken = params.session_token;

    if (!redirectFlowId) {
      // User likely cancelled - redirect to failure page
      return {
        statusCode: 302,
        headers: {
          Location: '/booking-failed.html?reason=cancelled'
        },
        body: ''
      };
    }

    // Initialize GoCardless client
    const client = gocardless(
      process.env.GOCARDLESS_ACCESS_TOKEN,
      constants.Environments[process.env.GOCARDLESS_ENVIRONMENT || 'Sandbox']
    );

    // Complete the redirect flow
    const redirectFlow = await client.redirectFlows.complete(redirectFlowId, {
      session_token: sessionToken
    });

    // Get the mandate and customer IDs
    const mandateId = redirectFlow.links.mandate;
    const customerId = redirectFlow.links.customer;

    // Retrieve booking data (in production, fetch from database using sessionToken)
    // For now, we'll get it from the query params if available
    const bookingDataEncoded = params.booking_data;
    let bookingData = null;

    if (bookingDataEncoded) {
      try {
        bookingData = JSON.parse(Buffer.from(bookingDataEncoded, 'base64').toString());
      } catch (e) {
        console.error('Failed to decode booking data:', e);
      }
    }

    // Determine if this is a one-time or recurring payment
    const isRecurring = bookingData && bookingData.frequency === 'every4weeks';

    let paymentId = null;

    if (isRecurring) {
      // Create a subscription for recurring payments
      const subscription = await client.subscriptions.create({
        amount: Math.round(bookingData.totalPrice * 100), // Amount in pence
        currency: 'GBP',
        name: 'BinKind Bin Cleaning',
        interval_unit: 'weekly',
        interval: 4, // Every 4 weeks
        metadata: {
          booking_reference: generateBookingReference(),
          customer_name: bookingData.customerName,
          customer_email: bookingData.email,
          total_bins: bookingData.totalBins
        },
        links: {
          mandate: mandateId
        }
      });

      paymentId = subscription.id;
    } else {
      // Create a one-time payment
      const payment = await client.payments.create({
        amount: Math.round(bookingData.totalPrice * 100), // Amount in pence
        currency: 'GBP',
        description: 'BinKind One-Off Cleaning',
        metadata: {
          booking_reference: generateBookingReference(),
          customer_name: bookingData.customerName,
          customer_email: bookingData.email,
          total_bins: bookingData.totalBins
        },
        links: {
          mandate: mandateId
        }
      });

      paymentId = payment.id;
    }

    // Send email notifications
    if (bookingData) {
      try {
        await sendEmailNotifications(bookingData, paymentId, isRecurring);
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError);
        // Continue anyway - payment was successful
      }
    }

    // Encode booking data and payment info for success page
    const successData = {
      bookingReference: generateBookingReference(),
      customerName: bookingData?.customerName || 'Customer',
      email: bookingData?.email || '',
      totalBins: bookingData?.totalBins || 0,
      totalPrice: bookingData?.totalPrice || 0,
      frequency: bookingData?.frequency || 'oneoff',
      selectedDate: bookingData?.selectedDate || '',
      paymentId: paymentId,
      isRecurring: isRecurring
    };

    const successDataEncoded = Buffer.from(JSON.stringify(successData)).toString('base64');

    // Redirect to success page with booking details
    return {
      statusCode: 302,
      headers: {
        Location: `/booking-success.html?data=${successDataEncoded}`
      },
      body: ''
    };

  } catch (error) {
    console.error('Error processing payment callback:', error);

    // Redirect to failure page with error
    return {
      statusCode: 302,
      headers: {
        Location: `/booking-failed.html?reason=error&message=${encodeURIComponent(error.message || 'Unknown error')}`
      },
      body: ''
    };
  }
};

// Helper function to generate booking reference
function generateBookingReference() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp.toString().slice(-8)}-${random}`;
}

// Helper function to send email notifications
async function sendEmailNotifications(bookingData, paymentId, isRecurring) {
  const fetch = require('node-fetch');

  // Call the send-emails function
  const siteUrl = process.env.SITE_URL || 'https://binkind.netlify.app';

  try {
    const response = await fetch(`${siteUrl}/.netlify/functions/send-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingData,
        paymentId,
        isRecurring,
        bookingReference: generateBookingReference()
      })
    });

    if (!response.ok) {
      throw new Error(`Email sending failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}
