import { useEffect, useState } from "react";
import "./HeroPage.css";

export default function HeroPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollDown = () => {
    const mapSection = document.getElementById("map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  const handleContact = () => {
    const phone   = "919582563715"; // ← replace with your WhatsApp number
    const message = encodeURIComponent("Hi AgriFriend! I have a question about farming.");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <>
      {/* ── Full-screen Hero ── */}
      <div className="hero">

        {/* Background layers */}
        <div className="hero__bg" />
        <div className="hero__grain" />
        <div className="hero__gradient" />

        {/* Top Bar */}
        <div className="hero__topbar">
          <div className="hero__logo">
            <div className="hero__logo-icon">🌿</div>
            <span className="hero__logo-name">AgriFriend</span>
          </div>
          <button className="hero__contact-btn" onClick={handleContact}>
            Contact Us
          </button>
        </div>

        {/* Hero Content */}
        <div className="hero__content">

          {/* Tag */}
          <div className="hero__tag">
            <span>🌾 AI-POWERED FARMING</span>
          </div>

          {/* Heading */}
          <h1 className="hero__heading">
            Smart Farming for
            <br />
            <span className="accent">Future </span>
            <em>Generations</em>
          </h1>

          {/* Subtitle */}
          <p className="hero__subtitle">
            Explore live weather, soil health, and AI-powered crop advice
            for any region across India — all in one place.
          </p>

          {/* Scroll Down Button */}
          <div className="hero__cta">
            <button className="hero__scroll-btn" onClick={handleScrollDown}>
              Explore the Map
              <span className="arrow-icon">↓</span>
            </button>
          </div>
        </div>

        {/* Live Badge */}
        <div className="hero__live-badge">
          <div className="hero__live-dot" />
          <span>LIVE DATA · INDIA</span>
        </div>

      </div>

     
    </>
  );
}