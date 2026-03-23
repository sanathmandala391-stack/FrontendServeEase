import React from 'react'
import NavBar from './Component/NavBar'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CustomerRegister } from './pages/CustomerRegister'
import { CustomerLogin } from './pages/CustomerLogin'
import { HomePage } from './pages/HomePage'
import { ProviderHomePage } from './pages/ProviderHomePage'
import { ProviderRegister } from './pages/ProviderRegister'
import { ProviderLogin } from './pages/ProviderLogin'
import { GetAllBookings } from './pages/GetAllBookings'
import { MyBookings } from './pages/MyBookings'
import { ProviderBookings } from './pages/ProviderBookings'
import { AdminDashboard } from './pages/AdminDashboard'
import './styles.css'

const LandingPage = () => {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-badge">🎉 Now available in Hyderabad</div>
        <h1 className="landing-title">
          Home Services,<br /><span>Done Right.</span>
        </h1>
        <p className="landing-sub">
          Book verified professionals for plumbing, electrical, cleaning & more.
          Same-day service. Best prices guaranteed.
        </p>
        <div className="landing-btns">
          <a href="/customerRegister" className="landing-btn-primary">
            Book a Service →
          </a>
          <a href="/customerlogin" className="landing-btn-outline">
            Sign In
          </a>
          <a href="/providerlogin" className="landing-btn-outline" style={{ fontSize: 13 }}>
            Provider Login
          </a>
        </div>
      </div>

      <div className="landing-stats">
        {[["10,000+","Happy Customers"],["500+","Verified Pros"],["4.8★","Avg Rating"],["30min","Avg Response"]].map(([v,l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div className="landing-stat-value">{v}</div>
            <div className="landing-stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="landing-features">
        {[
          ["⚡","Same-Day Service","Book now, get service today. Available 7 days a week."],
          ["✅","Verified Pros","All professionals are background-checked and trained."],
          ["💰","Best Price","Transparent pricing. No hidden charges ever."],
          ["🔒","Secure Payments","UPI, cards, net banking — all secured by Cashfree."],
          ["📍","Live Tracking","Track your professional in real-time on the map."],
          ["⭐","Rated Service","Rate and review after every booking."],
        ].map(([icon,title,desc]) => (
          <div key={title} className="landing-feature">
            <div className="landing-feature-icon">{icon}</div>
            <div className="landing-feature-title">{title}</div>
            <div className="landing-feature-desc">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const CustomerRoute = ({ children }) => {
  const role = localStorage.getItem("role")
  if (role !== "CUSTOMER") return <Navigate to="/customerlogin" replace />
  return children
}

const ProviderRoute = ({ children }) => {
  const role = localStorage.getItem("role")
  if (role !== "PROVIDER") return <Navigate to="/providerlogin" replace />
  return children
}

const App = () => {
  const role = localStorage.getItem("role")
  const isAdmin = role === "ADMIN"
  return (
    <>
      {!isAdmin && <NavBar />}
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/customerRegister' element={<CustomerRegister />} />
        <Route path='/customerlogin' element={<CustomerLogin />} />
        <Route path='/providerRegister' element={<ProviderRegister />} />
        <Route path='/providerlogin' element={<ProviderLogin />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/home' element={<CustomerRoute><HomePage /></CustomerRoute>} />
        <Route path='/mybookings' element={<CustomerRoute><MyBookings /></CustomerRoute>} />
        <Route path='/getAllBookings' element={<GetAllBookings />} />
        <Route path='/providerHome' element={<ProviderRoute><ProviderHomePage /></ProviderRoute>} />
        <Route path='/provider-dashboard' element={<ProviderRoute><ProviderBookings /></ProviderRoute>} />
      </Routes>
    </>
  )
}

export default App
