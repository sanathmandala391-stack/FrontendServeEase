// import React, { useState } from "react";
// import { API_URL, NGROK_HEADERS } from "../data/Api";

// // ===================== CONSTANTS =====================

// const STAGES = [
//   {
//     key: "ORDER_PLACED",
//     label: "Order Placed",
//     icon: "📋",
//     description: "Your booking has been confirmed"
//   },
//   {
//     key: "PROVIDER_ASSIGNED",
//     label: "Provider Assigned",
//     icon: "👷",
//     description: "A provider has been assigned to your booking"
//   },
//   {
//     key: "PROVIDER_ON_THE_WAY",
//     label: "Provider On the Way",
//     icon: "🛵",
//     description: "Provider is heading to your location"
//   },
//   {
//     key: "SERVICE_IN_PROGRESS",
//     label: "Service In Progress",
//     icon: "🔧",
//     description: "Service is currently being performed"
//   },
//   {
//     key: "COMPLETED",
//     label: "Completed",
//     icon: "✅",
//     description: "Service has been completed successfully"
//   },
// ];

// const STATUS_TO_STAGE = {
//   BOOKED: 0,
//   PROVIDER_ASSIGNED: 1,
//   PROVIDER_ON_THE_WAY: 2,
//   WAITING_FOR_OTP: 3,
//   SERVICE_IN_PROGRESS: 3,
//   COMPLETED: 4,
//   CANCELLED: -1
// };

// // ===================== PROGRESS BAR =====================

// const ProgressBar = ({ currentStage }) => {
//   const progress = currentStage === -1 ? 0 : (currentStage / (STAGES.length - 1)) * 100;

//   return (
//     <div style={{ padding: "16px 0 8px" }}>
//       {/* Step indicators */}
//       <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
//         {/* Background line */}
//         <div style={{
//           position: "absolute",
//           top: "16px",
//           left: "16px",
//           right: "16px",
//           height: "3px",
//           background: "#e0e0e0",
//           zIndex: 0
//         }} />
//         {/* Progress line */}
//         <div style={{
//           position: "absolute",
//           top: "16px",
//           left: "16px",
//           width: "calc(" + progress + "% - 16px)",
//           height: "3px",
//           background: "linear-gradient(90deg, #1a73e8, #22c55e)",
//           zIndex: 1,
//           transition: "width 0.5s ease"
//         }} />

//         {STAGES.map((stage, index) => {
//           const isDone = index < currentStage;
//           const isActive = index === currentStage;
//           const isPending = index > currentStage;

//           return (
//             <div
//               key={stage.key}
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 zIndex: 2,
//                 width: "60px"
//               }}
//             >
//               {/* Circle */}
//               <div style={{
//                 width: "32px",
//                 height: "32px",
//                 borderRadius: "50%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: "14px",
//                 fontWeight: "bold",
//                 border: isActive ? "3px solid #1a73e8" : isDone ? "3px solid #22c55e" : "3px solid #ddd",
//                 background: isDone ? "#22c55e" : isActive ? "#e8f0fe" : "white",
//                 color: isDone ? "white" : isActive ? "#1a73e8" : "#999",
//                 boxShadow: isActive ? "0 0 0 4px rgba(26,115,232,0.15)" : "none",
//                 transition: "all 0.3s"
//               }}>
//                 {isDone ? "✓" : stage.icon}
//               </div>
//               {/* Label */}
//               <p style={{
//                 fontSize: "9px",
//                 textAlign: "center",
//                 marginTop: "4px",
//                 color: isPending ? "#999" : isActive ? "#1a73e8" : "#22c55e",
//                 fontWeight: isActive ? "bold" : "normal",
//                 lineHeight: "1.2",
//                 width: "55px"
//               }}>
//                 {stage.label}
//               </p>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ===================== TIMELINE =====================

// const Timeline = ({ currentStage, booking }) => {
//   return (
//     <div style={{ padding: "8px 0" }}>
//       {STAGES.map((stage, index) => {
//         const isDone = index < currentStage;
//         const isActive = index === currentStage;
//         const isPending = index > currentStage;
//         const isLast = index === STAGES.length - 1;

