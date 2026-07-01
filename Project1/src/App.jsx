import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./Components/ThemeContext.jsx";
import Navigation from "./Components/Navigation.jsx";
import Footer from "./Components/Footer.jsx";
import Home from "./Components/Home.jsx";
import Services from "./Components/Services.jsx";
import Contacts from "./Components/Contacts.jsx";
import Login from "./Components/Login.jsx";
import SignUp from "./Components/SignUp.jsx";
import Dashboard from "./Components/Dashboard.jsx";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="app">
      <Navigation />
      <main className={isDashboard ? "dashboard-main" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      {!isDashboard && !isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
