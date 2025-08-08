import { useEffect, useState } from "react";

function App() {
  const api = import.meta.env.VITE_API_URL;
  const apiBase = api || "";

  const [health, setHealth] = useState(null);
  const [amount, setAmount] = useState("10.00");

  useEffect(() => {
    const check = async () => {
      try {
        if (!apiBase) {
          setHealth({ ok: false, error: "VITE_API_URL is missing (frontend env not set)" });
          return;
        }
        const r = await fetch(`${apiBase}/api/health`);
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
    if (!apiBase) {
      alert("VITE_API_URL is missing in the frontend environment.");
      return;
    }
    const r = await fetch(`${apiBase}/api/payfast/initiate`, {
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
  };

  return (
    <div className="App">
      <h1>Churpay Demo</h1>
      <p>Top up your account with PayFast</p>

      <div style={{ marginBottom: 12, fontSize: 12, color: "#6b7280" }}>
        API base: {apiBase || "(not set)"} 
      </div>

      <div className="healthBox">
        Health: {health ? (health.ok ? "OK" : "ERROR") : "..."}
      </div>
      {health && !health.ok && (
        <pre style={{ marginTop: 8, maxWidth: 600, whiteSpace: "pre-wrap", fontSize: 12, color: "#6b7280" }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}

      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <button onClick={handlePay}>Pay</button>
    </div>
  );
}

export default App;