// pages/api/create-order.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const {
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    customerPhone
  } = req.body;

  try {
    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
      {
        order_id: `${productId}-${Date.now()}`,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerPhone,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: `https://your-firebase-site.web.app/success?order_id={order_id}`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY
        }
      }
    );

    res.status(200).json({ paymentLink: response.data.payment_link });
  } catch (error) {
    console.error('Cashfree Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
}
