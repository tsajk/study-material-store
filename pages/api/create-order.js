import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const {
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  try {
    const response = await axios.post(
      'https://sandbox.cashfree.com/pg/orders',
      {
        order_id: `ORDER_${Date.now()}`,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerEmail,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id={order_id}&product_id=${productId}`,
          notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-webhook`,
        },
      },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json',
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        },
      }
    );

    res.status(200).json({ paymentLink: response.data.payment_link });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to create order',
      error: error?.response?.data || error.message,
    });
  }
}
