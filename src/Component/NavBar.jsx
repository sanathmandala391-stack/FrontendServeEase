import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const isCustomer = role === "CUSTOMER";
  const isProvider = role === "PROVIDER";
  const name = localStorage.getItem("name") || "";
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };
  const isActive = (p) => location.pathname === p;

  const hidePaths = ["/", "/customerlogin", "/customerRegister", "/providerlogin", "/providerRegister", "/admin"];
  if (hidePaths.includes(location.pathname)) return null;

  return (
    <>
      {/* Offer Banner */}
      <div className="offer-banner">
        <div className="offer-banner-inner">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="offer-banner-text">
              🎉 Get 20% off on your first booking! Use code FIRST20
              &nbsp;&nbsp;•&nbsp;&nbsp;
              ⚡ Same-day service available in Hyderabad
              &nbsp;&nbsp;•&nbsp;&nbsp;
              ✅ 500+ verified professionals
              &nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <nav className="navbar" style={{ boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.1)" : "none" }}>
        <div className="navbar-inner">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => navigate(isCustomer ? "/home" : isProvider ? "/providerHome" : "/")}>
            Serve<span>Ease</span>
          </div>

          {/* Location (customer only) */}
          {isCustomer && (
            <div className="navbar-location">
              <span style={{ fontSize: 16 }}>📍</span>
              <div>
                <div className="navbar-location-text">Hyderabad</div>
                <div className="navbar-location-sub">Telangana</div>
              </div>
              <span style={{ fontSize: 10, color: "var(--text3)" }}>▼</span>
            </div>
          )}

          {/* Search */}
          {isCustomer && (
            <div className="navbar-search">
              <span className="navbar-search-icon">🔍</span>
              <input
                placeholder="Search for a service..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && navigate("/home?search=" + search)}
              />
            </div>
          )}

          {/* Actions */}
          <div className="navbar-actions">
            {isCustomer && (
              <button className="navbar-btn navbar-btn-outline" onClick={() => navigate("/mybookings")}
                style={{ background: isActive("/mybookings") ? "var(--brand-light)" : "", color: isActive("/mybookings") ? "var(--brand)" : "" }}>
                📋 My Bookings
              </button>
            )}
            {isProvider && (
              <button className="navbar-btn navbar-btn-outline" onClick={() => navigate("/provider-dashboard")}>
                📋 Bookings
              </button>
            )}
            <div className="navbar-avatar" title={name} onClick={handleLogout} style={{ position: "relative" }}>
              {name.charAt(0).toUpperCase()}
              <span style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, background: "var(--green)", borderRadius: "50%", border: "2px solid white" }} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      {isCustomer && (
        <div className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            <button className={"mobile-nav-item" + (isActive("/home") ? " active" : "")} onClick={() => navigate("/home")}>
              <span className="nav-icon">🏠</span>Home
            </button>
            <button className={"mobile-nav-item" + (isActive("/mybookings") ? " active" : "")} onClick={() => navigate("/mybookings")}>
              <span className="nav-icon">📋</span>Bookings
            </button>
            <button className="mobile-nav-item" onClick={handleLogout}>
              <span className="nav-icon">👤</span>Account
            </button>
          </div>
        </div>
      )}
      {isProvider && (
        <div className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-inner">
            <button className={"mobile-nav-item" + (isActive("/providerHome") ? " active" : "")} onClick={() => navigate("/providerHome")}>
              <span className="nav-icon">🏠</span>Home
            </button>
            <button className={"mobile-nav-item" + (isActive("/provider-dashboard") ? " active" : "")} onClick={() => navigate("/provider-dashboard")}>
              <span className="nav-icon">📋</span>Bookings
            </button>
            <button className="mobile-nav-item" onClick={handleLogout}>
              <span className="nav-icon">👤</span>Account
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
