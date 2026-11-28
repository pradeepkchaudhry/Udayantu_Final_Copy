import { createClient } from '@supabase/supabase-js';
import {
  calculateGstInclusiveBreakdown,
  getDefaultStudentPlans,
  type AdmissionPlanCode,
} from '../server/domain/commercialEngine';

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
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!supabaseUrl || !supabaseServiceKey || !razorpayKeyId || !razorpayKeySecret) {
    return res.status(503).json({
      error: 'Payment gateway or database environment variables are not configured on the server.',
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { user_id, plan_code = 'plan_a_refundable' } = req.body ?? {};
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    const plans = getDefaultStudentPlans();
    const selectedPlan = plans[plan_code as AdmissionPlanCode] ?? plans.plan_a_refundable;
    const breakdown = calculateGstInclusiveBreakdown(selectedPlan.priceInr, selectedPlan.gstRatePercent);
    const amountPaise = Math.round(breakdown.totalPayableInr * 100);

    const credentials = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `udy_${String(user_id).slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: String(user_id),
          plan_code: selectedPlan.code,
          agreement_version: selectedPlan.agreementVersion,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      return res.status(502).json({ error: 'Failed to create payment order: ' + errorText });
    }

    const razorpayOrder = await razorpayResponse.json();

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id,
        amount: amountPaise,
        razorpay_order_id: razorpayOrder.id,
        status: 'created',
        currency: 'INR',
        amount_base_inr: breakdown.taxableBaseInr,
        gst_percent: breakdown.gstRatePercent,
        gst_amount_inr: breakdown.gstAmountInr,
        amount_final_inr: breakdown.totalPayableInr,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    return res.status(200).json({
      order_id: razorpayOrder.id,
      amount: amountPaise,
      currency: 'INR',
      key_id: razorpayKeyId,
      payment_id: payment.id,
      gst_breakdown: breakdown,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Payment order creation failed' });
  }
}
