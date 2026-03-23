// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { API_URL } from "../data/Api";

// const STATUS_CONFIG = {
//   BOOKED:           { label: "Booked",         color: "var(--blue)",   bg: "#EFF6FF", icon: "📅", step: 1 },
//   CONFIRMED:        { label: "Confirmed",       color: "var(--blue)",   bg: "#EFF6FF", icon: "✅", step: 2 },
//   WAITING_FOR_OTP:  { label: "OTP Required",    color: "#D97706",       bg: "#FFFBEB", icon: "🔐", step: 3 },
//   COMPLETED:        { label: "Completed",        color: "var(--green)",  bg: "var(--green-light)", icon: "🎉", step: 4 },
//   CANCELLED:        { label: "Cancelled",        color: "var(--brand)",  bg: "var(--brand-light)", icon: "✕", step: 0 },
//   PENDING:          { label: "Pending",          color: "var(--text2)",  bg: "#F5F5F5", icon: "⏳", step: 1 },
// };

// const safeStatus = (s) => {
//   if (!s || typeof s !== "string") return "PENDING";
//   return s.trim().toUpperCase();
// };

// const BookingCard = ({ booking, services, onRefresh, showToast }) => {
//   const [otp, setOtp] = useState("");
//   const [loadingOtp, setLoadingOtp] = useState(false);
//   const [loadingCancel, setLoadingCancel] = useState(false);
//   const [showRating, setShowRating] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState("");
//   const [showPayModal, setShowPayModal] = useState(false);
//   const status = safeStatus(booking.status);
//   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
//   const service = services.find(s => s.serviceId === booking.serviceId);

//   const handleCancel = async () => {
//     if (!window.confirm("Cancel this booking?")) return;
//     setLoadingCancel(true);
//     try {
//       await fetch(`${API_URL}/cancel/${booking.bookingId}`, { method: "PUT" });
//       showToast("Booking cancelled.");
//       onRefresh();
//     } catch { showToast("Cancel failed.", "error"); }
//     finally { setLoadingCancel(false); }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otp || otp.length < 4) { showToast("Enter 4-digit OTP", "error"); return; }
//     setLoadingOtp(true);
//     try {
//       const res = await fetch(`${API_URL}/verify-completion/${booking.bookingId}/${otp}`, { method: "PUT" });
//       if (res.ok) { showToast("🎉 Service completed!"); onRefresh(); setShowRating(true); }
//       else showToast("Invalid OTP.", "error");
//     } catch { showToast("OTP error.", "error"); }
//     finally { setLoadingOtp(false); }
//   };

//   const handleRate = async () => {
//     if (!rating) { showToast("Select a rating", "error"); return; }
//     try {
//       await fetch(`${API_URL}/rating/submit`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ bookingId: booking.bookingId, rating, review })
//       });
//       showToast("⭐ Thank you for rating!");
//       setShowRating(false);
//       onRefresh();
//     } catch { showToast("Rating failed.", "error"); }
//   };

//   const handleOnlinePayment = async () => {
//     try {
//       const res = await fetch(`${API_URL}/payment/initiate`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: booking.bookingId,
//           amount: booking.amount || 0,
//           paymentType: "ONLINE",
//           email: localStorage.getItem("customerEmail") || "customer@serveease.com",
//           name: localStorage.getItem("name") || "Customer",
//           phone: localStorage.getItem("customerPhone") || "9999999999"
//         })
//       });
//       const data = await res.json();
//       if (!res.ok || !data.paymentSessionId) { showToast("Payment setup failed.", "error"); return; }
//       if (!window.Cashfree) { showToast("Payment gateway loading...", "error"); return; }
//       const cashfree = window.Cashfree({ mode: "production" });
//       cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
//     } catch { showToast("Payment error.", "error"); }
//   };

//   return (
//     <div className="booking-card">
//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
//         <div style={{ flex: 1 }}>
//           <div className="booking-service-name">
//             {service?.serviceName || `Service #${booking.serviceId}`}
//           </div>
//           <div className="booking-meta">
//             <span>📅 {booking.bookingDate}</span>
//             <span>·</span>
//             <span>📍 {booking.address}</span>
//             {booking.amount > 0 && <><span>·</span><span style={{ fontWeight: 700, color: "var(--text1)" }}>₹{booking.amount}</span></>}
//           </div>
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
//           <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
//             {cfg.icon} {cfg.label}
//           </span>
//           {booking.paymentStatus && (
//             <span className="badge" style={{ background: booking.paymentStatus === "SUCCESS" ? "var(--green-light)" : booking.paymentStatus === "COD" ? "#FFFBEB" : "#F5F5F5", color: booking.paymentStatus === "SUCCESS" ? "var(--green)" : booking.paymentStatus === "COD" ? "#D97706" : "var(--text2)" }}>
//               {booking.paymentStatus === "SUCCESS" ? "💳 Paid" : booking.paymentStatus === "COD" ? "💵 COD" : "⏳ Pending"}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Progress bar for active bookings */}
//       {status !== "CANCELLED" && status !== "COMPLETED" && (
//         <div style={{ marginBottom: 12 }}>
//           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//             {["Booked","Confirmed","In Progress","Done"].map((s, i) => (
//               <div key={s} style={{ flex: 1, textAlign: i === 0 ? "left" : i === 3 ? "right" : "center" }}>
//                 <div style={{ width: 20, height: 20, borderRadius: "50%", background: cfg.step > i ? "var(--green)" : cfg.step === i + 1 ? "var(--brand)" : "var(--border)", margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700 }}>
//                   {cfg.step > i ? "✓" : i + 1}
//                 </div>
//                 <div style={{ fontSize: 9, color: cfg.step > i ? "var(--green)" : "var(--text3)", fontWeight: cfg.step === i + 1 ? 700 : 400 }}>{s}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Rating display */}
//       {status === "COMPLETED" && booking.rating && (
//         <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
//           {[1,2,3,4,5].map(i => (
//             <span key={i} style={{ color: i <= booking.rating ? "#F7C000" : "var(--border)", fontSize: 16 }}>★</span>
//           ))}
//           {booking.review && <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 4 }}>"{booking.review}"</span>}
//         </div>
//       )}

