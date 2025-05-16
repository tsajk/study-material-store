
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Log webhook payload for debugging
    console.log('Webhook payload received:', req.body);

    // Extract important data
    const {
      orderId,
      txStatus,
      orderAmount,
      referenceId,
      paymentMode,
      txMsg,
      txTime
    } = req.body;

    console.log(`Webhook for order ${orderId}:`);
    console.log(`Status: ${txStatus}, Amount: ${orderAmount}`);
    console.log(`Payment Mode: ${paymentMode}, Reference ID: ${referenceId}`);
    console.log(`Message: ${txMsg}, Time: ${txTime}`);

    // TODO: Update your database or send notification here

    return res.status(200).json({ message: 'Webhook received without signature validation' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
