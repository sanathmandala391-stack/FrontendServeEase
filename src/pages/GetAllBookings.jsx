
import React, { useEffect, useState } from 'react'
import { API_URL, NGROK_HEADERS } from '../data/Api';

export const GetAllBookings = () => {

    const [bookings,setBookings]=useState([]);
    
    const GetAllBookings=async(e)=>{
     try {

        const response=await fetch(`${API_URL}/getAll-Bookings`,{
            method:"GET",
            headers:{"Content-Type":"application/json"}
        });

        const data=await response.json();
        console.log(data);
        setBookings(data);
        
     } catch (err) {
        console.log(err);
     }
    }

    useEffect(()=>{
        GetAllBookings();
    },[])


  return (
 <div>
      <h2 style={{ textAlign: "center" }}>All Bookings</h2>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center"
      }}>

        {bookings.map((booking) => (
          <div key={booking.bookingId} style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "15px",
            width: "300px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>

            <h3>Booking ID: {booking.bookingId}</h3>
            <p><b>Customer ID:</b> {booking.customerId}</p>
            <p><b>Provider ID:</b> {booking.providerId}</p>
            <p><b>Service ID:</b> {booking.serviceId}</p>
            <p><b>Date:</b> {booking.bookingDate}</p>
            <p><b>Address:</b> {booking.address}</p>
            <p><b>Status:</b> {booking.status}</p>

          </div>
        ))}

      </div>
</div>


  )
}
