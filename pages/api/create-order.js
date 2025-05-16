const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    customerPhone
  } = req.body;

  if (!productId || !productName || !amount || !customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const env = process.env.CASHFREE_ENV || 'production';

  const apiUrl = env === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg/orders'
    : 'https://api.cashfree.com/pg/orders';

  const checkoutUrl = env === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg/view/'
    : 'https://www.cashfree.com/pg/view/';

  try {
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const currency = 'INR';
    const customerId = customerEmail.replace(/[@.]/g, '_');

    const requestData = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: currency,
      order_note: productName,
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${baseUrl.replace(/\/$/, '')}/payment-success?order_id=${orderId}&product_id=${productId}`
      }
    };

    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2022-09-01'
      }
    });

    const sessionId = response.data.payment_session_id;

    if (sessionId) {
      return res.status(200).json({
        orderId,
        paymentLink: `${checkoutUrl}${sessionId}`
      });
    } else {
      return res.status(500).json({ message: 'Payment session not generated' });
    }
  } catch (error) {
    console.error('Cashfree error:', error.response?.data || error.message);
    return res.status(500).json({
      message: error.response?.data?.message || 'Payment initiation failed'
    });
  }
}
