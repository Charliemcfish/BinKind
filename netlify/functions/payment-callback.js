/**
 * BinKind - Payment Callback Function
 *
 * This Netlify Function handles the redirect back from GoCardless after
 * the customer has authorized their bank account.
 *
 * Flow:
 * 1. Complete the redirect flow to get customer and mandate IDs
 * 2. Create the payment (one-time) or subscription (recurring)
 * 3. Send confirmation emails
 * 4. Redirect to success page with booking details
 */

const gocardless = require('gocardless-nodejs');
const constants = require('gocardless-nodejs/constants');
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // Get query parameters
    const params = event.queryStringParameters || {};
    const redirectFlowId = params.redirect_flow_id;

    if (!redirectFlowId) {
      return {
        statusCode: 400,
        body: 'Missing redirect_flow_id parameter'
      };
    }

    // Initialize GoCardless client
    const environment = process.env.GOCARDLESS_ENVIRONMENT === 'Live'
      ? constants.Environments.Live
      : constants.Environments.Sandbox;

    const client = gocardless(
      process.env.GOCARDLESS_ACCESS_TOKEN,
      environment
    );

    // Complete the redirect flow
    const completedFlow = await client.redirectFlows.complete(
      redirectFlowId,
      {
        session_token: params.session_token
      }
    );

    // Extract customer and mandate details
    const customerId = completedFlow.links.customer;
    const mandateId = completedFlow.links.mandate;

    // Get booking data from query params
    // In production, retrieve this from a database using session_token
    const bookingDataEncoded = params.booking_data;
    let bookingData;

    if (bookingDataEncoded) {
      bookingData = JSON.parse(Buffer.from(bookingDataEncoded, 'base64').toString('utf-8'));
    } else {
      // Fallback: minimal data for testing
      return {
        statusCode: 400,
        body: 'Missing booking data'
      };
    }

    // Calculate amount in pence (GoCardless requires integer pence)
    const amountInPence = Math.round(bookingData.totalPrice * 100);

    let paymentId = null;
    let subscriptionId = null;

    // Create payment or subscription based on frequency
    if (bookingData.frequency === 'every4weeks') {
      // Create recurring subscription (every 4 weeks)
      const subscription = await client.subscriptions.create({
        amount: amountInPence,
        currency: 'GBP',
        name: 'BinKind Bin Cleaning - Every 4 Weeks',
        interval_unit: 'weekly',
        interval: 4,
        links: {
          mandate: mandateId
        },
        metadata: {
          booking_ref: bookingData.bookingReference,
          customer: bookingData.customerName,
          date: bookingData.selectedDate
        }
      });

      subscriptionId = subscription.id;

    } else {
      // Create one-time payment
      const payment = await client.payments.create({
        amount: amountInPence,
        currency: 'GBP',
        description: `BinKind Bin Cleaning - ${bookingData.bookingReference}`,
        links: {
          mandate: mandateId
        },
        metadata: {
          booking_ref: bookingData.bookingReference,
          customer: bookingData.customerName,
          date: bookingData.selectedDate
        }
      });

      paymentId = payment.id;
    }

    // Send confirmation emails
    try {
      const emailResponse = await fetch(`${process.env.SITE_URL || 'http://localhost:8888'}/api/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingData: bookingData,
          paymentId: paymentId,
          subscriptionId: subscriptionId
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send emails:', await emailResponse.text());
        // Continue anyway - payment is successful
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Continue anyway - payment is successful
    }

    // Prepare success page URL with booking details
    const successUrl = new URL('/booking-success.html', process.env.SITE_URL || 'http://localhost:8888');
    successUrl.searchParams.append('ref', bookingData.bookingReference);
    successUrl.searchParams.append('name', bookingData.customerName);
    successUrl.searchParams.append('email', bookingData.email);
    successUrl.searchParams.append('date', bookingData.selectedDate);
    successUrl.searchParams.append('bins', bookingData.totalBins);
    successUrl.searchParams.append('total', bookingData.totalPrice);
    successUrl.searchParams.append('frequency', bookingData.frequency);
    successUrl.searchParams.append('payment_type', bookingData.frequency === 'every4weeks' ? 'subscription' : 'one-time');

    // Redirect to success page
    return {
      statusCode: 302,
      headers: {
        'Location': successUrl.toString()
      },
      body: ''
    };

  } catch (error) {
    console.error('Error in payment callback:', error);

    // Redirect to failure page
    const failureUrl = new URL('/booking-failed.html', process.env.SITE_URL || 'http://localhost:8888');
    failureUrl.searchParams.append('error', error.message || 'Payment processing failed');

    return {
      statusCode: 302,
      headers: {
        'Location': failureUrl.toString()
      },
      body: ''
    };
  }
};
