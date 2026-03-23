import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../data/Api";

export const ProviderHomePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const providerId = localStorage.getItem("providerId");
  const name = localStorage.getItem("name") || "Provider";

  useEffect(() => {
    fetch(`${API_URL}/getAll-Bookings`)
      .then(r => r.json())
      .then(d => { setBookings(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const safeStatus = (s) => s?.trim()?.toUpperCase() || "PENDING";
  const active = bookings.filter(b => !["COMPLETED","CANCELLED"].includes(safeStatus(b.status)));
  const completed = bookings.filter(b => safeStatus(b.status) === "COMPLETED");
  const earnings = completed.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1C1C1C, #2D1515)", padding: "28px 16px", color: "white" }}>
        <div className="container">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Welcome back,</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 20 }}>{name} 👋</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              ["📋", active.length, "Active"],
              ["✅", completed.length, "Done"],
              ["💰", "₹" + earnings, "Earned"]
            ].map(([icon, val, label]) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, textAlign: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container section">
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button className="btn btn-primary btn-full" onClick={() => navigate("/provider-dashboard")}>
            📋 View All Bookings →
          </button>
        </div>

        <div className="section-header">
          <div className="section-title">Recent Bookings</div>
        </div>

        {loading ? (
          <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 16 }} />)}</div>
        ) : active.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No active bookings</div>
            <div className="empty-state-desc">New bookings will appear here</div>
          </div>
        ) : (
          active.slice(0, 5).map(b => (
            <div key={b.bookingId} className="booking-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="booking-service-name">Booking #{b.bookingId}</div>
                  <div className="booking-meta">
                    <span>📅 {b.bookingDate}</span>
                    <span>·</span>
                    <span>📍 {b.address}</span>
                  </div>
                </div>
                <span className="status-badge" style={{ background: "#EFF6FF", color: "var(--blue)" }}>
                  {b.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
