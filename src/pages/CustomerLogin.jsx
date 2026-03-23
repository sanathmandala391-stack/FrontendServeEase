import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../data/Api";

export const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/customer-Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      if (res.ok && data.customerId) {
        localStorage.clear();
        localStorage.setItem("role", "CUSTOMER");
        localStorage.setItem("Login-Token", data.token);
        localStorage.setItem("name", data.name);
        localStorage.setItem("customerId", String(data.customerId));
        localStorage.setItem("customerEmail", data.email || email);
        localStorage.setItem("customerPhone", data.phone || "");
        navigate("/home");
      } else {
        setError(typeof data === "string" ? data : data.message || "Invalid email or password.");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>ServeEase</h1>
          <p>Your home services platform</p>
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 4, fontWeight: 800 }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>Sign in to book services</p>
        {error && <div className="error-box">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input-field" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="loader" />Signing in...</> : "Sign In →"}
          </button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text2)" }}>
          New here? <span style={{ color: "var(--brand)", cursor: "pointer", fontWeight: 700 }} onClick={() => navigate("/customerRegister")}>Create account →</span>
        </p>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
          Provider? <span style={{ color: "var(--brand)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/providerlogin")}>Login here</span>
        </p>
      </div>
    </div>
  );
};
