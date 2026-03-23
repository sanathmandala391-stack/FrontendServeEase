import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../data/Api";

const CATEGORIES = ["All","Plumbing","Electrical","Cleaning","Carpentry","Painting","AC Repair"];
const CATEGORY_ICONS = { All:"🔧", Plumbing:"🪠", Electrical:"⚡", Cleaning:"🧹", Carpentry:"🔨", Painting:"🖌️", "AC Repair":"❄️" };

const BookingModal = ({ service, onClose, onSuccess }) => {
  const [payMode, setPayMode] = useState("");
  const [address, setAddress] = useState(localStorage.getItem("lastAddress") || "");
  const [loading, setLoading] = useState(false);
  const customerId = Number(localStorage.getItem("customerId"));
  const amount = parseFloat(String(service?.price || "0").replace(/[^0-9.]/g, "")) || 0;

  const createBooking = async (paymentStatus) => {
    const res = await fetch(`${API_URL}/add-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        serviceId: service.serviceId,
        address: address || "Hyderabad",
        status: "BOOKED",
        isVerified: false,
        amount,
        paymentStatus
      })
    });
    if (!res.ok) throw new Error("Booking failed");
    return res;
  };

  const handleCOD = async () => {
    if (!address.trim()) { alert("Please enter your address"); return; }
    setLoading(true);
    try {
      const res = await createBooking("COD");
      const text = await res.text();
      // Find booking id from response or just proceed
      localStorage.setItem("lastAddress", address);
      onSuccess("cod");
    } catch (e) {
      alert("Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleOnline = async () => {
    if (!address.trim()) { alert("Please enter your address"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payment/pre-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.serviceId,
          customerId,
          email: localStorage.getItem("customerEmail") || "customer@serveease.com",
          name: localStorage.getItem("name") || "Customer",
          phone: localStorage.getItem("customerPhone") || "9999999999",
          address
        })
      });
      const data = await res.json();
      if (!res.ok || !data.paymentSessionId) {
        alert(data.message || "Payment setup failed. Please check service price.");
        setLoading(false);
        return;
      }
      localStorage.setItem("pendingBookingAddress", address);
      localStorage.setItem("pendingServiceId", service.serviceId);
      localStorage.setItem("pendingAmount", amount);
      localStorage.setItem("lastAddress", address);
      if (!window.Cashfree) { alert("Payment gateway loading. Please try again."); setLoading(false); return; }
      const cashfree = window.Cashfree({ mode: "production" });
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
    } catch (e) {
      alert("Payment error: " + e.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-header">
          <div>
            <div className="modal-title">Confirm Booking</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{service.serviceName}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Order Summary */}
          <div className="order-summary">
            <div className="order-summary-row">
              <span style={{ color: "var(--text2)" }}>{service.serviceName}</span>
              <span style={{ fontWeight: 600 }}>₹{amount}</span>
            </div>
            <div className="order-summary-row">
              <span style={{ color: "var(--text2)" }}>Platform fee</span>
              <span style={{ color: "var(--green)", fontWeight: 600 }}>FREE</span>
            </div>
            <div className="order-summary-row">
              <span>Total</span>
              <span style={{ color: "var(--brand)" }}>₹{amount}</span>
            </div>
          </div>

          {/* Address */}
          <div className="input-group">
            <label>📍 Service Address</label>
            <textarea
              className="input-field"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Enter full address for service..."
              rows={2}
              style={{ resize: "none" }}
            />
          </div>

          {/* Payment Options */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Choose Payment
            </div>

            {/* Online */}
            <div className={"payment-option" + (payMode === "ONLINE" ? " selected-online" : "")}
              onClick={() => setPayMode(payMode === "ONLINE" ? "" : "ONLINE")}>
              <div className="payment-option-header">
                <div className={"payment-radio" + (payMode === "ONLINE" ? " selected-online" : "")}>
                  {payMode === "ONLINE" && <div className="payment-radio-dot online" />}
                </div>
                <div className="payment-label">
                  <div className="payment-label-title">Pay Online <span style={{ background: "#DBEAFE", color: "var(--blue)", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700, marginLeft: 6 }}>INSTANT CONFIRM</span></div>
                  <div className="payment-label-sub">UPI · Cards · Net Banking · Wallets</div>
                </div>
                <span className="payment-icon">💳</span>
              </div>
              {payMode === "ONLINE" && (
                <div className="payment-body">
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {["📱 PhonePe","🌊 GPay","📲 Paytm","💳 Card"].map(m => (
                      <span key={m} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>{m}</span>
                    ))}
                  </div>
                  <button className="btn btn-primary btn-full btn-lg" onClick={e => { e.stopPropagation(); handleOnline(); }} disabled={loading}>
                    {loading ? <><span className="loader" />Processing...</> : `Pay ₹${amount} →`}
                  </button>
                </div>
              )}
            </div>

            {/* COD */}
            <div className={"payment-option" + (payMode === "COD" ? " selected-cod" : "")}
              onClick={() => setPayMode(payMode === "COD" ? "" : "COD")}>
              <div className="payment-option-header">
                <div className={"payment-radio" + (payMode === "COD" ? " selected-cod" : "")}>
                  {payMode === "COD" && <div className="payment-radio-dot cod" />}
                </div>
                <div className="payment-label">
                  <div className="payment-label-title">Cash on Delivery</div>
                  <div className="payment-label-sub">Pay ₹{amount} after service completion</div>
                </div>
                <span className="payment-icon">💵</span>
              </div>
              {payMode === "COD" && (
                <div className="payment-body">
                  <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "#78350F" }}>
                    ℹ️ Keep <strong>₹{amount}</strong> cash ready. Pay after service is done.
                  </div>
                  <button className="btn btn-green btn-full btn-lg" onClick={e => { e.stopPropagation(); handleCOD(); }} disabled={loading}>
                    {loading ? <><span className="loader" />Booking...</> : "Confirm Booking 🎉"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--text3)", textAlign: "center" }}>🔒 100% Secure · No hidden charges</p>
        </div>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "there";
  const customerId = localStorage.getItem("customerId");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch(`${API_URL}/getAllServices`)
      .then(r => r.json())
      .then(d => { setServices(d); setLoading(false); })
      .catch(() => setLoading(false));

    // Handle Cashfree return
    const params = new URLSearchParams(window.location.search);
    const payStatus = params.get("payment_status");
    const orderId = params.get("order_id");

    if (payStatus && orderId) {
      window.history.replaceState({}, "", window.location.pathname);
      if (payStatus === "SUCCESS" || payStatus === "PAID") {
        const pendingAddress = localStorage.getItem("pendingBookingAddress");
        const pendingServiceId = localStorage.getItem("pendingServiceId");
        const pendingAmount = localStorage.getItem("pendingAmount");
        if (pendingServiceId && customerId) {
          fetch(`${API_URL}/add-booking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId: Number(customerId),
              serviceId: Number(pendingServiceId),
              address: pendingAddress || "Hyderabad",
              status: "BOOKED",
              isVerified: false,
              amount: parseFloat(pendingAmount) || 0,
              paymentStatus: "SUCCESS"
            })
          }).then(() => {
            localStorage.removeItem("pendingBookingAddress");
            localStorage.removeItem("pendingServiceId");
            localStorage.removeItem("pendingAmount");
            showToast("🎉 Payment successful! Booking confirmed!");
            setTimeout(() => navigate("/mybookings"), 2000);
          }).catch(() => {
            showToast("Payment done! Check bookings.");
            setTimeout(() => navigate("/mybookings"), 2000);
          });
        }
      } else {
        showToast("Payment cancelled. Try again.", "error");
      }
    }
  }, []);

  const filtered = services.filter(s => {
    const matchCat = category === "All" || s.serviceName?.toLowerCase().includes(category.toLowerCase()) || s.category?.toLowerCase().includes(category.toLowerCase());
    const matchSearch = !search || s.serviceName?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-content">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>👋 Hello, {name}!</p>
          <h1 className="landing-title" style={{ fontSize: "clamp(26px,5vw,42px)", marginBottom: 8 }}>
            What service do<br />you need <span>today?</span>
          </h1>
          <div className="home-search-bar">
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              placeholder="Search plumbing, electrician, cleaning..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={() => {}}>Search</button>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="trust-strip">
        <div className="trust-strip-inner">
          {[["⚡","Quick Booking","Under 60 sec"],["✅","Verified Pros","Background checked"],["💰","Best Price","No hidden fees"],["⭐","Rated 4.8+","10k+ customers"],["🔒","Secure Pay","Cashfree secured"]].map(([icon,title,sub]) => (
            <div key={title} className="trust-item">
              <span className="trust-icon">{icon}</span>
              <div>
                <div className="trust-title">{title}</div>
                <div className="trust-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="container section">
        {/* Categories */}
        <div className="category-scroll">
          <div className="category-chips">
            {CATEGORIES.map(c => (
              <button key={c} className={"chip" + (category === c ? " active" : "")} onClick={() => setCategory(c)}>
                <span>{CATEGORY_ICONS[c]}</span>{c}
              </button>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div className="section-header" style={{ marginTop: 20 }}>
          <div className="section-title">
            {category === "All" ? "All Services" : category}
            {!loading && <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text3)", marginLeft: 8 }}>({filtered.length})</span>}
          </div>
          {search && (
            <button style={{ fontSize: 12, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => setSearch("")}>
              Clear ✕
            </button>
          )}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="services-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "white", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: 160 }} />
                <div style={{ padding: 14 }}>
                  <div className="skeleton" style={{ height: 16, marginBottom: 8, width: "70%" }} />
                  <div className="skeleton" style={{ height: 12, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 38 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No services found</div>
            <div className="empty-state-desc">Try a different search or category</div>
            <button className="btn btn-primary" onClick={() => { setSearch(""); setCategory("All"); }}>View All Services</button>
          </div>
        ) : (
          <div className="services-grid">
            {filtered.map((service, idx) => {
              const price = parseFloat(String(service.price || "0").replace(/[^0-9.]/g, "")) || 0;
              const icons = { Plumbing:"🪠", Electrician:"⚡", Cleaning:"🧹", Carpentry:"🔨", Painting:"🖌️", "AC Repair":"❄️", "Home Cleaning":"🧹" };
              const icon = Object.entries(icons).find(([k]) => service.serviceName?.toLowerCase().includes(k.toLowerCase()))?.[1] || "🛠️";
              return (
                <div key={service.serviceId} className="service-card" style={{ animationDelay: idx * 0.05 + "s" }}>
                  <div className="service-card-img">
                    {service.imageUrl ? (
                      <img src={`${API_URL}/uploads/${service.imageUrl}`} alt={service.serviceName} onError={e => e.target.style.display = "none"} />
                    ) : (
                      <span style={{ fontSize: 52 }}>{icon}</span>
                    )}
                    <div className="service-card-badge">✓ Available</div>
                  </div>
                  <div className="service-card-body">
                    <div className="service-card-name">{service.serviceName}</div>
                    <div className="service-card-desc">{service.description}</div>
                    <div className="service-card-footer">
                      <div>
                        <div className="service-card-price">₹{price}<span> /service</span></div>
                        <div className="service-card-rating">⭐ 4.8 · Today</div>
                      </div>
                    </div>
                    <button className="btn-book" onClick={() => { if (!customerId) { navigate("/customerlogin"); return; } setSelectedService(service); }}>
                      Book Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={(type) => {
            setSelectedService(null);
            if (type === "cod") {
              showToast("🎉 Booking confirmed! Pay cash after service.");
              setTimeout(() => navigate("/mybookings"), 1500);
            }
          }}
        />
      )}

      {toast && (
        <div className={"toast toast-" + toast.type}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </div>
  );
};
