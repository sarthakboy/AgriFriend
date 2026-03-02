import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import "./ContactPage.css";

// ── Paste your EmailJS credentials here ───────────────────────
const EMAILJS_SERVICE_ID  = "service_0xp8dpq";
const EMAILJS_TEMPLATE_ID = "template_c180vwa";
const EMAILJS_PUBLIC_KEY  = "https://dashboard.emailjs.com/admin/templates";

export default function ContactPage() {
  const [form, setForm]         = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState(null);
  const [focused, setFocused]   = useState(null);
  const formRef                 = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError(null);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject || "No subject",
          message:    form.message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="contact-page">
        <div className="contact-page__grain" />
        <div className="contact-success">
          <div className="contact-success__icon">🌾</div>
          <h2>Message Sent!</h2>
          <p>Thank you, {form.name}! We'll get back to you at {form.email} within 24 hours.</p>
          <button onClick={() => {
            setSubmitted(false);
            setForm({ name: "", email: "", subject: "", message: "" });
          }}>
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <div className="contact-page__grain" />

      {/* Back button */}
      <button className="contact-back" onClick={() => window.history.back()}>
        ← Back
      </button>

      <div className="contact-container">

        {/* Left Info */}
        <div className="contact-info">
          <div className="contact-info__tag">📬 GET IN TOUCH</div>
          <h1 className="contact-info__title">
            Let's Talk<br />
            <span className="accent">Farming</span>
          </h1>
          <p className="contact-info__desc">
            Have questions about AgriFriend? Want to partner with us?
            We'd love to hear from you.
          </p>

          <div className="contact-info__items">
            <div className="contact-info__item">
              <span className="contact-info__item-icon">📧</span>
              <div>
                <p className="contact-info__item-label">Email</p>
                <p className="contact-info__item-value">hello@agrifriend.in</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__item-icon">📞</span>
              <div>
                <p className="contact-info__item-label">Phone</p>
                <p className="contact-info__item-value">+91 98765 43210</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__item-icon">📍</span>
              <div>
                <p className="contact-info__item-label">Location</p>
                <p className="contact-info__item-value">Pune, Maharashtra, India</p>
              </div>
            </div>
          </div>

          <div className="contact-info__socials">
            <a href="#" className="contact-social">𝕏</a>
            <a href="#" className="contact-social">in</a>
            <a href="#" className="contact-social">gh</a>
          </div>
        </div>

        {/* Right Form */}
        <div className="contact-form-wrap">
          <div className="contact-form-card">
            <h3 className="contact-form-card__title">Send a Message</h3>
            <p className="contact-form-card__sub">We reply within 24 hours</p>

            <div className="contact-form" ref={formRef}>

              <div className="contact-form__row">
                <div className={`contact-form__field ${focused === "name" ? "focused" : ""}`}>
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    placeholder="Ramesh Kumar"
                  />
                </div>
                <div className={`contact-form__field ${focused === "email" ? "focused" : ""}`}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="ramesh@example.com"
                  />
                </div>
              </div>

              <div className={`contact-form__field ${focused === "subject" ? "focused" : ""}`}>
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  onFocus={() => setFocused("subject")}
                  onBlur={() => setFocused(null)}
                  placeholder="Question about crop recommendations..."
                />
              </div>

              <div className={`contact-form__field ${focused === "message" ? "focused" : ""}`}>
                <label>Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  placeholder="Tell us how we can help you..."
                  rows={5}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="contact-form__error">⚠️ {error}</div>
              )}

              <button
                className="contact-form__submit"
                onClick={handleSubmit}
                disabled={!form.name || !form.email || !form.message || sending}
              >
                {sending ? (
                  <>
                    <div className="contact-form__spinner" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <span className="contact-form__submit-arrow">→</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}