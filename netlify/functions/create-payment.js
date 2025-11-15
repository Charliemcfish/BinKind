// ============================================
// BinKind - Create Payment Function
// ============================================
// This function initiates a GoCardless payment or Direct Debit mandate
// and returns a redirect URL for the user to complete payment

const gocardless = require('gocardless-nodejs');
const { constants } = gocardless;

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
    // Parse booking data from request
    const bookingData = JSON.parse(event.body);

    // Validate required fields
    const requiredFields = [
      'customerName', 'email', 'streetAddress', 'townCity', 'postcode',
      'mobilePhone', 'frequency', 'councilArea', 'selectedDate', 'totalPrice'
    ];

    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: 'Missing required field',
            field: field
          })
        };
      }
    }

    // Validate that at least one bin is selected
    const totalBins = Object.values(bookingData.bins || {}).reduce((sum, qty) => sum + qty, 0);
    if (totalBins === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'At least one bin must be selected' })
      };
    }

    // Initialize GoCardless client
    const client = gocardless(
      process.env.GOCARDLESS_ACCESS_TOKEN,
      constants.Environments[process.env.GOCARDLESS_ENVIRONMENT || 'Sandbox']
    );

    // Get site URL for redirects
    const siteUrl = process.env.SITE_URL || 'https://binkind.netlify.app';

    // Generate unique session token for this booking
    const sessionToken = generateSessionToken();

    // Determine payment type based on frequency
    const isRecurring = bookingData.frequency === 'every4weeks';

    // Create redirect flow
    const redirectFlowParams = {
      description: `BinKind Cleaning - ${bookingData.customerName}`,
      session_token: sessionToken,
      success_redirect_url: `${siteUrl}/.netlify/functions/payment-callback?session_token=${sessionToken}`,
      prefilled_customer: {
        given_name: bookingData.customerName.split(' ')[0] || bookingData.customerName,
        family_name: bookingData.customerName.split(' ').slice(1).join(' ') || '',
        email: bookingData.email,
        address_line1: bookingData.streetAddress,
        city: bookingData.townCity,
        postal_code: bookingData.postcode,
        country_code: 'GB'
      }
    };

    // Create the redirect flow
    const redirectFlow = await client.redirectFlows.create(redirectFlowParams);

    // Store booking data temporarily (using environment variables or database)
    // For now, we'll encode it in the session token
    // In production, you should use a database or Netlify's Identity/Functions storage
    const bookingDataEncoded = Buffer.from(JSON.stringify(bookingData)).toString('base64');

    // Return the redirect URL to the frontend
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        redirectUrl: redirectFlow.redirect_url,
        sessionToken: sessionToken,
        bookingData: bookingDataEncoded,
        isRecurring: isRecurring
      })
    };

  } catch (error) {
    console.error('Error creating payment:', error);

    // Return user-friendly error
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to initialize payment',
        message: error.message || 'Please try again or contact us at 07777 777777',
        details: process.env.GOCARDLESS_ENVIRONMENT === 'Sandbox' ? error.stack : undefined
      })
    };
  }
};

// Helper function to generate unique session token
function generateSessionToken() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `bk_${timestamp}_${random}`;
}
