import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { apiRequest } from "../api";
import loginBackground from "../assets/login-bg.png";
import { LegalModal } from "./LegalModal";
import "./Login.css";



export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({ email: "", pin: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // "privacy" | "terms" | null

  useEffect(() => {
    const saved = localStorage.getItem("rememberedLogin");
    if (saved) {
      setForm(prev => ({ ...prev, username: saved }));
      setRememberMe(true);
    }
  }, []);

  const persistLogin = data => {
    if (data.role === "admin") {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("user", JSON.stringify({ username: data.username || "Admin", role: "admin" }));
    } else {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("adminToken");
    }

    if (rememberMe) {
      localStorage.setItem("rememberedLogin", form.username);
    } else {
      localStorage.removeItem("rememberedLogin");
    }
  };

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      persistLogin(data);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!forgotEmail) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await apiRequest("/api/login/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      setSuccess("A 6-digit reset PIN has been sent to your email.");
      setResetForm(prev => ({ ...prev, email: forgotEmail }));
      setTimeout(() => {
        setMode("reset");
        setSuccess("");
      }, 1400);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

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
      const data = await apiRequest("/api/login/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetForm.email,
          pin: resetForm.pin,
          password: resetForm.password,
        }),
      });

      setSuccess("Password reset successfully. Please sign in.");
      setTimeout(() => {
        setMode("login");
        setForm({ username: "", password: "" });
        setResetForm({ email: "", pin: "", password: "", confirmPassword: "" });
        setSuccess("");
      }, 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth redirect response
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error && state === "google-login") {
      window.history.replaceState(null, "", window.location.pathname);
      setError("Google sign-in was cancelled or blocked. Please try again.");
      return;
    }

    if (code && state === "google-login") {
      window.history.replaceState(null, "", window.location.pathname);
      handleGoogleCallback(code);
    }
  }, []);

  const handleGoogleCallback = async (code) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          redirect_uri: `${window.location.origin}${window.location.pathname}`,
        }),
      });

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

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: `${window.location.origin}${window.location.pathname}`,
    state: "google-login",
    scope: "email profile openid",
    select_account: true,
    onError: () => {
      setError("Google sign-in failed. Please try again.");
    },
  });

  return (
    <div className="loginPage authPage" style={{ "--auth-bg": `url(${loginBackground})` }}>
      <section className="authHero" aria-label="Lost and Found sign in">
        <div className="authCopy">
          <h1>Lost and Found</h1>
        </div>
      </section>

      <div className="loginCard authCard">
        {mode === "login" && (
          <>
            <h2 className="loginTitle">Login</h2>

            {error && <div className="loginError">{error}</div>}
            {success && <div className="loginSuccess">{success}</div>}

            <div className="loginField">
              <label>Username or Email</label>
              <input
                autoFocus
                placeholder="Enter your username or email"
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

            <div className="authOptions">
              <label className="rememberChoice">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="forgotLink" onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}>
                Forgot password?
              </button>
            </div>

            <button className="loginBtn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
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

            <p className="loginSignup">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>

            <div className="authLegalLinks" style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#65727a" }}>
              <button type="button" className="forgotLink" style={{ fontSize: "12px", padding: 0 }} onClick={() => setLegalModal("privacy")}>Privacy Policy</button>
              {" • "}
              <button type="button" className="forgotLink" style={{ fontSize: "12px", padding: 0 }} onClick={() => setLegalModal("terms")}>Terms of Service</button>
            </div>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h2 className="loginTitle">Forgot Password</h2>
            <p className="loginSub">Enter your email and we will send a reset PIN.</p>

            {error && <div className="loginError">{error}</div>}
            {success && <div className="loginSuccess">{success}</div>}

            <div className="loginField">
              <label>Email Address</label>
              <input
                type="email"
                autoFocus
                placeholder="name@example.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleForgot()}
              />
            </div>

            <button className="loginBtn" onClick={handleForgot} disabled={loading}>
              {loading ? "Sending PIN..." : "Send Reset PIN"}
            </button>

            <button type="button" className="backLink" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
              Back to Sign In
            </button>
          </>
        )}

        {mode === "reset" && (
          <>
            <h2 className="loginTitle">Reset Password</h2>
            <p className="loginSub">Enter the 6-digit PIN from your email.</p>

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
                inputMode="numeric"
                maxLength="6"
                placeholder="123456"
                value={resetForm.pin}
                onChange={e => setResetForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, "") }))}
              />
            </div>

            <div className="loginField">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Create a new password"
                value={resetForm.password}
                onChange={e => setResetForm(p => ({ ...p, password: e.target.value }))}
              />
            </div>

            <div className="loginField">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your new password"
                value={resetForm.confirmPassword}
                onChange={e => setResetForm(p => ({ ...p, confirmPassword: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleReset()}
              />
            </div>

            <button className="loginBtn" onClick={handleReset} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button type="button" className="backLink" onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
              Cancel and Back to Sign In
            </button>
          </>
        )}
      </div>

      {legalModal && (
        <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </div>
  );
}
