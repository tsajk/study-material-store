export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // TODO: verify webhook signature for security
  const webhookPayload = req.body;

  // Process webhook payload: update order status, etc.

  res.status(200).send('Webhook received');
}
