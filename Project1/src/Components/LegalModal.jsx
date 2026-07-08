import React from "react";
import "./GoogleSignInModal.css"; // We'll keep using the same CSS file for the legal modal

export function LegalModal({ type, onClose }) {
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
