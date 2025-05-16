import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    customerPhone
  } = req.body;

  const orderId = `ORDER_${Date.now()}`;
  const customerId = customerEmail.replace(/[^a-zA-Z0-9_-]/g, '_'); // safe customer_id

  const payload = {
    order_id: orderId,
    order_amount: amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id=${orderId}&product_id=${productId}`
    }
  };

  try {
    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
      payload,
      {
        headers: {
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY
        }
      }
    );

    const order = response.data;
    console.log('Cashfree Order Response:', order);

    const paymentLink = `https://www.cashfree.com/pg/orders/${orderId}`;
    res.status(200).json({ paymentLink });
  } catch (error) {
    console.error('Create Order Error:', error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.message || 'Failed to create payment order'
    });
  }
}
