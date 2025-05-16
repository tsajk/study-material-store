import { Cashfree } from 'cashfree-pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    productId,
    productName,
    amount,
    customerName,
    customerEmail,
    customerPhone
  } = req.body;

  try {
    // Initialize Cashfree
    Cashfree.XClientId = "605266b66d4c81295df88e013e662506";
    Cashfree.XClientSecret = "cfsk_ma_prod_3d5c1e52a60832d47f1eb1af9045d1c2_4b948447";
    Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

    // Generate a unique order ID
    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create order request
    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      order_note: productName,
      customer_details: {
        customer_id: customerEmail,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `https://${req.headers.host}/payment-success?product_id=${productId}&order_id=${orderId}`,
      },
    };

    // Create order
    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    if (response.data && response.data.payment_link) {
      return res.status(200).json({
        paymentLink: response.data.payment_link,
        orderId: orderId
      });
    } else {
      throw new Error('Failed to create payment link');
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create payment link' });
  }
}