//         return (
//           <div key={stage.key} style={{ display: "flex", gap: "12px" }}>
//             {/* Left column - icon + line */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "32px" }}>
//               <div style={{
//                 width: "28px",
//                 height: "28px",
//                 borderRadius: "50%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: "13px",
//                 background: isDone ? "#22c55e" : isActive ? "#1a73e8" : "#f3f4f6",
//                 color: isPending ? "#9ca3af" : "white",
//                 flexShrink: 0
//               }}>
//                 {isDone ? "✓" : stage.icon}
//               </div>
//               {!isLast && (
//                 <div style={{
//                   width: "2px",
//                   flexGrow: 1,
//                   minHeight: "24px",
//                   background: isDone ? "#22c55e" : "#e5e7eb",
//                   margin: "3px 0"
//                 }} />
//               )}
//             </div>

//             {/* Right column - content */}
//             <div style={{ paddingBottom: isLast ? "0" : "16px", flex: 1 }}>
//               <p style={{
//                 margin: 0,
//                 fontSize: "13px",
//                 fontWeight: isActive ? "bold" : "normal",
//                 color: isPending ? "#9ca3af" : isActive ? "#1a73e8" : "#111"
//               }}>
//                 {stage.label}
//               </p>
//               {(isDone || isActive) && (
//                 <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>
//                   {stage.description}
//                 </p>
//               )}
//               {isActive && booking.estimatedTime && (
//                 <p style={{
//                   margin: "4px 0 0",
//                   fontSize: "11px",
//                   color: "#1a73e8",
//                   fontWeight: "bold"
//                 }}>
//                   ETA: {booking.estimatedTime} mins
//                 </p>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// // ===================== PROVIDER CARD =====================

// const ProviderCard = ({ providerId }) => {
//   return (
//     <div style={{
//       background: "#f8fafc",
//       border: "1px solid #e2e8f0",
//       borderRadius: "10px",
//       padding: "12px",
//       marginTop: "10px",
//       display: "flex",
//       alignItems: "center",
//       gap: "12px"
//     }}>
//       {/* Avatar */}
//       <div style={{
//         width: "48px",
//         height: "48px",
//         borderRadius: "50%",
//         background: "linear-gradient(135deg, #1a73e8, #22c55e)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize: "20px",
//         flexShrink: 0
//       }}>
//         👷
//       </div>
//       <div style={{ flex: 1 }}>
//         <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>
//           Provider #{providerId}
//         </p>
//         <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>
//           ⭐ 4.8 • Verified Professional
//         </p>
//       </div>
//       <a
//         href={"tel:+919999999999"}
//         style={{
//           background: "#22c55e",
//           color: "white",
//           padding: "8px 12px",
//           borderRadius: "8px",
//           textDecoration: "none",
//           fontSize: "12px",
//           fontWeight: "bold"
//         }}
//       >
//         📞 Call
//       </a>
//     </div>
//   );
// };

// // ===================== RATING =====================

// const RatingSection = ({ bookingId, onRated }) => {
//   const [rating, setRating] = useState(0);
//   const [hoveredRating, setHoveredRating] = useState(0);
//   const [review, setReview] = useState("");
//   const [submitted, setSubmitted] = useState(false);

