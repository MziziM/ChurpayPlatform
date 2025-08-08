import { useEffect, useState } from "react";

function App() {
  // Use env var if present, else hard fallback to your backend service
  const apiBase = (import.meta.env.VITE_API_URL || "https://churpay-backend-wtgy.onrender.com").trim();

  const [health, setHealth] = useState(null);
  const [amount, setAmount] = useState("50.00");

  useEffect(() => {
    const check = async () => {
      try {
        const url = `${apiBase}/api/health`;
        console.log("Health check ->", url);
        const r = await fetch(url);
        const text = await r.text();
        if (!r.ok) {
          setHealth({ ok: false, status: r.status, body: text });
          return;
        }
        try {
          const json = JSON.parse(text);
          setHealth(json);
        } catch {
          setHealth({ ok: false, status: r.status, body: text });
        }
      } catch (e) {
        setHealth({ ok: false, error: String(e) });
      }
    };
    check();
  }, [apiBase]);

  const handlePay = async () => {
    try {
      const url = `${apiBase}/api/payfast/initiate`;
      console.log("Initiate Pay ->", url);
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await r.json().catch(() => ({}));
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert("Failed to start payment. " + JSON.stringify(data));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
const [payments, setPayments] = useState([]);
const [loadingPayments, setLoadingPayments] = useState(false);

const loadPayments = async () => {
  try {
    setLoadingPayments(true);
    const r = await fetch(`${apiBase}/api/payments`);
    const data = await r.json();
    setPayments(Array.isArray(data) ? data : []);
  } catch (e) {
    console.error(e);
    setPayments([]);
  } finally {
    setLoadingPayments(false);
  }
};

useEffect(() => {
  // after health check starts, fetch payments too
  loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [apiBase]);
  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, Arial" }}>
      <h1>Churpay</h1>
      <p>Seamless payments made simple.</p>

      {/* Show API base for debugging */}
      <div style={{ marginBottom: 12, fontSize: 12, color: "#6b7280" }}>
        API base: {apiBase}
      </div>

      {/* Health status */}
      <div style={{
        marginBottom: 12,
        padding: "8px 12px",
        borderRadius: 8,
        display: "inline-block",
        color: "#fff",
        background: health && health.ok ? "#22c55e" : "#ef4444"
      }}>
        Health: {health ? (health.ok ? "OK" : "ERROR") : "..."}
      </div>

      {health && !health.ok && (
        <pre style={{
          marginTop: 8,
          maxWidth: 600,
          whiteSpace: "pre-wrap",
          fontSize: 12,
          color: "#6b7280"
        }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
      <div style={{ marginTop: 32 }}>
  <h2 style={{ margin: 0, marginBottom: 8 }}>Recent Payments</h2>
  <button onClick={loadPayments} style={{ padding: "6px 12px", borderRadius: 6 }}>
    {loadingPayments ? "Refreshing..." : "Refresh"}
  </button>
  <div style={{ marginTop: 12, overflowX: "auto" }}>
    <table style={{ borderCollapse: "collapse", minWidth: 600 }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>ID</th>
          <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>PF Payment ID</th>
          <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Amount</th>
          <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Status</th>
          <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #e5e7eb" }}>Created</th>
        </tr>
      </thead>
      <tbody>
        {payments.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ padding: 12, color: "#6b7280" }}>
              {loadingPayments ? "Loading..." : "No payments yet"}
            </td>
          </tr>
        ) : (
          payments.map(p => (
            <tr key={p.id}>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{p.id}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{p.pf_payment_id || "-"}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{p.amount ?? "-"}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{p.status || "-"}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                {new Date(p.created_at).toLocaleString()}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* Payment form */}
      <div style={{ marginTop: 24 }}>
        <label>
          Amount (ZAR):{" "}
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
        </label>
        <button
          onClick={handlePay}
          style={{
            marginLeft: 12,
            padding: "8px 16px",
            borderRadius: 6,
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Pay with PayFast (Sandbox)
        </button>
      </div>
    </div>
  );
}

export default App;