//       {/* OTP Entry */}
//       {status === "WAITING_FOR_OTP" && (
//         <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 10 }}>
//           <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 8 }}>🔐 Enter OTP to confirm completion</p>
//           <div style={{ display: "flex", gap: 8 }}>
//             <input
//               className="otp-input"
//               value={otp}
//               onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
//               placeholder="Enter OTP"
//               maxLength={6}
//               style={{ flex: 1 }}
//             />
//             <button className="btn btn-green" onClick={handleVerifyOtp} disabled={loadingOtp} style={{ flexShrink: 0 }}>
//               {loadingOtp ? <span className="loader" /> : "Verify ✓"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Rating Modal */}
//       {showRating && (
//         <div style={{ background: "var(--green-light)", border: "1px solid var(--green)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 10 }}>
//           <p style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 10 }}>⭐ Rate this service</p>
//           <div className="stars" style={{ marginBottom: 10 }}>
//             {[1,2,3,4,5].map(i => (
//               <span key={i} className="star" onClick={() => setRating(i)}
//                 style={{ color: i <= rating ? "#F7C000" : "var(--border)" }}>★</span>
//             ))}
//           </div>
//           <textarea className="review-input" value={review} onChange={e => setReview(e.target.value)}
//             placeholder="How was the service? (optional)" rows={2} style={{ marginBottom: 10 }} />
//           <div style={{ display: "flex", gap: 8 }}>
//             <button className="btn btn-green" style={{ flex: 1 }} onClick={handleRate}>Submit Rating</button>
//             <button className="btn btn-outline" onClick={() => setShowRating(false)}>Skip</button>
//           </div>
//         </div>
//       )}

//       {/* Actions */}
//       <div className="booking-actions">
//         {(status === "BOOKED" || status === "PENDING") && (
//           <button className="booking-action-btn btn-outline" onClick={handleCancel} disabled={loadingCancel}
//             style={{ color: "var(--brand)", border: "1px solid var(--brand)" }}>
//             {loadingCancel ? "Cancelling..." : "Cancel"}
//           </button>
//         )}
//         {status === "COMPLETED" && !booking.rating && !showRating && (
//           <button className="booking-action-btn" onClick={() => setShowRating(true)}
//             style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FCD34D" }}>
//             ⭐ Rate Service
//           </button>
//         )}
//         {(status === "BOOKED" || status === "PENDING") && !booking.paymentStatus && (
//           <button className="booking-action-btn" onClick={handleOnlinePayment}
//             style={{ background: "var(--blue)", color: "white" }}>
//             💳 Pay Online
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export const MyBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState("active");
//   const [toast, setToast] = useState(null);
//   const navigate = useNavigate();
//   const customerId = localStorage.getItem("customerId");
//   const wsRef = useRef(null);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const fetchBookings = async () => {
//     try {
//       const [bRes, sRes] = await Promise.all([
//         fetch(`${API_URL}/getBookings/customer/${customerId}`),
//         fetch(`${API_URL}/getAllServices`)
//       ]);
//       const [b, s] = await Promise.all([bRes.json(), sRes.json()]);
//       setBookings(Array.isArray(b) ? b : []);
//       setServices(Array.isArray(s) ? s : []);
//     } catch (e) { console.log(e); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => {
//     fetchBookings();
//     // Poll every 15 seconds for realtime updates
//     const interval = setInterval(fetchBookings, 15000);
//     return () => clearInterval(interval);
//   }, []);

//   // Handle payment return
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const payStatus = params.get("payment_status");
//     const orderId = params.get("order_id");
//     if (payStatus && orderId) {
//       window.history.replaceState({}, "", window.location.pathname);
//       if (payStatus === "SUCCESS" || payStatus === "PAID") {
//         showToast("🎉 Payment successful!");
//         fetchBookings();
//       } else {
//         showToast("Payment was not completed.", "error");
//       }
//     }
//   }, []);

