import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { Pool } from "pg";
import qs from "qs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS ---
const allowed = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger middleware
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// --- DB ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// simple table to prove DB works
const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      pf_payment_id TEXT,
      amount NUMERIC,
      status TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};
ensureTable().catch(console.error);

// --- Health ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "backend" });
});

app.get("/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok");
    res.json({ ok: true, db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- PayFast helpers ---
const toSignatureString = (obj) => {
  // PayFast requires ordered, URL-encoded query string without null/undefined fields
  const clean = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== ""));
  return qs.stringify(clean, { encode: false });
};

const sign = (params) => {
  const passphrase = process.env.PAYFAST_PASSPHRASE || process.env.PAYFAST_MERCHANT_KEY || "";
  const base = toSignatureString(params) + (passphrase ? `&passphrase=${passphrase}` : "");
  return crypto.createHash("md5").update(base).digest("hex");
};

// --- PayFast mode/config ---
const PAYFAST_MODE = (process.env.PAYFAST_MODE || 'sandbox').toLowerCase();
const isSandbox = PAYFAST_MODE !== 'live';
const PF_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || (isSandbox ? '10000100' : undefined);
const PF_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || (isSandbox ? '46f0cd694581a' : undefined);
const PF_GATEWAY = isSandbox
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

// --- Initiate payment (client hits this; we return the gateway URL to redirect) ---
app.post("/api/payfast/initiate", async (req, res) => {
  try {
    const { amount, item_name = "Churpay Top Up", return_url, cancel_url, notify_url } = req.body;

    if (!amount) return res.status(400).json({ error: "amount required" });

    const pfParams = {
      merchant_id: PF_MERCHANT_ID,
      merchant_key: PF_MERCHANT_KEY,
      amount: Number(amount).toFixed(2),
      item_name,
      return_url: return_url || `${process.env.FRONTEND_URL}/payfast/return`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL}/payfast/cancel`,
      notify_url: notify_url || `${process.env.BACKEND_URL || ""}/api/payfast/ipn`
    };

    const signature = sign(pfParams);
    const redirectUrl = `${PF_GATEWAY}?${toSignatureString({ ...pfParams, signature })}`;
    console.log('[PayFast] mode=%s merchant_id=%s gateway=%s amount=%s', PAYFAST_MODE, PF_MERCHANT_ID, PF_GATEWAY, pfParams.amount);

    res.json({ redirectUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to initiate PayFast" });
  }
});

// --- IPN endpoint (PayFast server calls this) ---
app.post("/api/payfast/ipn", async (req, res) => {
  try {
    // NOTE: For production, implement full IPN validation per PayFast docs.
    const { pf_payment_id, amount_gross, payment_status } = req.body;

    await pool.query(
      "INSERT INTO payments (pf_payment_id, amount, status) VALUES ($1,$2,$3)",
      [pf_payment_id || null, amount_gross ? Number(amount_gross) : null, payment_status || "PENDING"]
    );

    res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("ERR");
  }
});

// Root welcome
app.get("/", (_req, res) => {
  res.json({ message: "Churpay Backend is running" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});