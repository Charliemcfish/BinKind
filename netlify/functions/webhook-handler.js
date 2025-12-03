/**
 * BinKind - GoCardless Webhook Handler (OPTIONAL)
 *
 * This Netlify Function receives webhook notifications from GoCardless
 * about payment status changes. This is useful for:
 * - Tracking payment confirmations
 * - Handling failed payments
 * - Monitoring subscription cancellations
 *
 * To use this:
 * 1. Set up webhook endpoint in GoCardless dashboard
 * 2. Add webhook secret to environment variables
 * 3. Point webhook URL to: https://yoursite.netlify.app/api/webhook-handler
 *
 * NOTE: This is optional for Phase 2 - you can add it later for production
 */

const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Verify webhook signature (security measure)
    const signature = event.headers['webhook-signature'];
    const webhookSecret = process.env.GOCARDLESS_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(event.body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return {
          statusCode: 498,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }
    }

    // Parse webhook payload
    const payload = JSON.parse(event.body);
    const events = payload.events || [];

    // Process each event
    for (const webhookEvent of events) {
      const { resource_type, action, links } = webhookEvent;

      console.log(`Webhook received: ${resource_type}.${action}`);

      // Handle different event types
      switch (resource_type) {
        case 'payments':
          await handlePaymentEvent(action, links, webhookEvent);
          break;

        case 'subscriptions':
          await handleSubscriptionEvent(action, links, webhookEvent);
          break;

        case 'mandates':
          await handleMandateEvent(action, links, webhookEvent);
          break;

        default:
          console.log(`Unhandled resource type: ${resource_type}`);
      }
    }

    // Always return 200 to acknowledge receipt
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook error:', error);

    // Still return 200 to prevent GoCardless from retrying
    return {
      statusCode: 200,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Handle payment-related events
 */
async function handlePaymentEvent(action, links, event) {
  switch (action) {
    case 'confirmed':
      console.log('✅ Payment confirmed:', links.payment);
      // TODO: Update database, send confirmation email
      break;

    case 'failed':
      console.log('❌ Payment failed:', links.payment);
      // TODO: Notify customer, update booking status
      break;

    case 'cancelled':
      console.log('⚠️ Payment cancelled:', links.payment);
      // TODO: Handle cancellation
      break;

    default:
      console.log(`Payment event: ${action}`, links.payment);
  }
}

/**
 * Handle subscription-related events
 */
async function handleSubscriptionEvent(action, links, event) {
  switch (action) {
    case 'created':
      console.log('🔄 Subscription created:', links.subscription);
      // TODO: Track subscription start
      break;

    case 'cancelled':
      console.log('🛑 Subscription cancelled:', links.subscription);
      // TODO: Notify customer, update records
      break;

    case 'payment_created':
      console.log('💰 Subscription payment created:', links.subscription);
      // TODO: Log recurring payment
      break;

    default:
      console.log(`Subscription event: ${action}`, links.subscription);
  }
}

/**
 * Handle mandate (Direct Debit authorization) events
 */
async function handleMandateEvent(action, links, event) {
  switch (action) {
    case 'created':
      console.log('📝 Mandate created:', links.mandate);
      break;

    case 'submitted':
      console.log('📤 Mandate submitted to bank:', links.mandate);
      break;

    case 'active':
      console.log('✅ Mandate active:', links.mandate);
      // TODO: Confirm customer's Direct Debit is set up
      break;

    case 'cancelled':
      console.log('❌ Mandate cancelled:', links.mandate);
      // TODO: Handle customer cancelling Direct Debit
      break;

    case 'failed':
      console.log('⚠️ Mandate failed:', links.mandate);
      // TODO: Notify customer of issue
      break;

    default:
      console.log(`Mandate event: ${action}`, links.mandate);
  }
}
