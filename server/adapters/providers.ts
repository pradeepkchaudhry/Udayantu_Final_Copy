/**
 * Migration-Ready Provider Adapters.
 *
 * Isolates Firebase, Razorpay, SMS/OTP, Email, Cloud Storage, and Outbox Queue
 * behind standard TypeScript interfaces so core business services remain
 * cloud-neutral and portable.
 */

import crypto from "node:crypto";
import {
  assertNoMockFinancialExecutionInLiveMode,
  resolveRuntimeMode,
  type RuntimeMode,
} from "../domain/commercialEngine";

export interface VerifiedIdentity {
  provider: "firebase" | "local_token";
  providerUid: string;
  email?: string;
  phoneE164?: string;
  mfaVerified: boolean;
}

export interface IdentityProviderAdapter {
  readonly providerName: string;
  verifyBearerToken(token: string): Promise<VerifiedIdentity | null>;
  mintSessionToken(payload: {
    userId: string;
    role: string;
    email: string;
    phoneE164?: string;
    employerId?: string | null;
    mfaVerified?: boolean;
  }): string;
}

export interface PaymentOrderResult {
  gateway: "razorpay";
  orderId: string;
  amountPaise: number;
  currency: "INR";
  publicKeyId: string;
  mode: RuntimeMode;
}

export interface PaymentProviderAdapter {
  readonly gatewayName: "razorpay";
  createOrder(params: {
    amountInr: number;
    receipt: string;
    notes: Record<string, string>;
  }): Promise<PaymentOrderResult>;
  verifyCheckoutSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean;
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
  computeSandboxSignatureForDev(orderId: string, paymentId: string): string;
}

export interface StorageProviderAdapter {
  readonly backendName: string;
  createSignedDownloadUrl(objectKey: string, ttlSeconds?: number): string;
  createSignedUploadUrl(objectKey: string, mimeType: string, ttlSeconds?: number): string;
}

export interface OtpSmsAdapter {
  readonly providerName: string;
  sendIndianOtp(phone10Digits: string, code: string): Promise<{ delivered: boolean; mode: RuntimeMode }>;
}

export interface EmailProviderAdapter {
  readonly providerName: string;
  sendTransactionalEmail(params: {
    to: string;
    subject: string;
    textSummary: string;
  }): Promise<{ accepted: boolean; mode: RuntimeMode }>;
}

const EPHEMERAL_DEV_SIGNING_SECRET =
  process.env.API_SESSION_SECRET ||
  crypto.createHash("sha256").update(`udayantu-dev-secret-${process.pid}`).digest("hex");

function timingSafeHexEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

export class PortableIdentityAdapter implements IdentityProviderAdapter {
  readonly providerName = process.env.FIREBASE_PROJECT_ID ? "firebase" : "local_token";
  private readonly signingSecret: string;

  constructor(signingSecret = EPHEMERAL_DEV_SIGNING_SECRET) {
    this.signingSecret = signingSecret;
  }

  mintSessionToken(payload: {
    userId: string;
    role: string;
    email: string;
    phoneE164?: string;
    employerId?: string | null;
    mfaVerified?: boolean;
  }): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({
        sub: payload.userId,
        role: payload.role,
        email: payload.email,
        phoneE164: payload.phoneE164,
        employerId: payload.employerId ?? null,
        mfaVerified: Boolean(payload.mfaVerified),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      })
    ).toString("base64url");
    const sig = crypto
      .createHmac("sha256", this.signingSecret)
      .update(`${header}.${body}`)
      .digest("base64url");
    return `${header}.${body}.${sig}`;
  }

  async verifyBearerToken(token: string): Promise<VerifiedIdentity | null> {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expectedSig = crypto
      .createHmac("sha256", this.signingSecret)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (!timingSafeHexEqual(sig, expectedSig)) {
      return null;
    }
    try {
      const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
      if (typeof parsed.exp === "number" && parsed.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return {
        provider: "local_token",
        providerUid: String(parsed.sub),
        email: parsed.email ? String(parsed.email) : undefined,
        phoneE164: parsed.phoneE164 ? String(parsed.phoneE164) : undefined,
        mfaVerified: Boolean(parsed.mfaVerified),
      };
    } catch {
      return null;
    }
  }
}

export class RazorpayPaymentAdapter implements PaymentProviderAdapter {
  readonly gatewayName = "razorpay" as const;
  private readonly mode: RuntimeMode;
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(env: Record<string, string | undefined> = process.env) {
    this.mode = resolveRuntimeMode(env);
    this.keyId = env.RAZORPAY_KEY_ID || "";
    this.keySecret = env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || "";
  }

  private getEffectiveSecret(): string {
    if (this.keySecret) return this.keySecret;
    assertNoMockFinancialExecutionInLiveMode(this.mode, true);
    return `sandbox_only_hmac_${EPHEMERAL_DEV_SIGNING_SECRET.slice(0, 16)}`;
  }

  private getEffectiveWebhookSecret(): string {
    if (this.webhookSecret) return this.webhookSecret;
    assertNoMockFinancialExecutionInLiveMode(this.mode, true);
    return `sandbox_only_wh_${EPHEMERAL_DEV_SIGNING_SECRET.slice(0, 16)}`;
  }

