// pages/api/payment-webhook.js
import { buffer } from 'micro';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false, // Important to verify raw body
  },
};

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
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const signature = req.headers['x-webhook-signature'];

    const generatedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawBody)
      .digest('base64');

    if (signature !== generatedSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const data = JSON.parse(rawBody.toString());

    const {
      order_id,
      order_amount,
      reference_id,
      payment_mode,
      tx_msg,
      tx_time,
      tx_status
    } = data;

    console.log(`Received webhook: ${order_id} - ${tx_status}`);

    // TODO: Update your DB or Google Sheet here

    return res.status(200).json({ message: 'Webhook verified and processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
