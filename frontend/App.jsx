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

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Inter', system-ui, Arial, sans-serif",
      backgroundColor: "#f9fafb",
      padding: 24,
    },
    header: {
      marginBottom: 24,
      textAlign: "center",
      color: "#1f2937",
    },
    title: {
      fontSize: 48,
      fontWeight: "700",
      margin: 0,
      letterSpacing: "0.05em",
    },
    tagline: {
      fontSize: 18,
      fontWeight: "400",
      color: "#4b5563",
      marginTop: 8,
    },
    healthBox: {
      marginBottom: 32,
      padding: "12px 24px",
      borderRadius: 8,
      fontWeight: "600",
      fontSize: 16,
      color: "#fff",
      backgroundColor: health && health.ok ? "#22c55e" : "#ef4444",
      boxShadow: health && health.ok ? "0 2px 8px rgba(34, 197, 94, 0.4)" : "0 2px 8px rgba(239, 68, 68, 0.4)",
      minWidth: 180,
      textAlign: "center",
      userSelect: "none",
    },
    form: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      backgroundColor: "#fff",
      padding: 24,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: "#374151",
    },
    input: {
      padding: "10px 14px",
      fontSize: 16,
      borderRadius: 8,
      border: "1.5px solid #d1d5db",
      outline: "none",
      width: 120,
      transition: "border-color 0.3s ease",
    },
    inputFocus: {
      borderColor: "#3b82f6",
      boxShadow: "0 0 6px #3b82f6",
    },
    button: {
      padding: "10px 24px",
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
      backgroundColor: "#3b82f6",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
      transition: "background-color 0.3s ease, box-shadow 0.3s ease",
    },
    buttonHover: {
      backgroundColor: "#2563eb",
      boxShadow: "0 6px 16px rgba(37, 99, 235, 0.6)",
    },
  };

  // For handling input focus styling
  const [inputFocused, setInputFocused] = useState(false);
  // For handling button hover styling
  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Churpay</h1>
        <p style={styles.tagline}>Seamless payments made simple</p>
      </header>

      <div style={styles.healthBox}>
        Health: {health ? JSON.stringify(health) : "..."}
      </div>

      <form
        style={styles.form}
        onSubmit={e => {
          e.preventDefault();
          handlePay();
        }}
      >
        <label style={styles.label}>
          Amount (ZAR):
          <input
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            style={{
              ...styles.input,
              ...(inputFocused ? styles.inputFocus : {}),
              marginLeft: 8,
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            ...styles.button,
            ...(buttonHovered ? styles.buttonHover : {}),
          }}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
        >
          Pay with PayFast (Sandbox)
        </button>
      </form>
    </div>
  );
}

export default App;