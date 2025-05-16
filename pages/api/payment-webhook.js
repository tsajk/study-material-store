export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const event = req.body;

  console.log('Received Cashfree Webhook:', event);

  // You can verify the signature here if needed and log the payment status.
  if (event?.event === 'PAYMENT_SUCCESS') {
    const orderId = event.data.order.order_id;
    const paymentId = event.data.payment.payment_id;

    // TODO: Mark payment as complete, send email, update database, etc.
    console.log(`Payment success for Order ID: ${orderId}, Payment ID: ${paymentId}`);
  }

  res.status(200).send('Webhook received');
}
