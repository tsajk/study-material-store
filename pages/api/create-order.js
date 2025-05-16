const crypto = require('crypto');
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

  // Validate input
  if (!productId || !productName || !amount || !customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate required env vars
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const appId = process.env.CASHFREE_APP_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!secretKey || !appId || !baseUrl) {
    return res.status(500).json({ message: 'Missing required environment variables' });
  }

  try {
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const currency = 'INR';

    // Clean customer_id
    const cleanCustomerId = customerEmail.replace(/[@.]/g, '_');

    // Prepare request data for Cashfree
    const requestData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      order_note: productName,
      customer_details: {
        customer_id: cleanCustomerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${baseUrl}/payment-success?order_id=${orderId}&product_id=${productId}`
      }
    };

    // Generate signature
    const message = `${requestData.order_id}|${requestData.order_amount}|${requestData.order_currency}`;
    const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex');

    // Make API call to Cashfree
    const response = await axios.post('https://api.cashfree.com/pg/orders', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2022-09-01'
      }
    });

    if (response.data && response.data.payment_link) {
      return res.status(200).json({
        orderId: orderId,
        paymentLink: response.data.payment_link
      });
    } else {
      return res.status(500).json({ message: 'Failed to create payment link' });
    }
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    return res.status(500).json({
      message: error.response?.data?.message || 'Payment initiation failed'
    });
  }
}
