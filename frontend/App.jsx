import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);
  const [amount, setAmount] = useState("50.00");
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${api}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, [api]);

  const handlePay = async () => {
    const r = await fetch(`${api}/api/payfast/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await r.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      alert("Failed to start payment");
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, Arial" }}>
      <h1>Churpay</h1>
      <p>Health: {health ? JSON.stringify(health) : "..."}</p>

      <div style={{ marginTop: 24 }}>
        <label>
          Amount (ZAR):{" "}
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ padding: 8 }}
          />
        </label>
        <button onClick={handlePay} style={{ marginLeft: 12, padding: "8px 16px" }}>
          Pay with PayFast (Sandbox)
        </button>
      </div>
    </div>
  );
}

export default App;