  async createOrder(params: {
    amountInr: number;
    receipt: string;
    notes: Record<string, string>;
  }): Promise<PaymentOrderResult> {
    const amountPaise = Math.round(params.amountInr * 100);
    if (amountPaise <= 0) {
      throw new Error("Order amount must be greater than zero");
    }

    // Live Mode: MUST call real Razorpay Orders API using server-side env secrets
    if (this.mode === "live") {
      if (!this.keyId || !this.keySecret) {
        throw new Error("LIVE_CONFIG_ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in Live Mode.");
      }
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: params.receipt.slice(0, 40),
          notes: params.notes,
        }),
      });
      if (!res.ok) {
        throw new Error(`Razorpay order creation failed with status ${res.status}`);
      }
      const data = (await res.json()) as { id: string; amount: number };
      return {
        gateway: "razorpay",
        orderId: data.id,
        amountPaise: data.amount,
        currency: "INR",
        publicKeyId: this.keyId,
        mode: "live",
      };
    }

    // Sandbox Mode: deterministic server-generated order ID using identical GST/amount math
    const orderId = `order_sbx_${crypto.randomBytes(8).toString("hex")}`;
    return {
      gateway: "razorpay",
      orderId,
      amountPaise,
      currency: "INR",
      publicKeyId: this.keyId || "rzp_test_sandbox_adapter",
      mode: "sandbox",
    };
  }

  verifyCheckoutSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!params.orderId || !params.paymentId || !params.signature) return false;
    const secret = this.getEffectiveSecret();
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest("hex");
    return timingSafeHexEqual(expected, params.signature);
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!rawBody || !signatureHeader) return false;
    const secret = this.getEffectiveWebhookSecret();
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return timingSafeHexEqual(expected, signatureHeader);
  }

  computeSandboxSignatureForDev(orderId: string, paymentId: string): string {
    assertNoMockFinancialExecutionInLiveMode(this.mode, true);
    const secret = this.getEffectiveSecret();
    return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  }
}

export class PortableGcsStorageAdapter implements StorageProviderAdapter {
  readonly backendName = process.env.GCS_PRIVATE_BUCKET ? "gcs" : "portable_local_key_adapter";

  createSignedDownloadUrl(objectKey: string, ttlSeconds = 600): string {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const sig = crypto
      .createHmac("sha256", EPHEMERAL_DEV_SIGNING_SECRET)
      .update(`GET:${objectKey}:${expires}`)
      .digest("hex")
      .slice(0, 24);
    return `/v1/documents/download?key=${encodeURIComponent(objectKey)}&exp=${expires}&sig=${sig}`;
  }

  createSignedUploadUrl(objectKey: string, mimeType: string, ttlSeconds = 600): string {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const sig = crypto
      .createHmac("sha256", EPHEMERAL_DEV_SIGNING_SECRET)
      .update(`PUT:${objectKey}:${mimeType}:${expires}`)
      .digest("hex")
      .slice(0, 24);
    return `/v1/documents/upload?key=${encodeURIComponent(objectKey)}&exp=${expires}&sig=${sig}`;
  }
}

export class PortableOtpSmsAdapter implements OtpSmsAdapter {
  readonly providerName = process.env.TWILIO_ACCOUNT_SID ? "twilio_dlt" : "sandbox_otp";
  private readonly mode: RuntimeMode;

  constructor(env: Record<string, string | undefined> = process.env) {
    this.mode = resolveRuntimeMode(env);
  }

  async sendIndianOtp(phone10Digits: string, code: string): Promise<{ delivered: boolean; mode: RuntimeMode }> {
    if (!/^[6-9]\d{9}$/.test(phone10Digits)) {
      throw new Error("Invalid 10-digit Indian mobile number");
    }
    if (this.mode === "live" && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: `+91${phone10Digits}`,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: `Your UdaYantu verification OTP is ${code}. Valid for 10 minutes.`,
          }),
        }
      );
      return { delivered: res.ok, mode: "live" };
    }
    // Never log raw OTPs in Live Mode
    return { delivered: true, mode: this.mode };
  }
}

export class PortableEmailAdapter implements EmailProviderAdapter {
  readonly providerName = process.env.RESEND_API_KEY ? "resend" : "sandbox_email";
  private readonly mode: RuntimeMode;

  constructor(env: Record<string, string | undefined> = process.env) {
    this.mode = resolveRuntimeMode(env);
  }

  async sendTransactionalEmail(params: {
    to: string;
    subject: string;
    textSummary: string;
  }): Promise<{ accepted: boolean; mode: RuntimeMode }> {
    if (this.mode === "live" && process.env.RESEND_API_KEY && process.env.EMAIL_FROM_ADDRESS) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM_ADDRESS,
          to: [params.to],
          subject: params.subject,
          text: params.textSummary,
        }),
      });
      return { accepted: res.ok, mode: "live" };
    }
    return { accepted: true, mode: this.mode };
  }
}
