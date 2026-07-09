import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import signupBackground from "../assets/signup-bg.png";
import { LegalModal } from "./LegalModal";
import "./SignUp.css";



export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // "privacy" | "terms" | null

  const handleSignUp = async () => {
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Account created successfully. Please sign in.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth redirect response
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        // Clear the hash from the URL
        window.history.replaceState(null, null, window.location.pathname);
        handleGoogleCallback(accessToken);
      }
    }
  }, []);

  const handleGoogleCallback = async (accessToken) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google registration failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);
      localStorage.removeItem("adminToken");
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google Client ID is missing. Check your .env file.");
      return;
    }
    const redirectUri = window.location.origin + '/signup';
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("scope", "email profile openid");
    authUrl.searchParams.append("prompt", "select_account");
    window.location.href = authUrl.toString();
  };

  return (
    <div className="signupPage authPage" style={{ "--auth-bg": `url(${signupBackground})` }}>
      <section className="authHero" aria-label="Lost and Found sign up">
        <div className="authCopy">
          <h1>Join Lost &amp; Found</h1>
          <p>Create an account to start reporting, finding, and claiming securely.</p>
        </div>
      </section>

      <div className="signupCard authCard">
        <h2 className="signupTitle">Signup</h2>
        <p className="signupSub">Create Account</p>

        {error && <div className="signupError">{error}</div>}
        {success && <div className="signupSuccess">{success}</div>}

        <div className="signupField">
          <label>Username</label>
          <input
            autoFocus
            placeholder="Choose a username"
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
          />
        </div>

        <div className="signupField">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          />
        </div>

        <div className="signupField">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          />
        </div>

        <div className="signupField">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleSignUp()}
          />
        </div>

        <button className="signupBtn" onClick={handleSignUp} disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <div className="divider"><span>or</span></div>

        <button type="button" className="googleBtn" onClick={() => googleLogin()} disabled={loading}>
          <svg className="googleIcon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="signupLogin">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <div className="authLegalLinks" style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#65727a" }}>
          By signing up, you agree to our{" "}
          <button type="button" className="forgotLink" style={{ fontSize: "12px", padding: 0 }} onClick={() => setLegalModal("terms")}>Terms</button>
          {" "}and{" "}
          <button type="button" className="forgotLink" style={{ fontSize: "12px", padding: 0 }} onClick={() => setLegalModal("privacy")}>Privacy Policy</button>
        </div>
      </div>

      {legalModal && (
        <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </div>
  );
}
