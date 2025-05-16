const { Cashfree } = require('@cashfreepayments/cashfree-pg');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderId, amount, customerPhone, customerEmail } = req.body;

  try {
    const cashfree = new Cashfree({
      env: 'PROD', // or 'TEST' for sandbox
      clientId: process.env.CF_CLIENT_ID,
      clientSecret: process.env.CF_CLIENT_SECRET,
    });

    const order = await cashfree.orders.create({
      orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
      customerDetails: {
        customerPhone,
        customerEmail,
      },
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Payment order creation failed' });
  }
}
