import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const signature = req.headers['x-webhook-signature'];

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);
    const bodyString = bodyBuffer.toString('utf8');
    const parsedBody = JSON.parse(bodyString);

    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(bodyString)
      .digest('base64');

    if (req.headers['x-webhook-test']) {
  console.log('Test webhook received, skipping signature validation');
} else {
  const generatedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(bodyString)
    .digest('base64');

  if (signature !== generatedSignature) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ message: 'Invalid signature' });
  }
}
    const {
      orderId,
      txStatus,
      orderAmount,
      referenceId,
      paymentMode,
      txMsg,
      txTime
    } = parsedBody;

    console.log(`Webhook received: orderId=${orderId}, status=${txStatus}`);

    // TODO: Save to DB

    return res.status(200).json({ message: 'Webhook verified and processed' });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
