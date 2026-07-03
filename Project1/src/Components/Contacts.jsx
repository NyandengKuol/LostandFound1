import { useState } from "react"
import contactBg from "../assets/contact-bg.png"

const SUPPORT_EMAIL = "suuportlostfound@gmail.com"

export default function Contacts() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    channel: "",
    subject: "",
    message: ""
  })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null) // { type: "success"|"error", text: "..." }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openMailto = () => {
    const mailtoSubject = encodeURIComponent(formData.subject || "Contact from Lost & Found")
    const mailtoBody = encodeURIComponent(
      [
        `Name: ${formData.name || ""}`,
        `Email: ${formData.email || ""}`,
        `Preferred contact channel: ${formData.channel || "Not selected"}`,
        "",
        formData.message || "",
      ].join("\n")
    )
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)

    try {
      const res = await fetch("http://localhost:4000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Could not send message")

      setStatus({ type: "success", text: "Message sent successfully! We'll get back to you soon." })

      setFormData({
        name: "",
        email: "",
        channel: "",
        subject: "",
        message: ""
      })
    } catch (error) {
      setStatus({
        type: "error",
        text: "Could not send via the website. Click the button below to open your email app instead."
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="contactPage">

      {/* HERO BANNER */}
      <div className="contactHeroBanner" style={{ backgroundImage: `url(${contactBg})` }}>
        <div className="contactHeroOverlay">
          <span className="badge">WE'RE HERE TO HELP</span>
          <p className="contactHeroLabel">CONTACT</p>
          <h1>Reach out to our team for help</h1>
          <p className="contactHeroSub">
            Need help with lost items, reports, or partnerships? Our team is ready to support you.
          </p>
        </div>
      </div>

      <div className="contactContainer">

        {/* LEFT SIDE */}
        <div className="contactInfo">

          <div className="infoCard">
            <h3>Phone</h3>
            <a href="tel:+254700123456">+254 700 123 456</a>
            <p>Mon - Fri, 8:00 AM - 5:00 PM</p>
          </div>

          <div className="infoCard">
            <h3>Email</h3>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <p>We reply within 24 hours</p>
          </div>

          <div className="infoCard">
            <h3>WhatsApp</h3>
            <a href="https://wa.me/254700123456" target="_blank" rel="noreferrer">
              Chat with us
            </a>
            <p>Fast support response</p>
          </div>

          <div className="infoCard">
            <h3>💬 Quick Chat</h3>
            <p>
              Want to chat directly? Send us an email at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} style={{ fontWeight: 700, color: "#1976d2" }}>
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>

          <div className="infoCard highlight">
            <h3>Support Note</h3>
            <p>
              For lost items, always include item name, description, location, and date.
            </p>
          </div>

        </div>

        {/* RIGHT SIDE FORM */}
        <form className="contactForm" onSubmit={handleSubmit}>

          {status && (
            <div className={`formStatus ${status.type}`}>
              <span>{status.text}</span>
              {status.type === "error" && (
                <button type="button" onClick={openMailto} className="mailtoFallback">
                  📧 Open Email App
                </button>
              )}
            </div>
          )}

          <div className="row">
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <select name="channel" value={formData.channel} onChange={handleChange}>
            <option value="">Preferred Contact Channel</option>
            <option>Email</option>
            <option>Phone</option>
            <option>WhatsApp</option>
          </select>

          <input
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </button>

          <div className="directEmail">
            Or email us directly at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </div>

        </form>

      </div>

      {/* FOOTER STRIP */}
      <div className="contactFooter">
        <div>⚡ Fast Response</div>
        <div>🔒 Secure & Private</div>
        <div>💬 Expert Support</div>
        <div>❤️ Student First</div>
      </div>

    </section>
  )
}

