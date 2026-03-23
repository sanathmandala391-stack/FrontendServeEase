import React, { useState } from "react";
import { API_URL, NGROK_HEADERS } from "../data/Api";
import { useNavigate } from "react-router-dom";

export const PaymentPage = ({ booking }) => {
  const [paymentType, setPaymentType] = useState("PREPAID");
  const [loading, setLoading] = useState(false);
  const customerId = localStorage.getItem("customerId");
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL + "/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          amount: booking.amount || 500,
          paymentType: paymentType,
          email: localStorage.getItem("customerEmail") || "test@test.com",
          name: localStorage.getItem("customerName") || "Customer",
          phone: localStorage.getItem("customerPhone") || "9999999999"
        })
      });

      const data = await response.json();

      // ✅ Create and submit PayU form dynamically
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.action;

      const fields = [
        "key", "txnid", "amount", "productinfo",
        "firstname", "email", "phone", "surl", "furl", "hash"
      ];

      fields.forEach((field) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = field;
        input.value = data[field];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.log(err);
      alert("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{
        border: "1px solid #eee", borderRadius: "12px",
        padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Payment
        </h2>

        <div style={{
          background: "#f0fdf4", borderRadius: "8px",
          padding: "12px", marginBottom: "16px"
        }}>
          <p><b>Booking #:</b> {booking.bookingId}</p>
          <p><b>Service:</b> {booking.serviceId}</p>
          <p><b>Address:</b> {booking.address}</p>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#16a34a" }}>
            Amount: Rs. {booking.amount || 500}
          </p>
        </div>

        {/* ✅ Payment type toggle */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Payment Type:
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setPaymentType("PREPAID")}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: paymentType === "PREPAID" ? "2px solid #1a73e8" : "1px solid #ccc",
                backgroundColor: paymentType === "PREPAID" ? "#e8f0fe" : "white",
                cursor: "pointer", fontWeight: "bold"
              }}
            >
              Prepaid
              <br />
              <small style={{ fontWeight: "normal", color: "#555" }}>
                Pay now, service later
              </small>
            </button>
            <button
              onClick={() => setPaymentType("POSTPAID")}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: paymentType === "POSTPAID" ? "2px solid #1a73e8" : "1px solid #ccc",
                backgroundColor: paymentType === "POSTPAID" ? "#e8f0fe" : "white",
                cursor: "pointer", fontWeight: "bold"
              }}
            >
              Postpaid
              <br />
              <small style={{ fontWeight: "normal", color: "#555" }}>
                Pay after service
              </small>
            </button>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: "8px",
            backgroundColor: loading ? "#ccc" : "#1a73e8",
            color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px", fontWeight: "bold"
          }}
        >
          {loading ? "Redirecting to PayU..." : "Pay Rs. " + (booking.amount || 500)}
        </button>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#888", marginTop: "10px" }}>
          Secured by PayU  Payments
        </p>
      </div>
    </div>
  );
};