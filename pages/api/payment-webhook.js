export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // Cashfree sends JSON body
  const event = req.body;

  console.log('Payment webhook received:', event);

  // You can verify the event signature here (optional but recommended in production)

  if (event?.order?.status === 'PAID') {
    // You can save this to DB/logs etc.
    console.log(`Payment successful for order: ${event.order.order_id}`);
  }

  res.status(200).send('Webhook received');
}
