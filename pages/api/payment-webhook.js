import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,  // disable Next.js automatic body parsing to get raw body
  },
};

// Helper function to get raw request body as string
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const signature = req.headers['x-webhook-signature'];

    const rawBody = await getRawBody(req);

    // Generate signature from raw body exactly as received
    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('base64');

    if (signature !== generatedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Now safely parse JSON after verifying signature
    const body = JSON.parse(rawBody);

    const {
      orderId,
      txStatus,
      orderAmount,
      referenceId,
      paymentMode,
      txMsg,
      txTime
    } = body;

    console.log(`Webhook received for order ${orderId}: status=${txStatus}, amount=${orderAmount}`);

    // TODO: update your DB or trigger post-payment processes here

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
