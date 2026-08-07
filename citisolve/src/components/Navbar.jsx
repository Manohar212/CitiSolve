import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUserRole } from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();
  const userName = localStorage.getItem("userName");

  const [gliderStyle, setGliderStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const submitRef = useRef(null);
  const myComplaintsRef = useRef(null);

  const updateGlider = () => {
    if (location.pathname === "/submit-complaint" && submitRef.current) {
      setGliderStyle({
        left: submitRef.current.offsetLeft,
        width: submitRef.current.offsetWidth,
        opacity: 1,
      });
    } else if (location.pathname === "/my-complaints" && myComplaintsRef.current) {
      setGliderStyle({
        left: myComplaintsRef.current.offsetLeft,
        width: myComplaintsRef.current.offsetWidth,
        opacity: 1,
      });
    } else {
      setGliderStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  useEffect(() => {
    updateGlider();
  }, [location.pathname, userRole]);

  useEffect(() => {
    window.addEventListener("resize", updateGlider);
    return () => window.removeEventListener("resize", updateGlider);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🏛️</span>
            <span className="brand-text">CitiSolve</span>
          </Link>
        </div>

        <div className="navbar-menu">
          {userRole && (
            <>
              {userRole === "citizen" && (
                <div className="nav-pill-group">
                  <div
                    className="nav-pill-glider"
                    style={{
                      transform: `translateX(${gliderStyle.left}px)`,
                      width: `${gliderStyle.width}px`,
                      opacity: gliderStyle.opacity,
                    }}
                  />
                  <Link
                    ref={submitRef}
                    to="/submit-complaint"
                    className={`nav-link nav-pill-btn ${isActive("/submit-complaint") ? "active" : ""}`}
                  >
                    Submit Complaint
                  </Link>
                  <Link
                    ref={myComplaintsRef}
                    to="/my-complaints"
                    className={`nav-link nav-pill-btn ${isActive("/my-complaints") ? "active" : ""}`}
                  >
                    My Complaints
                  </Link>
                </div>
              )}
              {userRole === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className={`nav-link admin-link ${isActive("/admin-dashboard") ? "active" : ""}`}
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-auth">
          {userRole ? (
            <div className="user-menu">
              <span className="user-name">Welcome, {userName}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">
                Login
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
