import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navigation.css";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Parse user status from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("adminToken");
  const isLoggedIn = user !== null || token !== null;

  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    navigate("/login");
  };

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="logo" />
      </div>

      {/* Hamburger button — only visible on mobile */}
      <button
        className={`hamburger${menuOpen ? " hamburger--open" : ""}`}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span className="hamburger__bar" />
        <span className="hamburger__bar" />
        <span className="hamburger__bar" />
      </button>

      <ul className={`nav-links${menuOpen ? " nav-links--open" : ""}`}>
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/services" className={location.pathname === "/services" ? "active" : ""}>
            Services
          </Link>
        </li>
        <li>
          <Link to="/contacts" className={location.pathname === "/contacts" ? "active" : ""}>
            Contacts
          </Link>
        </li>
        {isLoggedIn ? (
          <>
            <li>
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
                Dashboard
              </Link>
            </li>
            <li>
              <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                Logout
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={location.pathname === "/login" ? "active" : ""}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className={location.pathname === "/signup" ? "active" : ""}>
                SignUp
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
