const crypto = require('crypto');

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // Preflight request support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Optional: CORS headers (not always needed for webhooks)
    res.setHeader('Access-Control-Allow-Origin', '*');

    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const signature = req.headers['x-webhook-signature'];
    const bodyString = JSON.stringify(req.body);
    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(bodyString)
      .digest('base64');

    if (signature !== generatedSignature) {
      console.error('Invalid signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const {
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime
    } = req.body;

    console.log(`Payment notification for order ${orderId}:`, {
      status: txStatus,
      amount: orderAmount,
      referenceId,
      paymentMode,
      message: txMsg,
      time: txTime
    });

    // TODO: Save to DB, send confirmation email, etc.

    return res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