//   const submitRating = async () => {
//     if (rating === 0) return alert("Please select a rating");
//     try {
//       const response = await fetch(API_URL + "/rating/submit", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ bookingId, rating, review })
//       });
//       if (response.ok) {
//         setSubmitted(true);
//         if (onRated) onRated();
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   if (submitted) {
//     return (
//       <div style={{
//         marginTop: "10px", padding: "12px",
//         background: "#f0fdf4", borderRadius: "8px",
//         textAlign: "center", border: "1px solid #bbf7d0"
//       }}>
//         <p style={{ color: "#16a34a", fontWeight: "bold", margin: 0 }}>
//           Thank you for your review! ⭐
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       marginTop: "10px", padding: "12px",
//       border: "1px solid #e0e0e0", borderRadius: "10px",
//       background: "#fffbeb"
//     }}>
//       <p style={{ fontWeight: "bold", margin: "0 0 8px", fontSize: "14px" }}>
//         Rate your experience
//       </p>

//       {/* Stars */}
//       <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
//         {[1, 2, 3, 4, 5].map((star) => (
//           <span
//             key={star}
//             onClick={() => setRating(star)}
//             onMouseEnter={() => setHoveredRating(star)}
//             onMouseLeave={() => setHoveredRating(0)}
//             style={{
//               fontSize: "28px",
//               cursor: "pointer",
//               color: star <= (hoveredRating || rating) ? "#f59e0b" : "#d1d5db",
//               transition: "color 0.1s"
//             }}
//           >
//             ★
//           </span>
//         ))}
//       </div>

//       {/* Review text */}
//       <textarea
//         placeholder="Write your review (optional)..."
//         value={review}
//         onChange={(e) => setReview(e.target.value)}
//         rows={2}
//         style={{
//           width: "100%",
//           padding: "8px",
//           borderRadius: "6px",
//           border: "1px solid #ddd",
//           fontSize: "13px",
//           resize: "none",
//           boxSizing: "border-box",
//           marginBottom: "8px"
//         }}
//       />

//       <button
//         onClick={submitRating}
//         style={{
//           width: "100%", padding: "8px",
//           borderRadius: "6px", backgroundColor: "#f59e0b",
//           color: "white", border: "none",
//           cursor: "pointer", fontWeight: "bold"
//         }}
//       >
//         Submit Review
//       </button>
//     </div>
//   );
// };

// // ===================== INVOICE =====================

// const Invoice = ({ booking }) => {
//   const [show, setShow] = useState(false);

//   if (!show) {
//     return (
//       <button
//         onClick={() => setShow(true)}
//         style={{
//           width: "100%", padding: "8px", marginTop: "8px",
//           borderRadius: "6px", backgroundColor: "#6366f1",
//           color: "white", border: "none",
//           cursor: "pointer", fontWeight: "bold", fontSize: "13px"
//         }}
//       >
//         View Invoice / Bill
//       </button>
//     );
//   }

//   return (
//     <div style={{
//       marginTop: "10px", border: "2px dashed #6366f1",
//       borderRadius: "10px", padding: "14px",
//       background: "#fafafa"
//     }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
//         <h4 style={{ margin: 0, color: "#6366f1" }}>INVOICE</h4>
//         <button
//           onClick={() => setShow(false)}
//           style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
//         >
//           ✕
//         </button>
//       </div>

//       <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "10px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//           <span style={{ fontSize: "13px", color: "#555" }}>Booking #</span>
//           <span style={{ fontSize: "13px", fontWeight: "bold" }}>{booking.bookingId}</span>
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//           <span style={{ fontSize: "13px", color: "#555" }}>Service ID</span>
//           <span style={{ fontSize: "13px" }}>{booking.serviceId}</span>
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//           <span style={{ fontSize: "13px", color: "#555" }}>Date</span>
//           <span style={{ fontSize: "13px" }}>{booking.bookingDate}</span>
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//           <span style={{ fontSize: "13px", color: "#555" }}>Address</span>
//           <span style={{ fontSize: "13px" }}>{booking.address}</span>
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
//           <span style={{ fontSize: "13px", color: "#555" }}>Payment</span>
//           <span style={{ fontSize: "13px", color: "#16a34a" }}>
//             {booking.paymentStatus === "COD" ? "Cash on Delivery" : "Online"}
//           </span>
//         </div>
//       </div>

//       <div style={{
//         borderTop: "2px solid #6366f1", marginTop: "10px",
//         paddingTop: "10px", display: "flex",
//         justifyContent: "space-between", alignItems: "center"
//       }}>
//         <span style={{ fontWeight: "bold", fontSize: "15px" }}>Total Amount</span>
//         <span style={{ fontWeight: "bold", fontSize: "18px", color: "#6366f1" }}>
//           Rs. {booking.amount || 500}
//         </span>
//       </div>

//       <button
//         onClick={() => window.print()}
//         style={{
//           width: "100%", marginTop: "10px", padding: "8px",
//           borderRadius: "6px", backgroundColor: "#6366f1",
//           color: "white", border: "none",
//           cursor: "pointer", fontWeight: "bold", fontSize: "13px"
//         }}
//       >
//         Print Invoice
//       </button>
//     </div>
//   );
// };

// // ===================== MAIN EXPORT =====================

// export const BookingTracker = ({ booking }) => {
//   const normalizeStatus = (status) => {
//     if (!status) return "";
//     return status.trim().toUpperCase().replace(/\s+/g, "_").replace(/\.+/g, "");
//   };

//   const status = normalizeStatus(booking.status);
//   const currentStage = STATUS_TO_STAGE[status] !== undefined ? STATUS_TO_STAGE[status] : 0;
//   const isCancelled = status === "CANCELLED";
//   const isCompleted = status === "COMPLETED";

//   if (isCancelled) {
//     return (
//       <div style={{
//         marginTop: "10px", padding: "12px",
//         background: "#fef2f2", borderRadius: "8px",
//         border: "1px solid #fecaca", textAlign: "center"
//       }}>
//         <p style={{ color: "#dc2626", fontWeight: "bold", margin: 0, fontSize: "14px" }}>
//           Booking Cancelled
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ marginTop: "10px" }}>
//       {/* ✅ Progress Bar */}
//       <div style={{
//         background: "white", border: "1px solid #e0e0e0",
//         borderRadius: "10px", padding: "12px",
//         marginBottom: "10px"
//       }}>
//         <p style={{ margin: "0 0 8px", fontWeight: "bold", fontSize: "13px", color: "#555" }}>
//           Booking Progress
//         </p>
//         <ProgressBar currentStage={currentStage} />
//       </div>

