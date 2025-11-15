// ============================================
// BinKind - GoCardless Webhook Handler
// ============================================
// This function receives webhook notifications from GoCardless
// about payment status updates

const crypto = require('crypto');

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
    // Verify webhook signature (important for security!)
    const signature = event.headers['webhook-signature'];
    const webhookSecret = process.env.GOCARDLESS_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(event.body)
        .digest('hex');

      if (signature !== computedSignature) {
        console.error('Invalid webhook signature');
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }
    }

    // Parse webhook payload
    const payload = JSON.parse(event.body);

    // Process each event
    if (payload.events && Array.isArray(payload.events)) {
      for (const webhookEvent of payload.events) {
        await processWebhookEvent(webhookEvent);
      }
    }

    // Return success response to GoCardless
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);

    // Still return 200 to prevent retries for parse errors
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Process individual webhook events
async function processWebhookEvent(event) {
  console.log('Processing webhook event:', event.resource_type, event.action);

  switch (event.resource_type) {
    case 'payments':
      await handlePaymentEvent(event);
      break;

    case 'subscriptions':
      await handleSubscriptionEvent(event);
      break;

    case 'mandates':
      await handleMandateEvent(event);
      break;

    default:
      console.log('Unhandled event type:', event.resource_type);
  }
}

// Handle payment events
async function handlePaymentEvent(event) {
  const paymentId = event.links.payment;

  switch (event.action) {
    case 'created':
      console.log('Payment created:', paymentId);
      break;

    case 'submitted':
      console.log('Payment submitted:', paymentId);
      break;

    case 'confirmed':
      console.log('Payment confirmed:', paymentId);
      // You might want to update your database or send notification
      break;

    case 'paid_out':
      console.log('Payment paid out:', paymentId);
      break;

    case 'failed':
      console.log('Payment failed:', paymentId);
      // Send notification to client about failed payment
      await notifyPaymentFailure(paymentId, event.details);
      break;

    case 'cancelled':
      console.log('Payment cancelled:', paymentId);
      break;

    default:
      console.log('Unhandled payment action:', event.action);
  }
}

// Handle subscription events
async function handleSubscriptionEvent(event) {
  const subscriptionId = event.links.subscription;

  switch (event.action) {
    case 'created':
      console.log('Subscription created:', subscriptionId);
      break;

    case 'payment_created':
      console.log('Subscription payment created:', subscriptionId);
      break;

    case 'cancelled':
      console.log('Subscription cancelled:', subscriptionId);
      // Notify client that customer cancelled their recurring service
      await notifySubscriptionCancelled(subscriptionId);
      break;

    case 'finished':
      console.log('Subscription finished:', subscriptionId);
      break;

    default:
      console.log('Unhandled subscription action:', event.action);
  }
}

// Handle mandate events
async function handleMandateEvent(event) {
  const mandateId = event.links.mandate;

  switch (event.action) {
    case 'created':
      console.log('Mandate created:', mandateId);
      break;

    case 'active':
      console.log('Mandate activated:', mandateId);
      break;

    case 'cancelled':
      console.log('Mandate cancelled:', mandateId);
      break;

    case 'failed':
      console.log('Mandate failed:', mandateId);
      await notifyMandateFailure(mandateId, event.details);
      break;

    default:
      console.log('Unhandled mandate action:', event.action);
  }
}

// Notification helpers
async function notifyPaymentFailure(paymentId, details) {
  // In production, send email to client about failed payment
  console.log('Payment failure notification:', paymentId, details);
  // You could call send-emails function here
}

async function notifySubscriptionCancelled(subscriptionId) {
  // In production, send email to client about cancelled subscription
  console.log('Subscription cancellation notification:', subscriptionId);
  // You could call send-emails function here
}

async function notifyMandateFailure(mandateId, details) {
  // In production, send email to client about failed mandate
  console.log('Mandate failure notification:', mandateId, details);
  // You could call send-emails function here
}
