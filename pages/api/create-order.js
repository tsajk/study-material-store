import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const {
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    customerPhone
  } = req.body;

  const orderId = `ORDER_${Date.now()}`;
  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id=${orderId}&product_id=${productId}`;

  try {
    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
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
          return_url: returnUrl
        },
        order_note: `Purchase of ${productName} (${productId})`
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

    console.log('Cashfree Order Response:', response.data);

    // Construct the payment link from the payment_session_id
    if (response.data.payment_session_id) {
      const paymentLink = `https://payments.cashfree.com/order/#${response.data.payment_session_id}`;
      res.status(200).json({ 
        paymentLink,
        orderId: response.data.order_id,
        cfOrderId: response.data.cf_order_id
      });
    } else {
      res.status(500).json({ 
        message: response.data.message || 'Payment session not created',
        details: response.data
      });
    }
  } catch (error) {
    console.error('Create Order Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: error.response?.data?.message || 'Payment initiation failed',
      details: error.response?.data
    });
  }
}
