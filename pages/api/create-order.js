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
  // Fix the double slash issue by ensuring BASE_URL doesn't end with slash
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  const returnUrl = `${baseUrl}/payment-success?order_id=${orderId}&product_id=${productId}`;

  try {
    const orderPayload = {
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
        notify_url: `${baseUrl}/api/payment-webhook` // Add webhook if needed
      },
      order_note: `Purchase of ${productName} (${productId})`,
      // Add these required parameters
      order_tags: {
        product_id: productId
      }
    };

    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
      orderPayload,
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

    if (response.data.payment_session_id) {
      // Use the standard payment link format
      const paymentLink = `https://payments.cashfree.com/order/#${response.data.payment_session_id}`;
      
      // Alternative: Use the payments.url from response if available
      // const paymentLink = response.data.payments?.url;
      
      res.status(200).json({ 
        paymentLink,
        orderId: response.data.order_id,
        cfOrderId: response.data.cf_order_id,
        sessionId: response.data.payment_session_id
      });
    } else {
      res.status(500).json({ 
        message: 'Payment session creation failed',
        details: response.data
      });
    }
  } catch (error) {
    console.error('Create Order Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Payment initiation failed',
      error: error.response?.data || error.message
    });
  }
}
