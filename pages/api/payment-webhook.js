const { Cashfree } = require('@cashfreepayments/cashfree-sdk');

// Initialize Cashfree once
Cashfree.XClientId = process.env.CASHFREE_APP_ID || "605266b66d4c81295df88e013e662506";
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_3d5c1e52a60832d47f1eb1af9045d1c2_4b948447";
Cashfree.XEnvironment = "PRODUCTION";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
