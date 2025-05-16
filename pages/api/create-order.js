const { Cashfree } = require('@cashfreepayments/cashfree-sdk');

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = "PRODUCTION";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, productName, amount, customerName, customerEmail, customerPhone } = req.body;
    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      order_note: productName,
      customer_details: {
        customer_id: customerEmail,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `https://${req.headers.host}/payment-success?product_id=${productId}&order_id=${orderId}`,
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    if (response.data?.payment_link) {
      return res.status(200).json({
        paymentLink: response.data.payment_link,
        orderId: orderId
      });
    }
    throw new Error('Failed to create payment link');
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment link',
      details: error.message 
    });
  }
}
