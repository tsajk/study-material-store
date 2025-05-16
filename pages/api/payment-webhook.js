const { Cashfree } = require('cashfree-pg');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Cashfree
    Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = "PRODUCTION";

    const { orderId, orderStatus } = req.body;

    if (orderStatus === 'PAID') {
      console.log(`Payment successful for order ${orderId}`);
      // Handle successful payment
    }

    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
