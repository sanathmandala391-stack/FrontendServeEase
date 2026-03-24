// import React, { useEffect, useState, useRef } from "react";
// import { API_URL } from "../data/Api";

// const safeStatus = (s) => {
//   if (!s || typeof s !== "string") return "PENDING";
//   return s.trim().toUpperCase();
// };

// export const ProviderBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState(null);
//   const [tab, setTab] = useState("active");
//   const [sharingLocation, setSharingLocation] = useState(false);
//   const wsRef = useRef(null);
//   const locationRef = useRef(null);
//   const providerId = Number(localStorage.getItem("providerId"));

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const fetchBookings = async () => {
//     try {
//       // ✅ Fetch ALL bookings — show unassigned + assigned to this provider
//       const res = await fetch(`${API_URL}/getAll-Bookings`);
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         // Show bookings assigned to this provider OR unassigned (null/0)
//         const mine = data.filter(b =>
//           b.providerId === providerId ||
//           !b.providerId ||
//           b.providerId === 0
//         );
//         setBookings(mine);
//       }
//     } catch (e) { console.log(e); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => {
//     fetchBookings();
//     const interval = setInterval(fetchBookings, 10000); // poll every 10s
//     return () => clearInterval(interval);
//   }, []);

//   const startLocationSharing = () => {
//     if (!navigator.geolocation) { showToast("GPS not available", "error"); return; }
//     try {
//       const wsUrl = API_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws-location";
//       wsRef.current = new WebSocket(wsUrl);
//       wsRef.current.onopen = () => {
//         setSharingLocation(true);
//         showToast("📍 Location sharing started");
//         locationRef.current = navigator.geolocation.watchPosition((pos) => {
//           if (wsRef.current?.readyState === 1) {
//             wsRef.current.send(JSON.stringify({
//               providerId,
//               lat: pos.coords.latitude,
//               lng: pos.coords.longitude
//             }));
//           }
//         }, null, { enableHighAccuracy: true, maximumAge: 5000 });
//       };
//       wsRef.current.onerror = () => showToast("Location sharing unavailable", "error");
//     } catch { showToast("WebSocket error", "error"); }
//   };

//   const stopLocationSharing = () => {
//     if (locationRef.current) navigator.geolocation.clearWatch(locationRef.current);
//     if (wsRef.current) wsRef.current.close();
//     setSharingLocation(false);
//     showToast("Location sharing stopped");
//   };

//   const handleAccept = async (bookingId) => {
//     try {
//       const res = await fetch(`${API_URL}/update/${bookingId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: "CONFIRMED" })
//       });
//       if (res.ok) { showToast("✅ Booking accepted!"); fetchBookings(); }
//       else showToast("Failed to accept.", "error");
//     } catch { showToast("Error", "error"); }
//   };

//   const handleRequestCompletion = async (bookingId) => {
//     try {
//       const res = await fetch(`${API_URL}/request-completion/${bookingId}`, { method: "PUT" });
//       if (res.ok) {
//         const text = await res.text();
//         const otp = text.match(/\d{4,6}/)?.[0];
//         showToast(`OTP sent to customer${otp ? ": " + otp : ""}!`);
//         fetchBookings();
//       } else showToast("Failed.", "error");
//     } catch { showToast("Error", "error"); }
//   };

//   const active = bookings.filter(b => !["COMPLETED", "CANCELLED"].includes(safeStatus(b.status)));
//   const past = bookings.filter(b => ["COMPLETED", "CANCELLED"].includes(safeStatus(b.status)));
//   const displayed = tab === "active" ? active : past;

//   return (
//     <div className="page">
//       {/* Header */}
//       <div style={{ background: "white", padding: "16px", borderBottom: "1px solid var(--border)", position: "sticky", top: 60, zIndex: 50 }}>
//         <div className="container">
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//             <h1 style={{ fontSize: 20, fontWeight: 800 }}>Bookings</h1>
//             <button
//               className={"btn " + (sharingLocation ? "btn-outline" : "btn-green")}
//               style={{ fontSize: 12, padding: "8px 14px" }}
//               onClick={sharingLocation ? stopLocationSharing : startLocationSharing}
//             >
//               {sharingLocation ? "⏹ Stop" : "📍 Share Location"}
//             </button>
//           </div>
//           <div className="booking-tabs">
//             <button className={"booking-tab" + (tab === "active" ? " active" : "")} onClick={() => setTab("active")}>
//               Active
//               {active.length > 0 && (
//                 <span style={{ background: "var(--brand)", color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 50, marginLeft: 4 }}>
//                   {active.length}
//                 </span>
//               )}
//             </button>
//             <button className={"booking-tab" + (tab === "past" ? " active" : "")} onClick={() => setTab("past")}>
//               Completed ({past.length})
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="container section">
//         {/* Live indicator */}
//         {sharingLocation && (
//           <div style={{ background: "var(--green-light)", border: "1px solid var(--green)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--green)", fontWeight: 600 }}>
//             <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "ping 1s infinite", display: "inline-block" }} />
//             Live location sharing active
//           </div>
//         )}

//         {loading ? (
//           <div>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, marginBottom: 12, borderRadius: 16 }} />)}</div>
//         ) : displayed.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-state-icon">📋</div>
//             <div className="empty-state-title">No {tab} bookings</div>
//             <div className="empty-state-desc">New bookings will appear here automatically</div>
//           </div>
//         ) : (
//           displayed.map((b, i) => {
//             const status = safeStatus(b.status);
//             return (
//               <div key={b.bookingId} className="booking-card" style={{ animationDelay: i * 0.05 + "s" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
//                   <div style={{ flex: 1 }}>
//                     <div className="booking-service-name">
//                       Booking #{b.bookingId} · Service #{b.serviceId}
//                     </div>
//                     <div className="booking-meta">
//                       <span>👤 Customer #{b.customerId}</span>
//                       <span>·</span>
//                       <span>📅 {b.bookingDate}</span>
//                       <span>·</span>
//                       <span>📍 {b.address}</span>
//                       {b.amount > 0 && (
//                         <><span>·</span><span style={{ fontWeight: 700, color: "var(--green)" }}>₹{b.amount}</span></>
//                       )}
//                     </div>
//                     {b.paymentStatus && (
//                       <span className="badge" style={{
//                         marginTop: 4,
//                         background: b.paymentStatus === "SUCCESS" ? "var(--green-light)" : b.paymentStatus === "COD" ? "#FFFBEB" : "#F5F5F5",
//                         color: b.paymentStatus === "SUCCESS" ? "var(--green)" : b.paymentStatus === "COD" ? "#D97706" : "var(--text2)"
//                       }}>
//                         {b.paymentStatus === "SUCCESS" ? "💳 Paid Online" : b.paymentStatus === "COD" ? "💵 Cash on Delivery" : "⏳ Payment Pending"}
//                       </span>
//                     )}
//                   </div>
//                   <span className="status-badge" style={{
//                     background: status === "COMPLETED" ? "var(--green-light)" : status === "CANCELLED" ? "var(--brand-light)" : status === "WAITING_FOR_OTP" ? "#FFFBEB" : status === "CONFIRMED" ? "#EFF6FF" : "#F5F5F5",
//                     color: status === "COMPLETED" ? "var(--green)" : status === "CANCELLED" ? "var(--brand)" : status === "WAITING_FOR_OTP" ? "#D97706" : status === "CONFIRMED" ? "var(--blue)" : "var(--text2)"
//                   }}>
//                     {status === "BOOKED" ? "🆕 New" : status === "CONFIRMED" ? "✅ Confirmed" : status === "WAITING_FOR_OTP" ? "🔐 OTP Sent" : status === "COMPLETED" ? "🎉 Done" : status === "CANCELLED" ? "✕ Cancelled" : status}
//                   </span>
//                 </div>

//                 {/* Rating */}
//                 {status === "COMPLETED" && b.rating && (
//                   <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
//                     {[1, 2, 3, 4, 5].map(i => (
//                       <span key={i} style={{ color: i <= b.rating ? "#F7C000" : "var(--border)", fontSize: 16 }}>★</span>
//                     ))}
//                     {b.review && <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 4 }}>"{b.review}"</span>}
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div className="booking-actions">
//                   {status === "BOOKED" && (
//                     <button className="booking-action-btn" onClick={() => handleAccept(b.bookingId)}
//                       style={{ background: "var(--blue)", color: "white", borderRadius: 8 }}>
//                       ✅ Accept Booking
//                     </button>
//                   )}
//                   {status === "CONFIRMED" && (
//                     <button className="booking-action-btn" onClick={() => handleRequestCompletion(b.bookingId)}
//                       style={{ background: "var(--green)", color: "white", borderRadius: 8 }}>
//                       🔐 Mark as Done (Send OTP)
//                     </button>
//                   )}
//                   {status === "WAITING_FOR_OTP" && (
//                     <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#92400E", flex: 1 }}>
//                       🔐 OTP sent to customer. Waiting for verification to complete the service...
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {toast && (
//         <div className={"toast toast-" + toast.type}>
//           {toast.type === "success" ? "✓" : "✕"} {toast.msg}
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useEffect, useState } from "react";
import { API_URL } from "../data/Api";

const safeStatus = (s) => {
  if (!s || typeof s !== "string") return "PENDING";
  return s.trim().toUpperCase();
};

const OTPInput = ({ bookingId, onSuccess, showToast }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      showToast("Enter 4-digit OTP", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-completion/${bookingId}/${otp}`, {
        method: "PUT"
      });

      if (res.ok) {
        showToast("🎉 Service completed!");
        onSuccess();
      } else {
        showToast("Invalid OTP", "error");
      }
    } catch {
      showToast("OTP error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "var(--green-light)",
      border: "2px solid var(--green)",
      borderRadius: 12,
      padding: 16,
      marginTop: 10
    }}>
      <p style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--green)",
        marginBottom: 10
      }}>
        🔐 Enter OTP from customer
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="_ _ _ _"
          maxLength={6}
          style={{
            flex: 1,
            padding: 12,
            fontSize: 24,
            fontWeight: 800,
            textAlign: "center",
            border: "2px solid var(--green)",
            borderRadius: 8
          }}
        />

        <button
          onClick={handleVerify}
          disabled={loading || otp.length < 4}
          style={{
            background: otp.length >= 4 ? "var(--green)" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {loading ? "..." : "Verify ✓"}
        </button>
      </div>
    </div>
  );
};

export const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("active");

  const providerId = localStorage.getItem("providerId") || "0"; // KEEP AS STRING

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/getAll-Bookings`);
      const data = await res.json();

      console.log("ALL BOOKINGS:", data);

      if (Array.isArray(data)) {
        const visibleBookings = data.filter((b) => {
          const bPid = b.providerId ? String(b.providerId) : "0";
          const status = safeStatus(b.status);

          console.log("Check:", b.bookingId, "Status:", status, "bPid:", bPid, "myPid:", providerId);

          return (
            bPid === providerId ||                 // my bookings (FIXED)
            bPid === "0" ||                        // unassigned
            ["BOOKED", "PENDING"].includes(status) // new bookings
          );
        });

        setBookings(visibleBookings);
      }
    } catch (e) {
      console.log("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (bookingId) => {
    try {
      const res = await fetch(`${API_URL}/update/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONFIRMED",
          providerId: providerId
        })
      });

      if (res.ok) {
        showToast("✅ Booking accepted!");
        fetchBookings();
      } else {
        showToast("Failed to accept", "error");
      }
    } catch {
      showToast("Error", "error");
    }
  };

  const handleRequestOTP = async (bookingId) => {
    try {
      const res = await fetch(`${API_URL}/request-completion/${bookingId}`, {
        method: "PUT"
      });

      if (res.ok) {
        showToast("🔐 OTP sent!");
        fetchBookings();
      } else {
        showToast("Failed", "error");
      }
    } catch {
      showToast("Error", "error");
    }
  };

  const active = bookings.filter(
    (b) => !["COMPLETED", "CANCELLED"].includes(safeStatus(b.status))
  );

  const past = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(safeStatus(b.status))
  );

  const displayed = tab === "active" ? active : past;

  return (
    <div className="page">
      <div style={{
        background: "white",
        padding: 16,
        borderBottom: "1px solid var(--border)"
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>
          My Bookings
        </h1>

        <div className="booking-tabs">
          <button
            className={"booking-tab " + (tab === "active" ? "active" : "")}
            onClick={() => setTab("active")}
          >
            Active ({active.length})
          </button>

          <button
            className={"booking-tab " + (tab === "past" ? "active" : "")}
            onClick={() => setTab("past")}
          >
            Completed ({past.length})
          </button>
        </div>
      </div>

      <div className="container section">
        {loading ? (
          <div>Loading...</div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div>No bookings</div>
          </div>
        ) : (
          displayed.map((b) => {
            const status = safeStatus(b.status);
            const bPid = b.providerId ? String(b.providerId) : "0";

            return (
              <div key={b.bookingId} className="booking-card">
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10
                }}>
                  <div>
                    <div className="booking-service-name">
                      Booking #{b.bookingId}
                    </div>
                    <div className="booking-meta">
                      📍 {b.address}
                    </div>
                  </div>

                  <span className="status-badge">
                    {status === "BOOKED" && "🆕 New"}
                    {status === "CONFIRMED" && "✅ Confirmed"}
                    {status === "WAITING_FOR_OTP" && "🔐 Enter OTP"}
                    {status === "COMPLETED" && "🎉 Done"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  
                  {status === "BOOKED" && (
                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => handleAccept(b.bookingId)}
                    >
                      ✅ Accept This Booking
                    </button>
                  )}

                  {status === "CONFIRMED" && bPid === providerId && (
                    <button
                      className="btn btn-green btn-full"
                      onClick={() => handleRequestOTP(b.bookingId)}
                    >
                      📲 Generate OTP (Send to Customer)
                    </button>
                  )}

                  {status === "WAITING_FOR_OTP" && bPid === providerId && (
                    <OTPInput
                      bookingId={b.bookingId}
                      onSuccess={fetchBookings}
                      showToast={showToast}
                    />
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {toast && (
        <div className={"toast toast-" + toast.type}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};
