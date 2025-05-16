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

  // Validate inputs
  if (!productId || !productName || !amount || !customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate environment variables
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!appId || !secretKey || !baseUrl) {
    return res.status(500).json({ message: 'Missing required environment variables' });
  }

  try {
    // Unique order ID generation
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const currency = 'INR';

    // Prepare request payload
    const requestData = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: currency,
      order_note: productName,
      customer_details: {
        customer_id: customerEmail.replace(/[@.]/g, '_'),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${baseUrl}/payment-success?order_id=${orderId}&product_id=${productId}`
      }
    };

    // Call Cashfree API to create order
    const response = await axios.post('https://api.cashfree.com/pg/orders', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2022-09-01'
      }
    });

    // Check and return the correct payment link (hosted payment page)
    if (response.data && response.data.payment_session_id) {
      const paymentLink = `https://www.cashfree.com/checkout/post/pg?session_id=${response.data.payment_session_id}`;
      return res.status(200).json({
        orderId,
        paymentLink
      });
    } else {
      console.error('Unexpected Cashfree response:', response.data);
      return res.status(500).json({ message: 'Failed to create payment link' });
    }
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    return res.status(500).json({
      message: error.response?.data?.message || 'Payment initiation failed'
    });
  }
}
