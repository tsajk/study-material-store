export const config = {
  api: {
    bodyParser: false, // disable body parsing so we can manually parse raw body
  },
};

import { IncomingMessage } from 'http';

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rawBody = await buffer(req);
    const body = JSON.parse(rawBody.toString());

    console.log('Webhook payload received:', body);

    const {
      orderId,
      txStatus,
      orderAmount,
      referenceId,
      paymentMode,
      txMsg,
      txTime
    } = body;

    console.log(`Webhook for order ${orderId}:`);
    console.log(`Status: ${txStatus}, Amount: ${orderAmount}`);
    console.log(`Payment Mode: ${paymentMode}, Reference ID: ${referenceId}`);
    console.log(`Message: ${txMsg}, Time: ${txTime}`);

    return res.status(200).json({ message: 'Webhook received without signature validation' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