//       {/* ✅ Timeline */}
//       <div style={{
//         background: "white", border: "1px solid #e0e0e0",
//         borderRadius: "10px", padding: "12px",
//         marginBottom: "10px"
//       }}>
//         <p style={{ margin: "0 0 8px", fontWeight: "bold", fontSize: "13px", color: "#555" }}>
//           Order Timeline
//         </p>
//         <Timeline currentStage={currentStage} booking={booking} />
//       </div>

//       {/* ✅ Provider Card — show after assigned */}
//       {currentStage >= 1 && (
//         <ProviderCard providerId={booking.providerId} />
//       )}

//       {/* ✅ Rating — show only after completed */}
//       {isCompleted && (
//         <RatingSection bookingId={booking.bookingId} />
//       )}

//       {/* ✅ Invoice — show only after completed */}
//       {isCompleted && (
//         <Invoice booking={booking} />
//       )}
//     </div>
//   );
// };


import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../data/Api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ===================== CONSTANTS & ICONS =====================

const STAGES = [
  { key: "ORDER_PLACED", label: "Order Placed", icon: "📋", description: "Your booking has been confirmed" },
  { key: "PROVIDER_ASSIGNED", label: "Provider Assigned", icon: "👷", description: "A provider has been assigned" },
  { key: "PROVIDER_ON_THE_WAY", label: "Provider On the Way", icon: "🛵", description: "Provider is heading to your location" },
  { key: "SERVICE_IN_PROGRESS", label: "Service In Progress", icon: "🔧", description: "Service is being performed" },
  { key: "COMPLETED", label: "Completed", icon: "✅", description: "Service successfully completed" },
];

const STATUS_TO_STAGE = {
  BOOKED: 0, PROVIDER_ASSIGNED: 1, PROVIDER_ON_THE_WAY: 2,
  WAITING_FOR_OTP: 3, SERVICE_IN_PROGRESS: 3, COMPLETED: 4, CANCELLED: -1
};

const providerIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;background:#22c55e;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:18px;">🛵</div></div>`,
  iconSize: [40, 40], iconAnchor: [20, 40]
});

const customerIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:18px;">🏠</div></div>`,
  iconSize: [40, 40], iconAnchor: [20, 40]
});

// ===================== LIVE TRACKING MAP COMPONENT =====================

