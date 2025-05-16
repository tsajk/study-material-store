import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // Determine environment
  const isProduction = process.env.CASHFREE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://api.cashfree.com' 
    : 'https://test.cashfree.com/api';

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
      `${baseUrl}/pg/orders`,
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerEmail.replace(/[^a-zA-Z0-9_-]/g, '_'),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: `${siteUrl}/api/payment-webhook`
        },
        order_note: `Purchase of ${productName}`,
        order_tags: { product_id: productId }
      },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY
        }
      }
    );

    if (response.data.payment_session_id) {
      // Construct proper payment URL based on environment
      const paymentUrl = isProduction
        ? `https://payments.cashfree.com/order/#${response.data.payment_session_id}`
        : `https://test.cashfree.com/pg/order/#${response.data.payment_session_id}`;
      
      res.status(200).json({
        paymentLink: paymentUrl,
        orderId: response.data.order_id,
        sessionId: response.data.payment_session_id
      });
    } else {
      throw new Error('No payment session ID received');
    }
  } catch (error) {
    console.error('Cashfree Error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Payment initiation failed',
      details: error.response?.data || error.message
    });
  }
}
