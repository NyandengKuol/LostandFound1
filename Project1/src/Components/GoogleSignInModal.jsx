import { useState } from "react";
import "./GoogleSignInModal.css";

/* ─────────────────── Legal Modal ─────────────────── */
function LegalModal({ type, onClose }) {
  const isPrivacy = type === "privacy";

  return (
    <div className="legalOverlay" onClick={onClose}>
      <div className="legalBox" onClick={e => e.stopPropagation()}>
        <div className="legalHeader">
          <div className="legalHeaderIcon">
            {isPrivacy ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            )}
          </div>
          <div className="legalHeaderText">
            <h2>{isPrivacy ? "Privacy Policy" : "Terms of Service"}</h2>
            <p>Lost &amp; Found Platform · Effective: January 1, 2025</p>
          </div>
          <button className="legalClose" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="legalBody">
          {isPrivacy ? (
            <>
              <section className="legalSection">
                <h3>1. Information We Collect</h3>
                <p>We collect information you provide directly to us when you create an account, submit a lost or found item report, or contact us for support. This includes:</p>
                <ul>
                  <li><strong>Account information:</strong> your name, email address, and password (stored as a secure hash).</li>
                  <li><strong>Item reports:</strong> descriptions, photographs, locations, dates, and any contact details you voluntarily include in lost or found postings.</li>
                  <li><strong>Usage data:</strong> pages visited, search queries, device type, browser type, and IP address collected automatically via server logs and cookies.</li>
                  <li><strong>Communications:</strong> emails or messages you send to our support team.</li>
                </ul>
              </section>

              <section className="legalSection">
                <h3>2. How We Use Your Information</h3>
                <p>Your information is used to:</p>
                <ul>
                  <li>Operate and improve the Lost &amp; Found platform and its matching algorithms.</li>
                  <li>Match lost item reports with found item reports and notify relevant parties.</li>
                  <li>Send transactional emails such as account verification, password resets, and item match notifications.</li>
                  <li>Prevent fraud, abuse, and unauthorized access.</li>
                  <li>Comply with applicable laws and regulations.</li>
                </ul>
                <p>We <strong>do not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.</p>
              </section>

              <section className="legalSection">
                <h3>3. Data Sharing</h3>
                <p>We share your data only in the following limited circumstances:</p>
                <ul>
                  <li><strong>With other users:</strong> Your name and contact details on a found-item post may be visible to the person who lost the corresponding item to facilitate reunion.</li>
                  <li><strong>Service providers:</strong> Hosting, email delivery, and analytics partners who process data on our behalf under strict confidentiality agreements.</li>
                  <li><strong>Legal obligations:</strong> When required by law, court order, or governmental authority.</li>
                </ul>
              </section>

              <section className="legalSection">
                <h3>4. Data Retention</h3>
                <p>Account data is retained as long as your account is active. Closed item reports are archived for 12 months, then permanently deleted. You may request deletion of your account and associated data at any time by contacting <a href="mailto:supportlostandfound@gmail.com">supportlostandfound@gmail.com</a>.</p>
              </section>

              <section className="legalSection">
                <h3>5. Security</h3>
                <p>We use industry-standard measures including TLS encryption in transit, bcrypt password hashing, and regular security audits. No system is 100% secure; please use a strong, unique password and notify us immediately of any suspected unauthorized access.</p>
              </section>

              <section className="legalSection">
                <h3>6. Cookies</h3>
                <p>We use essential cookies to maintain your session and preferences. No third-party advertising cookies are used. You may disable cookies in your browser settings, though some features may become unavailable.</p>
              </section>

              <section className="legalSection">
                <h3>7. Children's Privacy</h3>
                <p>Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such data, please contact us immediately.</p>
              </section>

              <section className="legalSection">
                <h3>8. Your Rights</h3>
                <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data; object to or restrict processing; and data portability. Submit requests to <a href="mailto:supportlostandfound@gmail.com">supportlostandfound@gmail.com</a>.</p>
              </section>

              <section className="legalSection">
                <h3>9. Changes to This Policy</h3>
                <p>We may update this Privacy Policy periodically. We will notify registered users via email of material changes at least 14 days in advance. Continued use of the platform after the effective date constitutes acceptance.</p>
              </section>

              <section className="legalSection">
                <h3>10. Contact Us</h3>
                <p>Questions about this Privacy Policy? Contact us at <a href="mailto:supportlostandfound@gmail.com">supportlostandfound@gmail.com</a> or write to Lost &amp; Found Support Team.</p>
              </section>
            </>
          ) : (
            <>
              <section className="legalSection">
                <h3>1. Acceptance of Terms</h3>
                <p>By creating an account or using the Lost &amp; Found platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you may not use the Service.</p>
              </section>

              <section className="legalSection">
                <h3>2. Eligibility</h3>
                <p>You must be at least 13 years old to use the Service. By using the Service, you represent and warrant that you meet this requirement. Users between 13–17 must have parental or guardian consent.</p>
              </section>

              <section className="legalSection">
                <h3>3. Account Responsibilities</h3>
                <ul>
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You agree to provide accurate, current, and complete registration information.</li>
                  <li>You must notify us immediately of any unauthorized use of your account.</li>
                  <li>You may not share your account with others or create accounts on behalf of third parties without authorization.</li>
                </ul>
              </section>

              <section className="legalSection">
                <h3>4. Acceptable Use</h3>
                <p>You agree <strong>not</strong> to:</p>
                <ul>
                  <li>Post false, misleading, or fraudulent lost or found reports.</li>
                  <li>Use the Service to harass, threaten, or defraud other users.</li>
                  <li>Attempt to claim items that do not belong to you.</li>
                  <li>Scrape, crawl, or harvest data from the platform without written permission.</li>
                  <li>Introduce malware, viruses, or other harmful code.</li>
                  <li>Violate any applicable local, national, or international law or regulation.</li>
                </ul>
              </section>

              <section className="legalSection">
                <h3>5. Item Reports & Content</h3>
                <p>You retain ownership of the content you post. By submitting a report, you grant Lost &amp; Found a worldwide, royalty-free license to display, reproduce, and distribute that content solely for operating and improving the Service. You represent that you have all necessary rights to post such content.</p>
              </section>

              <section className="legalSection">
                <h3>6. Reunification Process</h3>
                <p>The Service facilitates connections between users who have lost or found items. We do not guarantee successful reunification. We are not responsible for any dispute, loss, or damage arising from meetings or exchanges arranged through the platform. Exercise personal safety precautions when meeting strangers.</p>
              </section>

              <section className="legalSection">
                <h3>7. Disclaimer of Warranties</h3>
                <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.</p>
              </section>

              <section className="legalSection">
                <h3>8. Limitation of Liability</h3>
                <p>To the fullest extent permitted by law, Lost &amp; Found and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.</p>
              </section>

              <section className="legalSection">
                <h3>9. Termination</h3>
                <p>We reserve the right to suspend or terminate your account at our discretion if you violate these Terms or engage in conduct harmful to other users or the platform. You may delete your account at any time from your account settings or by contacting support.</p>
              </section>

              <section className="legalSection">
                <h3>10. Governing Law</h3>
                <p>These Terms are governed by the laws of the jurisdiction in which Lost &amp; Found operates, without regard to its conflict of law provisions.</p>
              </section>

              <section className="legalSection">
                <h3>11. Changes to Terms</h3>
                <p>We may revise these Terms at any time. We will provide at least 14 days' notice before material changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms.</p>
              </section>

              <section className="legalSection">
                <h3>12. Contact</h3>
                <p>For questions about these Terms, contact us at <a href="mailto:supportlostandfound@gmail.com">supportlostandfound@gmail.com</a>.</p>
              </section>
            </>
          )}
        </div>

        <div className="legalFooter">
          <button className="legalCloseBtn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Google Sign-In Modal ─────────────────── */
// step: "email" | "password" | "create"
export default function GoogleSignInModal({ mode = "signin", onClose, onSuccess }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirm, setNewConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // "privacy" | "terms" | null

  const title = step === "create"
    ? "Create your account"
    : step === "password"
    ? "Welcome"
    : (mode === "signup" ? "Sign up with Google" : "Sign in with Google");

  const subtitle = step === "create"
    ? "Enter your details to get started"
    : step === "password"
    ? email
    : "to continue to Lost & Found";

  const handleEmailNext = () => {
    if (!email.trim()) { setError("Enter an email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    setError("");
    setStep("password");
  };

  const handlePasswordContinue = async () => {
    if (!password.trim()) { setError("Enter your password."); return; }
    setError("");
    setLoading(true);
    try {
      // Call the same Google login endpoint — pass email + password as google-style auth
      const res = await fetch("http://localhost:4000/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: email.split("@")[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("adminToken");
      onSuccess && onSuccess(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim() || !newConfirm.trim()) {
      setError("Please fill in all fields."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("Enter a valid email address."); return;
    }
    if (newPassword !== newConfirm) {
      setError("Passwords do not match."); return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newName, email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Account creation failed");
      // Auto-login after signup via google endpoint
      const loginRes = await fetch("http://localhost:4000/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, name: newName }),
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.removeItem("adminToken");
        onSuccess && onSuccess(loginData.user);
      } else {
        // Signup succeeded but auto-login failed — close and let user sign in manually
        onClose && onClose("signup_success");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="gcOverlay" onClick={onClose}>
        <div className="gcBox" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="gcHeader">
            {/* Google logo */}
            <svg className="gcGoogleLogo" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8
                c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039
                l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
                c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                fill="#FFC107"/>
              <path d="M6.306,14.691l6.571,4.819C14.655,15.108,19.003,12,24,12
                c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4
                C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"/>
              <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238
                C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946
                l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"/>
              <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
                c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24
                C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"/>
            </svg>

            <h3 className="gcTitle">{title}</h3>
            <p className="gcSubtitle">
              {step === "password" ? (
                <span className="gcEmailPill">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  {email}
                </span>
              ) : (
                <>to continue to <strong>Lost &amp; Found</strong></>
              )}
            </p>
          </div>

          {/* Body */}
          <div className="gcBody">
            {error && <div className="gcError">{error}</div>}

            {/* ── Step: email ── */}
            {step === "email" && (
              <div className="gcStep">
                <div className="gcField">
                  <label htmlFor="gc-email">Email address</label>
                  <input
                    id="gc-email"
                    type="email"
                    autoFocus
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleEmailNext()}
                  />
                </div>
                <p className="gcHint">
                  Don't have an account?{" "}
                  <button type="button" className="gcLink" onClick={() => { setError(""); setStep("create"); }}>
                    Create account
                  </button>
                </p>
                <div className="gcActions">
                  <button type="button" className="gcSecBtn" onClick={onClose}>Cancel</button>
                  <button type="button" className="gcPrimBtn" onClick={handleEmailNext} disabled={loading}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: password ── */}
            {step === "password" && (
              <div className="gcStep">
                <div className="gcField gcFieldPassword">
                  <label htmlFor="gc-password">Password</label>
                  <div className="gcPasswordWrap">
                    <input
                      id="gc-password"
                      type={showPassword ? "text" : "password"}
                      autoFocus
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handlePasswordContinue()}
                    />
                    <button
                      type="button"
                      className="gcShowPassword"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <p className="gcHint">
                  <button type="button" className="gcLink" onClick={() => {}}>Forgot password?</button>
                </p>
                <div className="gcActions">
                  <button type="button" className="gcSecBtn" onClick={() => { setStep("email"); setPassword(""); setError(""); }}>Back</button>
                  <button type="button" className="gcPrimBtn" onClick={handlePasswordContinue} disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: create account ── */}
            {step === "create" && (
              <div className="gcStep">
                <div className="gcField">
                  <label htmlFor="gc-new-name">Full name</label>
                  <input
                    id="gc-new-name"
                    type="text"
                    autoFocus
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setError(""); }}
                  />
                </div>
                <div className="gcField">
                  <label htmlFor="gc-new-email">Email address</label>
                  <input
                    id="gc-new-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={newEmail}
                    onChange={e => { setNewEmail(e.target.value); setError(""); }}
                  />
                </div>
                <div className="gcField gcFieldPassword">
                  <label htmlFor="gc-new-password">Create password</label>
                  <div className="gcPasswordWrap">
                    <input
                      id="gc-new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setError(""); }}
                    />
                    <button type="button" className="gcShowPassword" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password">
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="gcField">
                  <label htmlFor="gc-new-confirm">Confirm password</label>
                  <input
                    id="gc-new-confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={newConfirm}
                    onChange={e => { setNewConfirm(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleCreateAccount()}
                  />
                </div>
                <p className="gcTermsNote">
                  By creating an account you agree to our{" "}
                  <button type="button" className="gcLink" onClick={() => setLegalModal("terms")}>Terms of Service</button>
                  {" "}and{" "}
                  <button type="button" className="gcLink" onClick={() => setLegalModal("privacy")}>Privacy Policy</button>.
                </p>
                <div className="gcActions">
                  <button type="button" className="gcSecBtn" onClick={() => { setStep("email"); setError(""); }}>Back</button>
                  <button type="button" className="gcPrimBtn" onClick={handleCreateAccount} disabled={loading}>
                    {loading ? "Creating…" : "Create account"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="gcModalFooter">
            <button type="button" className="gcFooterLink" onClick={() => setLegalModal("privacy")}>Privacy Policy</button>
            <span className="gcFooterDot">·</span>
            <button type="button" className="gcFooterLink" onClick={() => setLegalModal("terms")}>Terms of Service</button>
          </div>
        </div>
      </div>

      {legalModal && (
        <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </>
  );
}