//   const activeBookings = bookings.filter(b => !["COMPLETED","CANCELLED"].includes(safeStatus(b.status)));
//   const pastBookings = bookings.filter(b => ["COMPLETED","CANCELLED"].includes(safeStatus(b.status)));
//   const displayed = tab === "active" ? activeBookings : pastBookings;

//   return (
//     <div className="page">
//       {/* Header */}
//       <div style={{ background: "white", padding: "16px", borderBottom: "1px solid var(--border)", position: "sticky", top: 60, zIndex: 50 }}>
//         <div className="container">
//           <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>My Bookings</h1>
//           <div className="booking-tabs">
//             <button className={"booking-tab" + (tab === "active" ? " active" : "")} onClick={() => setTab("active")}>
//               Active {activeBookings.length > 0 && <span style={{ background: "var(--brand)", color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 50, marginLeft: 4 }}>{activeBookings.length}</span>}
//             </button>
//             <button className={"booking-tab" + (tab === "past" ? " active" : "")} onClick={() => setTab("past")}>
//               Past ({pastBookings.length})
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="container section">
//         {loading ? (
//           <div>
//             {[1,2,3].map(i => (
//               <div key={i} style={{ background: "white", borderRadius: "var(--radius)", padding: 16, marginBottom: 12 }}>
//                 <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
//                 <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 12 }} />
//                 <div className="skeleton" style={{ height: 36 }} />
//               </div>
//             ))}
//           </div>
//         ) : displayed.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-state-icon">{tab === "active" ? "📋" : "🗂️"}</div>
//             <div className="empty-state-title">{tab === "active" ? "No active bookings" : "No past bookings"}</div>
//             <div className="empty-state-desc">{tab === "active" ? "Book a service to get started!" : "Your completed bookings will appear here."}</div>
//             {tab === "active" && <button className="btn btn-primary" onClick={() => navigate("/home")}>Browse Services →</button>}
//           </div>
//         ) : (
//           displayed.map((b, i) => (
//             <div key={b.bookingId} style={{ animationDelay: i * 0.05 + "s" }}>
//               <BookingCard booking={b} services={services} onRefresh={fetchBookings} showToast={showToast} />
//             </div>
//           ))
//         )}
//       </div>

//       {toast && <div className={"toast toast-" + toast.type}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}
//     </div>
//   );
// };



// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { API_URL } from "../data/Api";

// const STATUS_CONFIG = {
//   BOOKED:          { label: "Booked",       color: "var(--blue)",  bg: "#EFF6FF", icon: "📅", step: 1 },
//   CONFIRMED:       { label: "Confirmed",    color: "var(--blue)",  bg: "#EFF6FF", icon: "✅", step: 2 },
//   WAITING_FOR_OTP: { label: "In Progress",  color: "#D97706",      bg: "#FFFBEB", icon: "🔐", step: 3 },
//   COMPLETED:       { label: "Completed",    color: "var(--green)", bg: "var(--green-light)", icon: "🎉", step: 4 },
//   CANCELLED:       { label: "Cancelled",    color: "var(--brand)", bg: "var(--brand-light)", icon: "✕",  step: 0 },
//   PENDING:         { label: "Pending",      color: "var(--text2)", bg: "#F5F5F5", icon: "⏳", step: 1 },
// };

// const safeStatus = (s) => {
//   if (!s || typeof s !== "string") return "PENDING";
//   return s.trim().toUpperCase();
// };

// // Simple Live Tracking Map using iframe (no leaflet dependency issue)
// const LiveMap = ({ providerId }) => {
//   const canvasRef = useRef(null);
//   const wsRef = useRef(null);
//   const [location, setLocation] = useState(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     if (!providerId) return;
//     try {
//       const wsUrl = API_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws-location";
//       wsRef.current = new WebSocket(wsUrl);
//       wsRef.current.onopen = () => setConnected(true);
//       wsRef.current.onmessage = (e) => {
//         try {
//           const data = JSON.parse(e.data);
//           if (data.providerId === providerId || String(data.providerId) === String(providerId)) {
//             setLocation({ lat: data.lat, lng: data.lng });
//           }
//         } catch {}
//       };
//       wsRef.current.onclose = () => setConnected(false);
//     } catch {}
//     return () => { if (wsRef.current) wsRef.current.close(); };
//   }, [providerId]);

//   return (
//     <div style={{ background: "#1C1C1C", borderRadius: 12, padding: 14, marginBottom: 12 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
//         <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>📍 Provider Location</span>
//         <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: connected ? "var(--green)" : "#999" }}>
//           <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "var(--green)" : "#999", display: "inline-block" }} />
//           {connected ? "Live" : "Connecting..."}
//         </span>
//       </div>
//       {location ? (
//         <div>
//           <div style={{ background: "#2A2A2A", borderRadius: 8, padding: "12px", marginBottom: 8, textAlign: "center" }}>
//             <div style={{ fontSize: 32, marginBottom: 4 }}>🧑‍🔧</div>
//             <div style={{ color: "white", fontSize: 12, fontWeight: 600 }}>Provider is on the way!</div>
//             <div style={{ color: "#999", fontSize: 11, marginTop: 4 }}>
//               Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
//             </div>
//           </div>
//           <a
//             href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
//             target="_blank"
//             rel="noreferrer"
//             style={{ display: "block", background: "var(--green)", color: "white", borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 12, fontWeight: 700, textDecoration: "none" }}
//           >
//             🗺️ View on Google Maps →
//           </a>
//         </div>
//       ) : (
//         <div style={{ color: "#999", fontSize: 12, textAlign: "center", padding: "20px 0" }}>
//           {connected ? "⏳ Waiting for provider to share location..." : "🔌 Connecting to live tracking..."}
//         </div>
//       )}
//     </div>
//   );
// };