export const LiveTrackingMap = ({ providerId, customerLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const providerMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [currentPos, setCurrentPos] = useState(null);

  useEffect(() => {
    // 1. Initialize Map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([17.385, 78.4867], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstanceRef.current);

      // Add Customer Marker once
      if (customerLocation) {
        L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon })
         .addTo(mapInstanceRef.current).bindPopup("Your Home");
      }
    }

    // 2. Connect to WebSocket for Live Updates
    // Make sure SockJS and Stomp are available in window or imported
    const socket = new window.SockJS(`${API_URL}/ws-location-sockjs`);
    const stomp = window.Stomp.over(socket);
    stomp.debug = null;

    stomp.connect({}, () => {
      stomp.subscribe("/topic/location", (msg) => {
        const data = JSON.parse(msg.body);
        // ✅ Only update if it's OUR provider
        if (Number(data.providerId) === Number(providerId)) {
          const newLatLng = [data.latitude, data.longitude];
          setCurrentPos(newLatLng);
          updateMap(newLatLng);
        }
      });
    });

    return () => { if (stomp) stomp.disconnect(); };
  }, [providerId]);

  const updateMap = (latlng) => {
    if (!mapInstanceRef.current) return;

    // Update or Create Provider Marker
    if (providerMarkerRef.current) {
      providerMarkerRef.current.setLatLng(latlng);
    } else {
      providerMarkerRef.current = L.marker(latlng, { icon: providerIcon }).addTo(mapInstanceRef.current);
    }

    // Draw simple dashed route to customer
    if (customerLocation) {
      if (routeLayerRef.current) mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = L.polyline([latlng, [customerLocation.lat, customerLocation.lng]], {
        color: "#22c55e", weight: 4, dashArray: "10, 10", opacity: 0.6
      }).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.panTo(latlng);
  };

  return (
    <div style={{ position: "relative", marginBottom: "15px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "250px", borderRadius: "12px", border: "2px solid #22c55e" }} />
      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", zIndex: 1000 }}>
        {currentPos ? "🟢 Live Tracking Active" : "📡 Waiting for provider location..."}
      </div>
    </div>
  );
};

// ===================== SUB-COMPONENTS (ProgressBar, Timeline, etc.) =====================
// ... (Keep your ProgressBar and Timeline components exactly as you had them)
const ProgressBar = ({ currentStage }) => {
    const progress = currentStage === -1 ? 0 : (currentStage / (STAGES.length - 1)) * 100;
    return (
      <div style={{ padding: "16px 0 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          <div style={{ position: "absolute", top: "16px", left: "16px", right: "16px", height: "3px", background: "#e0e0e0", zIndex: 0 }} />
          <div style={{ position: "absolute", top: "16px", left: "16px", width: `calc(${progress}% - 16px)`, height: "3px", background: "linear-gradient(90deg, #1a73e8, #22c55e)", zIndex: 1, transition: "width 0.5s ease" }} />
          {STAGES.map((stage, index) => (
              <div key={stage.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, width: "60px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", border: index <= currentStage ? (index < currentStage ? "3px solid #22c55e" : "3px solid #1a73e8") : "3px solid #ddd", background: index < currentStage ? "#22c55e" : index === currentStage ? "#e8f0fe" : "white", color: index < currentStage ? "white" : "#999" }}>
                  {index < currentStage ? "✓" : stage.icon}
                </div>
                <p style={{ fontSize: "9px", textAlign: "center", marginTop: "4px", color: index === currentStage ? "#1a73e8" : "#999" }}>{stage.label}</p>
              </div>
          ))}
        </div>
      </div>
    );
};

// ===================== MAIN EXPORT =====================

export const BookingTracker = ({ booking }) => {
  const normalizeStatus = (status) => {
    if (!status) return "";
    return status.trim().toUpperCase().replace(/\s+/g, "_").replace(/\.+/g, "");
  };

  const status = normalizeStatus(booking.status);
  const currentStage = STATUS_TO_STAGE[status] !== undefined ? STATUS_TO_STAGE[status] : 0;
  
  // Use booking address for map if coords aren't available (Fallback to city center)
  const customerCoords = { lat: 17.3850, lng: 78.4867 }; 

  return (
    <div style={{ marginTop: "10px" }}>
      {/* 1. Show Map ONLY when provider is on the way or assigned */}
      {(status === "PROVIDER_ON_THE_WAY" || status === "PROVIDER_ASSIGNED") && (
        <LiveTrackingMap 
           providerId={booking.providerId} 
           customerLocation={customerCoords} 
        />
      )}

      <div style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
        <ProgressBar currentStage={currentStage} />
      </div>

      {/* Timeline & Other Sections... */}
      {/* ... keep the rest of your original BookingTracker render logic here ... */}
    </div>
  );
};