
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, NGROK_HEADERS } from '../data/Api';
import { MyBookings } from '../pages/MyBookings';


export const ServicesAvailable = () => {
  const navigate=useNavigate();

const [services,setServices]=useState([]);



const BookService=async(serviceId)=>{

  const customerId=localStorage.getItem("customerId");

  try {
    const response=await fetch(`${API_URL}/add-booking`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
     body:JSON.stringify({
      customerId:Number(customerId),
      providerId:7,
      serviceId:serviceId,
      address:"Hyderabad",
      status:"Booked",
     isVerified: false

     })
    });

    const data=await response.text();
    console.log(data);

    if(response.ok){
      alert("Booking Sucessfull")
    }
    else{
      alert("Booking Failed");
    }

  } catch (err) {
    console.log(err);
  }

}

const GetAllServices=async(e)=>{
try {
    
    const response=await fetch(`${API_URL}/getAllServices`,{

        method:"GET",
        headers:{"Content-Type": "application/json"}
    });

    const data=await response.json();
    console.log(data);
    setServices(data);
} catch (err) {
    console.log(err);
}

}

useEffect(()=>{
GetAllServices();
},[]);





  return (
 
   
    <div>

         <div>
       <button onClick={()=>navigate("/mybookings")}>My Bookings</button>
    </div>
 
{
   services.map((service)=>(
<div style={{
border:"1px solid black",
width:"300px",
padding:"15px",
margin:"20px",
borderRadius:"10px"
}}>

<h3>Service:{service.serviceName}</h3>
<p>Category: {service.category}</p>
<p>Description: {service.description}</p>
<p>Price: {service.price}</p>
<img 
src={`http://localhost:8080/uploads/${service.imageUrl}`} 
width={300} 
height={100} 
alt="image"
/>
<br></br>
<br></br>
<button onClick={()=>BookService(service.serviceId)}>Book Service</button>

</div>



   )

   )
  
}
</div>
  )
}
