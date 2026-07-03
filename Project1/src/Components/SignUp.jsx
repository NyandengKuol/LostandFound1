import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import signupBackground from "../assets/signup-bg.png";
import "./SignUp.css";

const googleAccounts = [
  { name: "Lilian Beam", email: "lilian.beam@gmail.com", initials: "LB" },
  { name: "Nyandeng", email: "nyandeng@gmail.com", initials: "NK" },
  { name: "Support Admin", email: "supportlostandfound@gmail.com", initials: "SA" },
];

function GoogleChooserModal({ onClose, onChoose }) {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  return (
    <div className="googleChooserOverlay" onClick={onClose}>
      <div className="googleChooserBox" onClick={e => e.stopPropagation()}>

        {/* Google G logo */}
        <div className="googleChooserHeader">
          <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" style={{ display: "block", margin: "0 auto 12px" }}>
            <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
              c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4
              C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20
              C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"/>
            <path d="M6.306,14.691l6.571,4.819C14.655,15.108,19.003,12,24,12c3.059,0,5.842,1.154,7.961,3.039
              l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"/>
            <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
              c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"/>
            <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
              c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24
              C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"/>
          </svg>
          <h3 className="gcTitle">Sign up with Google</h3>
          <p className="gcSubtitle">to continue to <strong>Lost &amp; Found</strong></p>
        </div>

        <div className="googleChooserList">
          {!showCustomInput ? (
            <>
              {googleAccounts.map(account => (
                <button
                  type="button"
                  key={account.email}
                  className="googleChooserItem"
                  onClick={() => onChoose(account.email, account.name)}
                >
                  <span className="googleChooserAvatar gcAvatar--color">{account.initials}</span>
                  <span className="googleChooserDetails">
                    <span className="googleChooserName">{account.name}</span>
                    <span className="googleChooserEmail">{account.email}</span>
                  </span>
                  <svg className="gcChevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9aa0a6" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
              <button type="button" className="googleChooserItem gcUseAnother" onClick={() => setShowCustomInput(true)}>
                <span className="googleChooserAvatar gcAvatar--grey">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    <line x1="15" y1="3" x2="21" y2="3"/>
                    <line x1="18" y1="0" x2="18" y2="6"/>
                  </svg>
                </span>
                <span className="googleChooserDetails">
                  <span className="googleChooserName">Use another account</span>
                </span>
              </button>
            </>
          ) : (
            <div className="googleChooserCustom">
              <input
                placeholder="Enter your name"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Enter your Google email"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
              />
              <div className="googleCustomActions">
                <button type="button" className="googleSecBtn" onClick={() => setShowCustomInput(false)}>Back</button>
                <button
                  type="button"
                  className="googlePrimBtn"
                  disabled={!customEmail}
                  onClick={() => onChoose(customEmail, customName || "Google User")}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="gcFooter">
          <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
          <span className="gcFooterDot">•</span>
          <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleMock, setShowGoogleMock] = useState(false);

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

  const handleGoogleLogin = async (email, name) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:4000/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google registration failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("adminToken");
      setShowGoogleMock(false);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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

        <button type="button" className="googleBtn" onClick={() => setShowGoogleMock(true)} disabled={loading}>
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
      </div>

      {showGoogleMock && (
        <GoogleChooserModal
          onClose={() => setShowGoogleMock(false)}
          onChoose={handleGoogleLogin}
        />
      )}
    </div>
  );
}
