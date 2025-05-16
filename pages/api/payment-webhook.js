const { Cashfree } = require('cashfree-pg-node-sdk');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cashfree = new Cashfree({
      env: 'PRODUCTION',
      clientId: process.env.CASHFREE_APP_ID,
      clientSecret: process.env.CASHFREE_SECRET_KEY
    });

    const { orderId, orderStatus } = req.body;

    if (orderStatus === 'PAID') {
      console.log(`Payment successful for order ${orderId}`);
      // Handle payment logic here (e.g., update DB, send email, etc.)
    }

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
