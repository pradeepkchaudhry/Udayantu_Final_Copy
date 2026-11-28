import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://udayantu.com';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!supabaseUrl || !supabaseServiceKey || !razorpayKeySecret) {
    return res.status(503).json({
      error: 'Payment verification credentials are not configured on the server.',
    });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const providedBuf = Buffer.from(String(razorpay_signature), 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: payUpdateErr } = await supabase
      .from('payments')
      .update({
        status: 'captured',
        razorpay_payment_id,
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (payUpdateErr) throw payUpdateErr;

    const { error: regUpdateErr } = await supabase
      .from('student_registrations')
      .update({ payment_status: 'paid' })
      .eq('payment_order_id', razorpay_order_id);

    if (regUpdateErr) throw regUpdateErr;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Payment verification failed' });
  }
}
