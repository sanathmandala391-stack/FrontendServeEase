import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, NGROK_HEADERS } from "../data/Api";

const ADMIN_EMAIL = "admin@serveease.com";
const ADMIN_PASSWORD = "admin@1234";

const TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "bookings", label: "Bookings", icon: "📋" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "customers", label: "Customers", icon: "👥" },
  { key: "providers", label: "Providers", icon: "👷" },
  { key: "services", label: "Services", icon: "🛠️" },
];

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handle = (e) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("role", "ADMIN");
      localStorage.setItem("name", "Admin");
      onLogin();
    } else {
      setError("Invalid admin credentials.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>✦ ServeEase</h1>
          <p>Admin Control Panel</p>
        </div>
        <div style={{ background: "var(--brand-light)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "var(--brand-dark)", textAlign: "center" }}>
          🔐 Restricted Access — Admins Only
        </div>
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--red)" }}>
            ✕ {error}
          </div>
        )}
        <form onSubmit={handle}>
          <div className="input-group">
            <label>Admin Email</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@serveease.com" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" style={{ padding: 14 }}>Access Admin Panel</button>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="admin-stat card">
    <div className="admin-stat-icon" style={{ background: color + "20" }}><span style={{ fontSize: 22 }}>{icon}</span></div>
    <p className="admin-stat-value" style={{ color }}>{value}</p>
    <p className="admin-stat-label">{label}</p>
  </div>
);

