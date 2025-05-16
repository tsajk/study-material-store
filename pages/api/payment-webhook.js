export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const event = req.body;

  console.log('Received Cashfree Webhook:', event);

  // Optional: Handle actual payment success event
  if (event?.event === 'PAYMENT_SUCCESS') {
    const orderId = event.data.order.order_id;
    const paymentId = event.data.payment.payment_id;
    const status = event.data.payment.payment_status;

    console.log(`Payment SUCCESS - Order ID: ${orderId}, Payment ID: ${paymentId}, Status: ${status}`);

    // TODO: You could store this in Firebase, Google Sheets, etc.
  }

  res.status(200).send('Webhook received');
}
