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

  // Validate required fields
  if (!productId || !productName || !amount || !customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Read environment variables
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const env = process.env.CASHFREE_ENV || 'production'; // 'sandbox' or 'production'

  if (!appId || !secretKey || !baseUrl) {
    return res.status(500).json({ message: 'Missing required environment variables' });
  }

  try {
    // Generate unique order id
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const currency = 'INR';

    // Prepare customer id (cleaned email)
    const customerId = customerEmail.replace(/[@.]/g, '_');

    // Clean baseUrl to avoid double slashes in return_url
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

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
        return_url: `${cleanBaseUrl}/payment-success?order_id=${orderId}&product_id=${productId}`
      }
    };

    // Cashfree API URL based on environment
    const apiUrl = env === 'sandbox' 
      ? 'https://sandbox.cashfree.com/pg/orders' 
      : 'https://api.cashfree.com/pg/orders';

    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2022-09-01'
      }
    });

    if (response.data && response.data.payment_session_id) {
      const paymentBaseUrl = env === 'sandbox'
        ? 'https://sandbox.cashfree.com/checkout/post/pg?session_id='
        : 'https://www.cashfree.com/checkout/post/pg?session_id=';

      const paymentLink = paymentBaseUrl + response.data.payment_session_id;

      return res.status(200).json({
        orderId,
        paymentLink
      });
    } else {
      console.error('Unexpected response from Cashfree:', response.data);
      return res.status(500).json({ message: 'Failed to create payment link' });
    }
  } catch (error) {
    console.error('Error creating Cashfree order:', error.response?.data || error.message);
    return res.status(500).json({
      message: error.response?.data?.message || 'Payment initiation failed'
    });
  }
}
