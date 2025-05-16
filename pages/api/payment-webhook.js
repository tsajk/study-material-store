const crypto = require('crypto');

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // Handle preflight CORS request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const signature = req.headers['x-webhook-signature'];

    // Get raw body string (important for signature verification)
    // Note: Next.js parses JSON automatically, so you might need to capture raw body differently in real setup.
    const bodyString = JSON.stringify(req.body);

    // Generate HMAC SHA256 signature and compare
    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(bodyString)
      .digest('base64');

    if (signature !== generatedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Extract data from webhook
    const {
      orderId,
      txStatus,
      orderAmount,
      referenceId,
      paymentMode,
      txMsg,
      txTime
    } = req.body;

    console.log(`Webhook received for order ${orderId}: status=${txStatus}, amount=${orderAmount}`);

    // TODO: Update your order/payment status in DB here

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