// const BookingCard = ({ booking, services, onRefresh, showToast }) => {
//   const [loadingCancel, setLoadingCancel] = useState(false);
//   const [showRating, setShowRating] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState("");
//   const status = safeStatus(booking.status);
//   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
//   const service = services.find(s => s.serviceId === booking.serviceId);

//   const handleCancel = async () => {
//     if (!window.confirm("Cancel this booking?")) return;
//     setLoadingCancel(true);
//     try {
//       await fetch(`${API_URL}/cancel/${booking.bookingId}`, { method: "PUT" });
//       showToast("Booking cancelled.");
//       onRefresh();
//     } catch { showToast("Cancel failed.", "error"); }
//     finally { setLoadingCancel(false); }
//   };

//   const handleRate = async () => {
//     if (!rating) { showToast("Select a rating", "error"); return; }
//     try {
//       await fetch(`${API_URL}/rating/submit`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ bookingId: booking.bookingId, rating, review })
//       });
//       showToast("⭐ Thank you for rating!");
//       setShowRating(false);
//       onRefresh();
//     } catch { showToast("Rating failed.", "error"); }
//   };

//   const handleOnlinePayment = async () => {
//     try {
//       const res = await fetch(`${API_URL}/payment/initiate`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookingId: booking.bookingId,
//           amount: booking.amount || 0,
//           paymentType: "ONLINE",
//           email: localStorage.getItem("customerEmail") || "customer@serveease.com",
//           name: localStorage.getItem("name") || "Customer",
//           phone: localStorage.getItem("customerPhone") || "9999999999"
//         })
//       });
//       const data = await res.json();
//       if (!res.ok || !data.paymentSessionId) { showToast("Payment setup failed.", "error"); return; }
//       if (!window.Cashfree) { showToast("Payment gateway loading...", "error"); return; }
//       const cashfree = window.Cashfree({ mode: "production" });
//       cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
//     } catch { showToast("Payment error.", "error"); }
//   };

//   return (
//     <div className="booking-card">
//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
//         <div style={{ flex: 1 }}>
//           <div className="booking-service-name">
//             {service?.serviceName || `Service #${booking.serviceId}`}
//           </div>
//           <div className="booking-meta">
//             <span>📅 {booking.bookingDate}</span>
//             <span>·</span>
//             <span>📍 {booking.address}</span>
//             {booking.amount > 0 && <><span>·</span><span style={{ fontWeight: 700, color: "var(--text1)" }}>₹{booking.amount}</span></>}
//           </div>
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
//           <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
//             {cfg.icon} {cfg.label}
//           </span>
//           {booking.paymentStatus && (
//             <span className="badge" style={{
//               background: booking.paymentStatus === "SUCCESS" ? "var(--green-light)" : booking.paymentStatus === "COD" ? "#FFFBEB" : "#F5F5F5",
//               color: booking.paymentStatus === "SUCCESS" ? "var(--green)" : booking.paymentStatus === "COD" ? "#D97706" : "var(--text2)"
//             }}>
//               {booking.paymentStatus === "SUCCESS" ? "💳 Paid" : booking.paymentStatus === "COD" ? "💵 COD" : "⏳ Pending"}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Progress steps */}
//       {status !== "CANCELLED" && status !== "COMPLETED" && (
//         <div style={{ display: "flex", alignItems: "center", marginBottom: 14, gap: 0 }}>
//           {["Booked", "Confirmed", "In Progress", "Done"].map((s, i) => (
//             <React.Fragment key={s}>
//               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
//                 <div style={{
//                   width: 24, height: 24, borderRadius: "50%",
//                   background: cfg.step > i ? "var(--green)" : cfg.step === i + 1 ? "var(--brand)" : "var(--border)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   fontSize: 10, color: "white", fontWeight: 800, marginBottom: 4
//                 }}>
//                   {cfg.step > i ? "✓" : i + 1}
//                 </div>
//                 <div style={{ fontSize: 9, color: cfg.step > i ? "var(--green)" : "var(--text3)", textAlign: "center", fontWeight: cfg.step === i + 1 ? 700 : 400 }}>{s}</div>
//               </div>
//               {i < 3 && <div style={{ flex: 2, height: 2, background: cfg.step > i + 1 ? "var(--green)" : "var(--border)", marginBottom: 14 }} />}
//             </React.Fragment>
//           ))}
//         </div>
//       )}

//       {/* ✅ Live tracking when CONFIRMED or WAITING_FOR_OTP */}
//       {(status === "CONFIRMED" || status === "WAITING_FOR_OTP") && booking.providerId && (
//         <LiveMap providerId={booking.providerId} />
//       )}

