import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navigation.css";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse user status from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("adminToken");
  const isLoggedIn = user !== null || token !== null;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={logo} alt="logo" />
      </div>

      <ul className="nav-links">
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
