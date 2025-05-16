import axios from 'axios';

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

  // Create a unique order ID
  const orderId = `ORDER_${Date.now()}`;

  // Return URL after payment
  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?order_id=${orderId}&product_id=${productId}`;

  // Generate a safe alphanumeric customer_id
  const customerId = `cust_${customerPhone || Date.now()}`;

  // Set the correct Cashfree endpoint (change to sandbox if testing)
  const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg/orders'
    : 'https://api.cashfree.com/pg/orders';

  try {
    const response = await axios.post(
      CASHFREE_BASE_URL,
      {
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
          return_url: returnUrl
        }
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

    // Return the payment link to frontend
    res.status(200).json({ paymentLink: response.data.payment_link });

  } catch (error) {
    // Detailed error logging for debugging
    console.error('Create Order Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({
      message: 'Failed to create payment order',
      error: error.response?.data || error.message
    });
  }
}