//       {/* ✅ Customer sees OTP - BIG and clear */}
//       {status === "WAITING_FOR_OTP" && (
//         <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
//           <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 10, textAlign: "center" }}>
//             🔐 Show this OTP to your provider
//           </p>
//           <div style={{
//             fontSize: 42, fontWeight: 900, letterSpacing: 12, color: "#D97706",
//             textAlign: "center", fontFamily: "monospace", background: "white",
//             borderRadius: 10, padding: "16px 0", border: "2px dashed #FCD34D",
//             marginBottom: 8
//           }}>
//             {booking.otp || "Loading..."}
//           </div>
//           <p style={{ fontSize: 11, color: "#92400E", textAlign: "center" }}>
//             Provider will enter this code to mark service as complete
//           </p>
//         </div>
//       )}

//       {/* Rating stars */}
//       {status === "COMPLETED" && booking.rating && (
//         <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
//           {[1,2,3,4,5].map(i => (
//             <span key={i} style={{ color: i <= booking.rating ? "#F7C000" : "var(--border)", fontSize: 16 }}>★</span>
//           ))}
//           {booking.review && <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 4 }}>"{booking.review}"</span>}
//         </div>
//       )}

//       {/* Rate modal */}
//       {showRating && (
//         <div style={{ background: "var(--green-light)", border: "1px solid var(--green)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
//           <p style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 10 }}>⭐ How was the service?</p>
//           <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
//             {[1,2,3,4,5].map(i => (
//               <span key={i} onClick={() => setRating(i)}
//                 style={{ fontSize: 28, cursor: "pointer", color: i <= rating ? "#F7C000" : "var(--border)", transition: "transform 0.1s" }}>★</span>
//             ))}
//           </div>
//           <textarea
//             style={{ width: "100%", padding: 10, border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font)", resize: "none", outline: "none", marginBottom: 10 }}
//             value={review} onChange={e => setReview(e.target.value)}
//             placeholder="How was the service? (optional)" rows={2}
//           />
//           <div style={{ display: "flex", gap: 8 }}>
//             <button className="btn btn-green" style={{ flex: 1 }} onClick={handleRate}>Submit ⭐</button>
//             <button className="btn btn-outline" onClick={() => setShowRating(false)}>Skip</button>
//           </div>
//         </div>
//       )}

