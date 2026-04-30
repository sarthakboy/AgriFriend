import { useEffect, useState, useRef } from "react";
import "./HeroPage.css";

const WORDS = ["Smarter", "Greener", "Stronger", "Profitable"];

export default function HeroPage() {
  const [wordIndex, setWordIndex]   = useState(0);
  const [visible, setVisible]       = useState(true);
  const [scrolled, setScrolled]     = useState(false);
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });
  const heroRef                     = useRef(null);

  // Cycle through words
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth  - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const handleScrollDown = () => {
    const mapSection = document.getElementById("map-section");
    if (mapSection) mapSection.scrollIntoView({ behavior: "smooth" });
  };

  const handleContact = () => {
    const phone   = "919876543210";
    const message = encodeURIComponent("Hi AgriFriend! I have a question about farming.");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="hero" ref={heroRef}>

      {/* ── Background ── */}
      <div
        className="hero__bg"
        style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px) scale(1.05)` }}
      />
      <div className="hero__overlay" />
      <div className="hero__grain" />

      {/* ── Floating orbs ── */}
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      {/* ── Navbar ── */}
      <nav className={`hero__nav ${scrolled ? "scrolled" : ""}`}>
        <div className="hero__nav-inner">
          <div className="hero__logo">
            <div className="hero__logo-icon">🌿</div>
            <span className="hero__logo-name">AgriFriend</span>
          </div>
          <div className="hero__nav-links">
            <a href="#map-section" onClick={(e) => { e.preventDefault(); handleScrollDown(); }}>
              Explore Map
            </a>
            <button className="hero__contact-btn" onClick={handleContact}>
              Contact Us
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Content ── */}
      <div className="hero__content">

        {/* Tag */}
        <div className="hero__tag">
          <span className="hero__tag-dot" />
          <span>AI-POWERED FARMING INTELLIGENCE</span>
        </div>

        {/* Heading */}
        <h1 className="hero__heading">
          <span className="hero__heading-line">Farming</span>
          <span className="hero__heading-line">
            <span className={`hero__word ${visible ? "visible" : "hidden"}`}>
              {WORDS[wordIndex]}
            </span>
          </span>
          <span className="hero__heading-line hero__heading-line--sub">
            with <em>AI</em>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          Live weather · Soil health · AI crop recommendations
          <br />
          for every state across India — all in one place.
        </p>

        {/* Stats row */}
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-num">36+</span>
            <span className="hero__stat-label">States & UTs</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">Live</span>
            <span className="hero__stat-label">Weather Data</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <span className="hero__stat-num">AI</span>
            <span className="hero__stat-label">Crop Advisor</span>
          </div>
        </div>

        {/* CTA */}
        <div className="hero__cta">
          <button className="hero__scroll-btn" onClick={handleScrollDown}>
            <span>Explore the Map</span>
            <span className="hero__scroll-btn-arrow">↓</span>
          </button>
        </div>

      </div>

      {/* ── Live Badge ── */}
      <div className="hero__live-badge">
        <div className="hero__live-dot" />
        <span>LIVE DATA · INDIA</span>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="hero__scroll-indicator" onClick={handleScrollDown}>
        <div className="hero__scroll-line" />
      </div>

    </div>
  );
}
