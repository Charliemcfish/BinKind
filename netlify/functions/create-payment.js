/**
 * BinKind - Create Payment Function
 *
 * This Netlify Function initiates a GoCardless payment flow.
 * It handles both one-time payments and recurring Direct Debit subscriptions.
 *
 * GoCardless Flow:
 * 1. Create a redirect flow to collect customer bank details
 * 2. Customer is redirected to GoCardless to authorize payment/mandate
 * 3. GoCardless redirects back to our callback URL
 * 4. We complete the flow and create the payment/subscription
 */

const gocardless = require('gocardless-nodejs');

// CORS headers for API responses
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse booking data from request
    const bookingData = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = [
      'customerName',
      'email',
      'streetAddress',
      'townCity',
      'postcode',
      'mobilePhone',
      'frequency',
      'councilArea',
      'totalPrice',
      'selectedDate'
    ];

    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required field',
            field: field
          })
        };
      }
    }

    // Validate at least one bin selected
    if (!bookingData.bins || bookingData.totalBins === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'No bins selected'
        })
      };
    }

    // Initialize GoCardless client
    const environment = process.env.GOCARDLESS_ENVIRONMENT === 'Live'
      ? gocardless.constants.Environments.Live
      : gocardless.constants.Environments.Sandbox;

    const client = gocardless(
      process.env.GOCARDLESS_ACCESS_TOKEN,
      environment
    );

    // Generate unique session token for this booking
    const sessionToken = `binkind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store booking data temporarily (in production, use a database)
    // For now, we'll pass it through the redirect flow
    const bookingReference = `BK-${Date.now().toString().slice(-8)}`;

    // Store booking data with session token
    // In production, store this in a database or secure session store
    // For now, we'll encode it in the callback URL (not ideal for production)
    const encodedBooking = Buffer.from(JSON.stringify({
      ...bookingData,
      bookingReference
    })).toString('base64');

    // Determine success and failure redirect URLs
    const siteUrl = process.env.SITE_URL || 'http://localhost:8888';
    const successRedirectUrl = `${siteUrl}/api/payment-callback?session_token=${sessionToken}&booking_data=${encodedBooking}`;
    const failureRedirectUrl = `${siteUrl}/booking-failed.html`;

    // Create redirect flow for customer to authorize payment
    const redirectFlow = await client.redirectFlows.create({
      description: `BinKind Bin Cleaning Service - ${bookingData.frequency === 'every4weeks' ? 'Recurring' : 'One-time'}`,
      session_token: sessionToken,
      success_redirect_url: successRedirectUrl,
      prefilled_customer: {
        given_name: bookingData.customerName.split(' ')[0],
        family_name: bookingData.customerName.split(' ').slice(1).join(' ') || bookingData.customerName.split(' ')[0],
        email: bookingData.email,
        address_line1: bookingData.streetAddress,
        city: bookingData.townCity,
        postal_code: bookingData.postcode,
        country_code: 'GB'
      }
    });

    // Get the redirect URL from GoCardless
    const redirectUrl = redirectFlow.redirect_url;

    // Return the redirect URL and booking reference to the frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        redirectUrl: redirectUrl,
        bookingReference: bookingReference,
        sessionToken: sessionToken
      })
    };

  } catch (error) {
    console.error('Error creating payment:', error);

    // Handle specific GoCardless errors
    let errorMessage = 'Failed to create payment';
    let statusCode = 500;

    if (error.response) {
      // GoCardless API error
      errorMessage = error.response.body?.error?.message || errorMessage;
      statusCode = error.response.statusCode || 500;
    }

    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.GOCARDLESS_ENVIRONMENT === 'Sandbox' ? error.message : undefined
      })
    };
  }
};