//       {/* Actions */}
//       <div className="booking-actions">
//         {(status === "BOOKED" || status === "PENDING") && (
//           <button className="booking-action-btn" onClick={handleCancel} disabled={loadingCancel}
//             style={{ color: "var(--brand)", border: "1px solid var(--brand)", borderRadius: 8, background: "var(--brand-light)" }}>
//             {loadingCancel ? "Cancelling..." : "Cancel Booking"}
//           </button>
//         )}
//         {status === "COMPLETED" && !booking.rating && !showRating && (
//           <button className="booking-action-btn" onClick={() => setShowRating(true)}
//             style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FCD34D", borderRadius: 8 }}>
//             ⭐ Rate Service
//           </button>
//         )}
//         {(status === "BOOKED" || status === "PENDING") && !booking.paymentStatus && (
//           <button className="booking-action-btn" onClick={handleOnlinePayment}
//             style={{ background: "var(--blue)", color: "white", borderRadius: 8 }}>
//             💳 Pay Online
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export const MyBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState("active");
//   const [toast, setToast] = useState(null);
//   const navigate = useNavigate();
//   const customerId = localStorage.getItem("customerId");

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const fetchBookings = async () => {
//     try {
//       const [bRes, sRes] = await Promise.all([
//         fetch(`${API_URL}/getBookings/customer/${customerId}`),
//         fetch(`${API_URL}/getAllServices`)
//       ]);
//       const [b, s] = await Promise.all([bRes.json(), sRes.json()]);
//       setBookings(Array.isArray(b) ? b : []);
//       setServices(Array.isArray(s) ? s : []);
//     } catch {}
//     finally { setLoading(false); }
//   };

//   useEffect(() => {
//     fetchBookings();
//     // Poll every 8 seconds for OTP and status updates
//     const interval = setInterval(fetchBookings, 8000);
//     return () => clearInterval(interval);
//   }, []);

//   // Handle payment return
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const payStatus = params.get("payment_status");
//     const orderId = params.get("order_id");
//     if (payStatus && orderId) {
//       window.history.replaceState({}, "", window.location.pathname);
//       if (payStatus === "SUCCESS" || payStatus === "PAID") {
//         showToast("🎉 Payment successful!");
//         fetchBookings();
//       } else {
//         showToast("Payment was not completed.", "error");
//       }
//     }
//   }, []);

//   const activeBookings = bookings.filter(b => !["COMPLETED", "CANCELLED"].includes(safeStatus(b.status)));
//   const pastBookings = bookings.filter(b => ["COMPLETED", "CANCELLED"].includes(safeStatus(b.status)));
//   const displayed = tab === "active" ? activeBookings : pastBookings;

//   return (
//     <div className="page">
//       <div style={{ background: "white", padding: "16px", borderBottom: "1px solid var(--border)", position: "sticky", top: 60, zIndex: 50 }}>
//         <div className="container">
//           <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>My Bookings</h1>
//           <div className="booking-tabs">
//             <button className={"booking-tab" + (tab === "active" ? " active" : "")} onClick={() => setTab("active")}>
//               Active
//               {activeBookings.length > 0 && (
//                 <span style={{ background: "var(--brand)", color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 50, marginLeft: 4 }}>
//                   {activeBookings.length}
//                 </span>
//               )}
//             </button>
//             <button className={"booking-tab" + (tab === "past" ? " active" : "")} onClick={() => setTab("past")}>
//               Past ({pastBookings.length})
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="container section">
//         {loading ? (
//           <div>{[1,2,3].map(i => (
//             <div key={i} style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 12 }}>
//               <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
//               <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 12 }} />
//               <div className="skeleton" style={{ height: 36 }} />
//             </div>
//           ))}</div>
//         ) : displayed.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-state-icon">{tab === "active" ? "📋" : "🗂️"}</div>
//             <div className="empty-state-title">{tab === "active" ? "No active bookings" : "No past bookings"}</div>
//             <div className="empty-state-desc">{tab === "active" ? "Book a service to get started!" : "Completed bookings appear here."}</div>
//             {tab === "active" && <button className="btn btn-primary" onClick={() => navigate("/home")}>Browse Services →</button>}
//           </div>
//         ) : (
//           displayed.map((b, i) => (
//             <div key={b.bookingId} style={{ animationDelay: i * 0.05 + "s" }}>
//               <BookingCard booking={b} services={services} onRefresh={fetchBookings} showToast={showToast} />
//             </div>
//           ))
//         )}
//       </div>

//       {toast && <div className={"toast toast-" + toast.type}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}
//     </div>
//   );
// };
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../data/Api";

const STATUS_CONFIG = {
  BOOKED:          { label: "Booked",       color: "var(--blue)",  bg: "#EFF6FF", icon: "📅", step: 1 },
  CONFIRMED:       { label: "Confirmed",    color: "var(--blue)",  bg: "#EFF6FF", icon: "✅", step: 2 },
  WAITING_FOR_OTP: { label: "In Progress",  color: "#D97706",      bg: "#FFFBEB", icon: "🔐", step: 3 },
  COMPLETED:       { label: "Completed",    color: "var(--green)", bg: "var(--green-light)", icon: "🎉", step: 4 },
  CANCELLED:       { label: "Cancelled",    color: "var(--brand)", bg: "var(--brand-light)", icon: "✕",  step: 0 },
  PENDING:         { label: "Pending",      color: "var(--text2)", bg: "#F5F5F5", icon: "⏳", step: 1 },
};

const safeStatus = (s) => {
  if (!s || typeof s !== "string") return "PENDING";
  return s.trim().toUpperCase();
};

// Live Tracking Map
const LiveMap = ({ providerId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const wsRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [connected, setConnected] = useState(false);
  const [show, setShow] = useState(true);

  // Init map after render
  useEffect(() => {
    if (show) setTimeout(initMap, 200);
  }, [show]);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([17.385, 78.4867], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);
    mapInstanceRef.current = map;
  };

  // Update marker
  useEffect(() => {
    if (!location || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const { lat, lng } = location;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        html: `<div style="background:#E23744;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🧑‍🔧</div>`,
        className: "", iconSize: [40, 40], iconAnchor: [20, 20]
      });
      markerRef.current = L.marker([lat, lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup("Your service provider").openPopup();
    }
    mapInstanceRef.current.setView([lat, lng], 15);
  }, [location]);

  // ✅ STOMP to receive provider location
  useEffect(() => {
    const loadScript = (src, id) => new Promise((res) => {
      if (document.getElementById(id)) { res(); return; }
      const s = document.createElement("script");
      s.src = src; s.id = id; s.onload = res;
      document.head.appendChild(s);
    });

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js", "sockjs-script"),
      loadScript("https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js", "stomp-script")
    ]).then(() => {
      try {
        const wsUrl = API_URL.replace("https://", "http://").replace("http://", "http://") + "/ws-location-sockjs";
        const socket = new window.SockJS(wsUrl);
        const stomp = window.Stomp.over(socket);
        stomp.debug = null;
        stomp.connect({}, () => {
          setConnected(true);
          wsRef.current = stomp;
          stomp.subscribe("/topic/location", (msg) => {
            try {
              const d = JSON.parse(msg.body);
              if (String(d.providerId) === String(providerId)) {
                setLocation({ lat: d.latitude, lng: d.longitude });
              }
            } catch {}
          });
        }, () => setConnected(false));
      } catch {}
    });

    return () => {
      if (wsRef.current?.connected) wsRef.current.disconnect();
    };
  }, [providerId]);

  // Cleanup map
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  if (!show) return (
    <button onClick={() => setShow(true)} style={{ width: "100%", padding: 10, background: "#EFF6FF", border: "1px solid var(--blue)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--blue)", cursor: "pointer", marginBottom: 10 }}>
      📍 Track Provider Location
    </button>
  );

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 12, border: "1px solid var(--border)", background: "#0F172A" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>📍 Live Tracking</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11,
            background: connected ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
            color: connected ? "#34D399" : "#94A3B8", padding: "2px 8px", borderRadius: 50 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "#34D399" : "#555", display: "inline-block" }} />
            {connected ? (location ? "🟢 Live" : "Waiting...") : "Offline"}
          </span>
        </div>
        <button onClick={() => setShow(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>

      {/* Map container */}
      <div ref={mapRef} style={{ height: 220, width: "100%" }} />

      {/* Footer */}
      <div style={{ padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1E293B" }}>
        <span style={{ fontSize: 11, color: "#94A3B8" }}>
          {location ? `📡 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Provider hasn't shared location yet"}
        </span>
        {location && (
          <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noreferrer"
            style={{ background: "var(--green)", color: "white", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
            🗺️ Google Maps
          </a>
        )}
      </div>
    </div>
  );
};



const BookingCard = ({ booking, services, onRefresh, showToast }) => {
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const status = safeStatus(booking.status);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const service = services.find(s => s.serviceId === booking.serviceId);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking?")) return;
    setLoadingCancel(true);
    try {
      await fetch(`${API_URL}/cancel/${booking.bookingId}`, { method: "PUT" });
      showToast("Booking cancelled.");
      onRefresh();
    } catch { showToast("Cancel failed.", "error"); }
    finally { setLoadingCancel(false); }
  };

  const handleRate = async () => {
    if (!rating) { showToast("Select a rating", "error"); return; }
    try {
      await fetch(`${API_URL}/rating/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.bookingId, rating, review })
      });
      showToast("⭐ Thank you for rating!");
      setShowRating(false);
      onRefresh();
    } catch { showToast("Rating failed.", "error"); }
  };

  const handleOnlinePayment = async () => {
    try {
      const res = await fetch(`${API_URL}/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          amount: booking.amount || 0,
          paymentType: "ONLINE",
          email: localStorage.getItem("customerEmail") || "customer@serveease.com",
          name: localStorage.getItem("name") || "Customer",
          phone: localStorage.getItem("customerPhone") || "9999999999"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.paymentSessionId) { showToast("Payment setup failed.", "error"); return; }
      if (!window.Cashfree) { showToast("Payment gateway loading...", "error"); return; }
      const cashfree = window.Cashfree({ mode: "production" });
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
    } catch { showToast("Payment error.", "error"); }
  };

  return (
    <div className="booking-card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div className="booking-service-name">
            {service?.serviceName || `Service #${booking.serviceId}`}
          </div>
          <div className="booking-meta">
            <span>📅 {booking.bookingDate}</span>
            <span>·</span>
            <span>📍 {booking.address}</span>
            {booking.amount > 0 && <><span>·</span><span style={{ fontWeight: 700, color: "var(--text1)" }}>₹{booking.amount}</span></>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </span>
          {booking.paymentStatus && (
            <span className="badge" style={{
              background: booking.paymentStatus === "SUCCESS" ? "var(--green-light)" : booking.paymentStatus === "COD" ? "#FFFBEB" : "#F5F5F5",
              color: booking.paymentStatus === "SUCCESS" ? "var(--green)" : booking.paymentStatus === "COD" ? "#D97706" : "var(--text2)"
            }}>
              {booking.paymentStatus === "SUCCESS" ? "💳 Paid" : booking.paymentStatus === "COD" ? "💵 COD" : "⏳ Pending"}
            </span>
          )}
        </div>
      </div>

      {/* Progress steps */}
      {status !== "CANCELLED" && status !== "COMPLETED" && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14, gap: 0 }}>
          {["Booked", "Confirmed", "In Progress", "Done"].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: cfg.step > i ? "var(--green)" : cfg.step === i + 1 ? "var(--brand)" : "var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "white", fontWeight: 800, marginBottom: 4
                }}>
                  {cfg.step > i ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 9, color: cfg.step > i ? "var(--green)" : "var(--text3)", textAlign: "center", fontWeight: cfg.step === i + 1 ? 700 : 400 }}>{s}</div>
              </div>
              {i < 3 && <div style={{ flex: 2, height: 2, background: cfg.step > i + 1 ? "var(--green)" : "var(--border)", marginBottom: 14 }} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ✅ Live tracking - show for any active booking */}
      {(status === "CONFIRMED" || status === "WAITING_FOR_OTP" || status === "BOOKED") && (
        <LiveMap providerId={booking.providerId} bookingId={booking.bookingId} />
      )}

      {/* ✅ Customer sees OTP - BIG and clear */}
      {status === "WAITING_FOR_OTP" && (
        <div style={{ background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 10, textAlign: "center" }}>
            🔐 Show this OTP to your provider
          </p>
          <div style={{
            fontSize: 42, fontWeight: 900, letterSpacing: 12, color: "#D97706",
            textAlign: "center", fontFamily: "monospace", background: "white",
            borderRadius: 10, padding: "16px 0", border: "2px dashed #FCD34D",
            marginBottom: 8
          }}>
            {booking.otp || "Loading..."}
          </div>
          <p style={{ fontSize: 11, color: "#92400E", textAlign: "center" }}>
            Provider will enter this code to mark service as complete
          </p>
        </div>
      )}

      {/* Rating stars */}
      {status === "COMPLETED" && booking.rating && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ color: i <= booking.rating ? "#F7C000" : "var(--border)", fontSize: 16 }}>★</span>
          ))}
          {booking.review && <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 4 }}>"{booking.review}"</span>}
        </div>
      )}

      {/* Rate modal */}
      {showRating && (
        <div style={{ background: "var(--green-light)", border: "1px solid var(--green)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 10 }}>⭐ How was the service?</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} onClick={() => setRating(i)}
                style={{ fontSize: 28, cursor: "pointer", color: i <= rating ? "#F7C000" : "var(--border)", transition: "transform 0.1s" }}>★</span>
            ))}
          </div>
          <textarea
            style={{ width: "100%", padding: 10, border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "var(--font)", resize: "none", outline: "none", marginBottom: 10 }}
            value={review} onChange={e => setReview(e.target.value)}
            placeholder="How was the service? (optional)" rows={2}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-green" style={{ flex: 1 }} onClick={handleRate}>Submit ⭐</button>
            <button className="btn btn-outline" onClick={() => setShowRating(false)}>Skip</button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="booking-actions">
        {(status === "BOOKED" || status === "PENDING") && (
          <button className="booking-action-btn" onClick={handleCancel} disabled={loadingCancel}
            style={{ color: "var(--brand)", border: "1px solid var(--brand)", borderRadius: 8, background: "var(--brand-light)" }}>
            {loadingCancel ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}
        {status === "COMPLETED" && !booking.rating && !showRating && (
          <button className="booking-action-btn" onClick={() => setShowRating(true)}
            style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FCD34D", borderRadius: 8 }}>
            ⭐ Rate Service
          </button>
        )}
        {(status === "BOOKED" || status === "PENDING") && !booking.paymentStatus && (
          <button className="booking-action-btn" onClick={handleOnlinePayment}
            style={{ background: "var(--blue)", color: "white", borderRadius: 8 }}>
            💳 Pay Online
          </button>
        )}
      </div>
    </div>
  );
};

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const customerId = localStorage.getItem("customerId");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        fetch(`${API_URL}/getBookings/customer/${customerId}`),
        fetch(`${API_URL}/getAllServices`)
      ]);
      const [b, s] = await Promise.all([bRes.json(), sRes.json()]);
      setBookings(Array.isArray(b) ? b : []);
      setServices(Array.isArray(s) ? s : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBookings();
    // Poll every 8 seconds for OTP and status updates
    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payStatus = params.get("payment_status");
    const orderId = params.get("order_id");
    if (payStatus && orderId) {
      window.history.replaceState({}, "", window.location.pathname);
      if (payStatus === "SUCCESS" || payStatus === "PAID") {
        showToast("🎉 Payment successful!");
        fetchBookings();
      } else {
        showToast("Payment was not completed.", "error");
      }
    }
  }, []);

  const activeBookings = bookings.filter(b => !["COMPLETED", "CANCELLED"].includes(safeStatus(b.status)));
  const pastBookings = bookings.filter(b => ["COMPLETED", "CANCELLED"].includes(safeStatus(b.status)));
  const displayed = tab === "active" ? activeBookings : pastBookings;

  return (
    <div className="page">
      <div style={{ background: "white", padding: "16px", borderBottom: "1px solid var(--border)", position: "sticky", top: 60, zIndex: 50 }}>
        <div className="container">
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>My Bookings</h1>
          <div className="booking-tabs">
            <button className={"booking-tab" + (tab === "active" ? " active" : "")} onClick={() => setTab("active")}>
              Active
              {activeBookings.length > 0 && (
                <span style={{ background: "var(--brand)", color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 50, marginLeft: 4 }}>
                  {activeBookings.length}
                </span>
              )}
            </button>
            <button className={"booking-tab" + (tab === "past" ? " active" : "")} onClick={() => setTab("past")}>
              Past ({pastBookings.length})
            </button>
          </div>
        </div>
      </div>

      <div className="container section">
        {loading ? (
          <div>{[1,2,3].map(i => (
            <div key={i} style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 36 }} />
            </div>
          ))}</div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">{tab === "active" ? "📋" : "🗂️"}</div>
            <div className="empty-state-title">{tab === "active" ? "No active bookings" : "No past bookings"}</div>
            <div className="empty-state-desc">{tab === "active" ? "Book a service to get started!" : "Completed bookings appear here."}</div>
            {tab === "active" && <button className="btn btn-primary" onClick={() => navigate("/home")}>Browse Services →</button>}
          </div>
        ) : (
          displayed.map((b, i) => (
            <div key={b.bookingId} style={{ animationDelay: i * 0.05 + "s" }}>
              <BookingCard booking={b} services={services} onRefresh={fetchBookings} showToast={showToast} />
            </div>
          ))
        )}
      </div>

      {toast && <div className={"toast toast-" + toast.type}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}
    </div>
  );
};
