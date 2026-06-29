import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  
  // Modes: 'login', 'forgot', 'reset'
  const [mode, setMode] = useState("login");
  
  // Login form state
  const [form, setForm] = useState({ username: "", password: "" });
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  
  // Reset password state
  const [resetForm, setResetForm] = useState({ email: "", pin: "", password: "", confirmPassword: "" });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleMock, setShowGoogleMock] = useState(false);

  // ── STANDARD LOGIN ──
  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (data.role === "admin") {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("user", JSON.stringify({ 
          username: data.username || "Admin", 
          role: "admin" 
        }));
        navigate("/dashboard");
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD (REQUEST PIN) ──
  const handleForgot = async () => {
    if (!forgotEmail) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/api/login/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      setSuccess("Verification PIN has been sent to your email. (Also logged in server console)");
      setResetForm(prev => ({ ...prev, email: forgotEmail }));
      
      // Delay transition slightly so the user sees success message
      setTimeout(() => {
        setMode("reset");
        setSuccess("");
      }, 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── RESET PASSWORD (VERIFY PIN & SAVE) ──
  const handleReset = async () => {
    if (!resetForm.email || !resetForm.pin || !resetForm.password || !resetForm.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:4000/api/login/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetForm.email,
          pin: resetForm.pin,
          password: resetForm.password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setSuccess("Password reset successfully! Please sign in.");
      
      // Transition back to login mode after 2 seconds
      setTimeout(() => {
        setMode("login");
        setForm({ username: "", password: "" });
        setSuccess("");
      }, 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── GOOGLE LOGIN ──
  const handleGoogleLogin = async (email, name) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:4000/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google Login failed");

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Google account chooser layout
  const GoogleChooserModal = () => {
    const mockAccounts = [
      { name: "Lilian Beam", email: "lilian.beam@gmail.com", avatar: "👩‍💼" },
      { name: "Nyandeng", email: "nyandeng@gmail.com", avatar: "👩" },
      { name: "Support Admin", email: "supportlostandfound@gmail.com", avatar: "👨‍💻" }
    ];

    const [customEmail, setCustomEmail] = useState("");
    const [customName, setCustomName] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    return (
      <div className="googleChooserOverlay" onClick={() => setShowGoogleMock(false)}>
        <div className="googleChooserBox" onClick={e => e.stopPropagation()}>
          <div className="googleChooserHeader">
            <svg className="googleIcon" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <h3>Sign in with Google</h3>
            <p>to continue to Lost &amp; Found</p>
          </div>

          <div className="googleChooserList">
            {!showCustomInput ? (
              <>
                {mockAccounts.map((acc, i) => (
                  <div key={i} className="googleChooserItem" onClick={() => { handleGoogleLogin(acc.email, acc.name); setShowGoogleMock(false); }}>
                    <div className="googleChooserAvatar">{acc.avatar}</div>
                    <div className="googleChooserDetails">
                      <span className="googleChooserName">{acc.name}</span>
                      <span className="googleChooserEmail">{acc.email}</span>
                    </div>
                  </div>
                ))}
                <div className="googleChooserItem useAnother" onClick={() => setShowCustomInput(true)}>
                  <div className="googleChooserAvatar">➕</div>
                  <div className="googleChooserDetails">
                    <span className="googleChooserName">Use another account</span>
                  </div>
                </div>
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
                  <button className="googleSecBtn" onClick={() => setShowCustomInput(false)}>Back</button>
                  <button className="googlePrimBtn" disabled={!customEmail} onClick={() => { handleGoogleLogin(customEmail, customName || "Google User"); setShowGoogleMock(false); }}>
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
          <button className="googleCancelBtn" onClick={() => setShowGoogleMock(false)}>Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginLogo">🔍</div>
        
        {/* ── MODE: STANDARD LOGIN ── */}
        {mode === "login" && (
          <>
            <h1 className="loginTitle">Lost &amp; Found</h1>
            <p className="loginSub">Sign in to your account</p>

            {error && <div className="loginError">{error}</div>}
            {success && <div className="loginSuccess">{success}</div>}

            <div className="loginField">
              <label>Username</label>
              <input
                autoFocus
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="loginField">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="forgotLinkContainer">
              <span className="forgotLink" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}>
                Forgot password?
              </span>
            </div>

            <button className="loginBtn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button type="button" className="googleBtn" onClick={() => setShowGoogleMock(true)} disabled={loading}>
              <svg className="googleIcon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p className="loginSignup">
              Don't have an account?{" "}
              <Link to="/signup">Sign up</Link>
            </p>
          </>
        )}

        {/* ── MODE: FORGOT PASSWORD ── */}
        {mode === "forgot" && (
          <>
            <h1 className="loginTitle">Forgot Password</h1>
            <p className="loginSub">Enter your email to request a reset PIN</p>

            {error && <div className="loginError">{error}</div>}
            {success && <div className="loginSuccess">{success}</div>}

            <div className="loginField">
              <label>Email Address</label>
              <input
                type="email"
                autoFocus
                placeholder="e.g. user@gmail.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleForgot()}
              />
            </div>

            <button className="loginBtn" onClick={handleForgot} disabled={loading}>
              {loading ? "Sending PIN…" : "Send Reset PIN"}
            </button>

            <div className="backLinkContainer">
              <span className="backLink" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                ← Back to Sign In
              </span>
            </div>
          </>
        )}

        {/* ── MODE: RESET PASSWORD ── */}
        {mode === "reset" && (
          <>
            <h1 className="loginTitle">Reset Password</h1>
            <p className="loginSub">Enter the 6-digit PIN and choose a new password</p>

            {error && <div className="loginError">{error}</div>}
            {success && <div className="loginSuccess">{success}</div>}

            <div className="loginField">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetForm.email}
                onChange={e => setResetForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div className="loginField">
              <label>6-Digit PIN</label>
              <input
                autoFocus
                placeholder="Enter PIN (e.g. 123456)"
                value={resetForm.pin}
                onChange={e => setResetForm(p => ({ ...p, pin: e.target.value }))}
              />
            </div>

            <div className="loginField">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={resetForm.password}
                onChange={e => setResetForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>

            <div className="loginField">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={resetForm.confirmPassword}
                onChange={e => setResetForm(p => ({ ...p, confirmPassword: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleReset()}
              />
            </div>

            <button className="loginBtn" onClick={handleReset} disabled={loading}>
              {loading ? "Resetting Password…" : "Reset Password"}
            </button>

            <div className="backLinkContainer">
              <span className="backLink" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                ← Cancel &amp; Back to Sign In
              </span>
            </div>
          </>
        )}

      </div>

      {showGoogleMock && <GoogleChooserModal />}
    </div>
  );
}
