import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../data/Api";

export const CustomerRegister = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/customer-Register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const text = await res.text();
      if (res.ok) {
        alert("✅ Account created! Please login.");
        navigate("/customerlogin");
      } else {
        setError(text || "Registration failed.");
      }
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>ServeEase</h1>
          <p>Create your account</p>
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 4, fontWeight: 800 }}>Get Started</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>Join 10,000+ happy customers</p>
        {error && <div className="error-box">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          {[["name","Full Name","text","Your full name"],["email","Email","email","you@example.com"],["password","Password","password","Min 6 characters"],["phone","Phone","tel","10-digit mobile number"],["address","Address","text","Your city / area"]].map(([k,label,type,placeholder]) => (
            <div className="input-group" key={k}>
              <label>{label}</label>
              <input className="input-field" type={type} placeholder={placeholder} value={form[k]} onChange={set(k)} required />
            </div>
          ))}
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="loader" />Creating...</> : "Create Account →"}
          </button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text2)" }}>
          Already have an account? <span style={{ color: "var(--brand)", cursor: "pointer", fontWeight: 700 }} onClick={() => navigate("/customerlogin")}>Sign in →</span>
        </p>
      </div>
    </div>
  );
};
