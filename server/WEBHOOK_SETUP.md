# Webhook Setup Guide

## Overview
This guide explains how to set up webhooks for payment processing with Razorpay in the UNextDoor AI Tutor application.

## Prerequisites
- Razorpay account with API keys
- Public webhook endpoint (use ngrok for local testing)
- Server running with webhook endpoint configured

## Razorpay Webhook Configuration

### 1. Access Razorpay Dashboard
- Go to https://dashboard.razorpay.com/
- Login to your account
- Navigate to Settings > Webhooks

### 2. Create New Webhook
- Click "Add New Webhook"
- Enter your webhook URL: `https://your-domain.com/api/webhooks/payment`
- For local testing: `https://your-ngrok-url.ngrok.io/api/webhooks/payment`

### 3. Select Events
Configure the following events for comprehensive payment tracking:

**Subscription Events:**
- `subscription.activated` - Subscription activated
- `subscription.charged` - Subscription charged successfully
- `subscription.completed` - Subscription completed
- `subscription.cancelled` - Subscription cancelled
- `subscription.halted` - Subscription halted due to failure
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed

**Payment Events:**
- `payment.captured` - Payment captured successfully
- `payment.failed` - Payment failed
- `payment.authorized` - Payment authorized

**Invoice Events:**
- `invoice.paid` - Invoice paid
- `invoice.partially_paid` - Invoice partially paid
- `invoice.expired` - Invoice expired

### 4. Webhook Secret
- Copy the webhook secret provided by Razorpay
- Add it to your environment variables as `RAZORPAY_WEBHOOK_SECRET`

### 5. Active Status
- Ensure the webhook is set to "Active" status

## Environment Configuration

Add the following to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Webhook Configuration
WEBHOOK_BASE_URL=https://your-domain.com
```

## Local Development with ngrok

### 1. Install ngrok
```bash
# Install ngrok
npm install -g ngrok
# or download from https://ngrok.com/
```

### 2. Start ngrok tunnel
```bash
# Start your server first
npm start

# In another terminal, start ngrok
ngrok http 3000
```

### 3. Update webhook URL
- Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
- Update your Razorpay webhook URL to: `https://abc123.ngrok.io/api/webhooks/payment`

## Webhook Security

### 1. Signature Verification
The webhook endpoint automatically verifies Razorpay signatures:

```javascript
// server/src/controllers/paymentWebhookController.js
const crypto = require('crypto');

const verifyWebhookSignature = (body, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex');
  
  return expectedSignature === signature;
};
```

### 2. IP Whitelisting (Optional)
Consider whitelisting Razorpay's IP addresses:
- 52.66.127.113
- 13.232.120.83
- 65.0.113.162

## Testing Webhooks

### 1. Test Events
Use Razorpay's webhook test feature to send test events to your endpoint.

### 2. Check Logs
Monitor your server logs for webhook processing:
```bash
# Check logs for webhook events
tail -f logs/app.log | grep webhook
```

### 3. Database Verification
Verify that webhook events are properly processed by checking:
- `PaymentTransaction` records
- `Subscription` status updates
- User subscription status

## Webhook Event Handling

### Subscription Events
```javascript
// Example webhook payload for subscription.charged
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa5rKxy",
  "event": "subscription.charged",
  "payload": {
    "subscription": {
      "entity": {
        "id": "sub_00000000000001",
        "status": "active",
        "current_start": 1580453311,
        "current_end": 1583131711,
        "charge_at": 1583131711
      }
    }
  }
}
```

### Payment Events
```javascript
// Example webhook payload for payment.captured
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa5rKxy",
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_29QQoUBi66xm2f",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_9A33XWu170gUtm"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook is active in Razorpay dashboard
   - Check firewall settings

2. **Signature verification failing**
   - Ensure webhook secret is correct
   - Check body parsing middleware configuration
   - Verify raw body is used for signature verification

3. **Events being processed multiple times**
   - Implement idempotency keys
   - Check webhook endpoint returns 200 status
   - Verify event deduplication logic

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

### Webhook Testing Tools
- **ngrok**: For local development tunneling
- **Postman**: For manual webhook testing
- **Razorpay Test Mode**: For safe testing

## Production Deployment

### 1. SSL Certificate
Ensure your production server has a valid SSL certificate.

### 2. Load Balancer Configuration
If using a load balancer, ensure webhook requests are routed correctly.

### 3. Database Backups
Set up regular database backups before processing payments.

### 4. Monitoring
Set up monitoring for:
- Webhook endpoint availability
- Payment processing errors
- Subscription status changes

## Support
For webhook-related issues:
1. Check Razorpay documentation: https://razorpay.com/docs/webhooks/
2. Contact Razorpay support
3. Review server logs for detailed error information

## Security Best Practices
1. Always verify webhook signatures
2. Use HTTPS for webhook endpoints
3. Implement rate limiting
4. Log all webhook events for audit trail
5. Use idempotency to prevent duplicate processing
6. Validate all incoming data
7. Keep webhook secrets secure and rotate regularly