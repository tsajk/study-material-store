import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const isProduction = process.env.CASHFREE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://api.cashfree.com/pg' 
    : 'https://test.cashfree.com/api/v2/pg';

  const {
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    customerPhone
  } = req.body;

  const orderId = `ORDER_${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  const returnUrl = `${siteUrl}/payment-success?order_id=${orderId}&product_id=${productId}`;

  try {
    const response = await axios.post(
      `${baseUrl}/orders`, // Correct endpoint
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerEmail.replace(/[^a-zA-Z0-9_-]/g, '_'),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: `+91${customerPhone}`.replace(/[+]/g, '') // Ensure proper format
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: `${siteUrl}/api/payment-webhook`
        }
      },
      {
        headers: {
          'x-api-version': '2022-09-01', // Confirm this matches Cashfree's docs
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY
        }
      }
    );

    if (response.data.payment_session_id) {
      const paymentLink = isProduction
        ? `https://payments.cashfree.com/order/#${response.data.payment_session_id}`
        : `https://test.cashfree.com/pg/order/#${response.data.payment_session_id}`;

      res.status(200).json({ paymentLink });
    } else {
      throw new Error("No payment_session_id received");
    }
  } catch (error) {
    console.error("Cashfree API Error:", {
      error: error.response?.data || error.message,
      endpointUsed: `${baseUrl}/orders`
    });

    res.status(500).json({
      error: "Payment failed",
      details: error.response?.data || error.message
    });
  }
}
