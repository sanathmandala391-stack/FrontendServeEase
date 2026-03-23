import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../data/Api";

export const ProviderRegister = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", experience: "", location: "", serviceServiceId: "" });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    fetch(`${API_URL}/getAllServices`).then(r => r.json()).then(setServices).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/add-Provider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceServiceId: Number(form.serviceServiceId) })
      });
      const text = await res.text();
      if (res.ok) {
        alert("✅ Registered! Please login.");
        navigate("/providerlogin");
      } else {
        setError(text || "Registration failed.");
      }
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <h1>ServeEase</h1>
          <p>Join as a Service Provider</p>
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 4, fontWeight: 800 }}>Provider Registration</h2>
        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>Start earning with ServeEase today</p>
        {error && <div className="error-box">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          {[["name","Full Name","text","Your full name"],["email","Email","email","provider@example.com"],["password","Password","password","Min 6 characters"],["phone","Phone","tel","10-digit number"],["experience","Experience","text","e.g. 3 Years"],["location","Location / City","text","e.g. Hyderabad"]].map(([k,label,type,placeholder]) => (
            <div className="input-group" key={k}>
              <label>{label}</label>
              <input className="input-field" type={type} placeholder={placeholder} value={form[k]} onChange={set(k)} required />
            </div>
          ))}
          <div className="input-group">
            <label>Service Category</label>
            <select className="input-field input-select" value={form.serviceServiceId} onChange={set("serviceServiceId")} required>
              <option value="">Select your service</option>
              {services.map(s => <option key={s.serviceId} value={s.serviceId}>{s.serviceName}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="loader" />Registering...</> : "Register as Provider →"}
          </button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text2)" }}>
          Already registered? <span style={{ color: "var(--brand)", cursor: "pointer", fontWeight: 700 }} onClick={() => navigate("/providerlogin")}>Sign in →</span>
        </p>
      </div>
    </div>
  );
};
