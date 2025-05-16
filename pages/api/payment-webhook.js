const cashfree = require("@cashfree/pg");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    cashfree.XClientId = process.env.CASHFREE_APP_ID;
    cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    cashfree.XEnvironment = cashfree.Environment.PRODUCTION;

    const { orderId, orderStatus } = req.body;
    if (orderStatus === 'PAID') {
      console.log(`Payment successful for order ${orderId}`);
    }
    return res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