export const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("role") === "ADMIN");
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ bookings: [], payments: [], customers: [], providers: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      // ✅ All correct endpoints from backend
      const [bookRes, payRes, cusRes, provRes, svcRes] = await Promise.all([
        fetch(`${API_URL}/getAll-Bookings`),      // ✅ /getAll-Bookings
        fetch(`${API_URL}/payment/all`),           // ✅ /payment/all
        fetch(`${API_URL}/getAllCustomers`),        // ✅ /getAllCustomers
        fetch(`${API_URL}/getAllProviders`),        // ✅ /getAllProviders
        fetch(`${API_URL}/getAllServices`),         // ✅ /getAllServices
      ]);
      const [bookings, payments, customers, providers, services] = await Promise.all([
        bookRes.json(), payRes.json(), cusRes.json(), provRes.json(), svcRes.json(),
      ]);
      setData({ bookings, payments, customers, providers, services });
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (loggedIn) fetchAll(); }, [loggedIn]);

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  const logout = () => { localStorage.removeItem("role"); setLoggedIn(false); navigate("/"); };
  const totalRevenue = data.payments.filter(p => p.status === "SUCCESS").reduce((s, p) => s + (p.amount || 0), 0);

  const renderOverview = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="📋" label="Total Bookings" value={data.bookings.length} color="var(--brand)" />
        <StatCard icon="💰" label="Revenue" value={"₹" + totalRevenue.toLocaleString()} color="var(--green)" />
        <StatCard icon="👥" label="Customers" value={data.customers.length} color="var(--blue)" />
        <StatCard icon="👷" label="Providers" value={data.providers.length} color="var(--accent)" />
        <StatCard icon="🛠️" label="Services" value={data.services.length} color="#6366F1" />
        <StatCard icon="💵" label="COD Orders" value={data.payments.filter(p => p.status === "COD").length} color="#F59E0B" />
      </div>
      <h3 style={{ marginBottom: 14, fontSize: 18 }}>Recent Bookings</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Customer</th><th>Provider</th><th>Service</th><th>Address</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {data.bookings.slice(0, 10).map(b => (
              <tr key={b.bookingId}>
                <td style={{ fontWeight: 700 }}>#SRV{String(b.bookingId).padStart(4, "0")}</td>
                <td>{b.customerId}</td><td>{b.providerId}</td><td>{b.serviceId}</td><td>{b.address}</td>
                <td><span className={"badge " + (b.status === "COMPLETED" ? "badge-green" : b.status === "CANCELLED" ? "badge-red" : "badge-blue")}>{b.status}</span></td>
                <td>{b.bookingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => {
    const filtered = data.bookings.filter(b => !search || String(b.bookingId).includes(search) || (b.address && b.address.toLowerCase().includes(search.toLowerCase())));
    return (
      <div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <input className="input-field" placeholder="Search by ID or address..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
          <span style={{ fontSize: 13, color: "var(--text2)" }}>{filtered.length} bookings</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Customer</th><th>Provider</th><th>Service</th><th>Address</th><th>Status</th><th>OTP</th><th>Payment</th><th>Date</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.bookingId}>
                  <td style={{ fontWeight: 700 }}>#SRV{String(b.bookingId).padStart(4, "0")}</td>
                  <td>{b.customerId}</td><td>{b.providerId}</td><td>{b.serviceId}</td><td>{b.address}</td>
                  <td><span className={"badge " + (b.status === "COMPLETED" ? "badge-green" : b.status === "CANCELLED" ? "badge-red" : b.status === "WAITING_FOR_OTP" ? "badge-yellow" : "badge-blue")}>{b.status}</span></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent)" }}>{b.otp || "—"}</td>
                  <td><span className={"badge " + (b.paymentStatus === "SUCCESS" ? "badge-green" : b.paymentStatus === "COD" ? "badge-yellow" : "badge-gray")}>{b.paymentStatus || "—"}</span></td>
                  <td>{b.bookingDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard icon="✅" label="Successful" value={data.payments.filter(p => p.status === "SUCCESS").length} color="var(--green)" />
        <StatCard icon="💵" label="Cash on Delivery" value={data.payments.filter(p => p.status === "COD").length} color="var(--accent)" />
        <StatCard icon="❌" label="Failed/Pending" value={data.payments.filter(p => p.status === "FAILED" || p.status === "PENDING").length} color="var(--red)" />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Booking</th><th>Customer</th><th>Amount</th><th>Type</th><th>Status</th><th>Txn ID</th><th>Date</th></tr></thead>
          <tbody>
            {data.payments.map(p => (
              <tr key={p.paymentId}>
                <td style={{ fontWeight: 700 }}>#{p.paymentId}</td>
                <td>#SRV{String(p.bookingId || "").padStart(4, "0")}</td>
                <td>{p.customerId}</td>
                <td style={{ fontWeight: 700, color: "var(--green)" }}>₹{p.amount}</td>
                <td><span className={"badge " + (p.paymentType === "COD" ? "badge-yellow" : "badge-purple")}>{p.paymentType}</span></td>
                <td><span className={"badge " + (p.status === "SUCCESS" ? "badge-green" : p.status === "COD" ? "badge-yellow" : p.status === "FAILED" ? "badge-red" : "badge-gray")}>{p.status}</span></td>
                <td style={{ fontFamily: "monospace", fontSize: 11 }}>{p.txnId}</td>
                <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th></tr></thead>
        <tbody>
          {data.customers.map(c => (
            <tr key={c.customerId}>
              <td style={{ fontWeight: 700 }}>#{c.customerId}</td>
              <td style={{ fontWeight: 600 }}>{c.name}</td>
              <td>{c.email}</td><td>{c.phone}</td><td>{c.address}</td><td>{c.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProviders = () => (
    <div className="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Experience</th><th>Location</th><th>Rating</th></tr></thead>
        <tbody>
          {data.providers.map(p => (
            <tr key={p.providerId}>
              <td style={{ fontWeight: 700 }}>#{p.providerId}</td>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td>{p.email}</td><td>{p.phone}</td><td>{p.experience}</td><td>{p.location}</td>
              <td>{p.rating ? "⭐ " + p.rating : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderServices = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
      {data.services.map(s => (
        <div key={s.serviceId} className="card" style={{ overflow: "hidden" }}>
          {s.imageUrl && (
            <img src={`http://localhost:8080/uploads/${s.imageUrl}`} alt={s.serviceName} style={{ width: "100%", height: 140, objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          )}
          <div style={{ padding: 14 }}>
            <span className="badge badge-purple" style={{ marginBottom: 8 }}>{s.category}</span>
            <h4 style={{ fontSize: 15, marginBottom: 4 }}>{s.serviceName}</h4>
            <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>{s.description}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--brand)" }}>₹{s.price}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const RENDER = { overview: renderOverview, bookings: renderBookings, payments: renderPayments, customers: renderCustomers, providers: renderProviders, services: renderServices };

  return (
    <div className="page">
      <div style={{ background: "var(--dark)", color: "white", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18 }}>✦ ServeEase Admin</span>
          <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>Control Panel</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "white", padding: "6px 14px", fontSize: 12 }} onClick={fetchAll}>↻ Refresh</button>
          <button className="btn btn-danger" style={{ padding: "6px 14px", fontSize: 12 }} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 48px)" }}>
        <div style={{ width: 220, background: "white", borderRight: "1px solid var(--border)", padding: "20px 12px", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 700 : 500, background: tab === t.key ? "var(--brand-light)" : "transparent", color: tab === t.key ? "var(--brand)" : "var(--text2)", display: "flex", alignItems: "center", gap: 10, marginBottom: 4, textAlign: "left" }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 22 }}>{TABS.find(t => t.key === tab)?.icon} {TABS.find(t => t.key === tab)?.label}</h2>
          </div>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
              <div className="loader" style={{ width: 40, height: 40 }} />
            </div>
          ) : RENDER[tab]()}
        </div>
      </div>

      {toast && <div className={"toast toast-" + toast.type}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}
    </div>
  );
};
