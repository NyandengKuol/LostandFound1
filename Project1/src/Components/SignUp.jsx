import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import loginBackground from "../assets/login-background.jpg";
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
        <div className="googleChooserHeader">
          <svg className="googleIcon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <h3>Sign up with Google</h3>
          <p>No password needed when you use Google.</p>
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
                  <span className="googleChooserAvatar">{account.initials}</span>
                  <span className="googleChooserDetails">
                    <span className="googleChooserName">{account.name}</span>
                    <span className="googleChooserEmail">{account.email}</span>
                  </span>
                </button>
              ))}
              <button type="button" className="googleChooserItem useAnother" onClick={() => setShowCustomInput(true)}>
                <span className="googleChooserAvatar">+</span>
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
        <button type="button" className="googleCancelBtn" onClick={onClose}>Cancel</button>
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
    <div className="signupPage authPage" style={{ "--auth-bg": `url(${loginBackground})` }}>
      <section className="authHero" aria-label="Lost and Found sign up">
        <div className="authCopy">
          <h1>Join Lost &amp; Found</h1>
          <p>Create an account to start reporting, finding, and claiming securely.</p>
        </div>
      </section>

      <div className="signupCard authCard">
        <div className="signupLogo authLogo">LF</div>
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
