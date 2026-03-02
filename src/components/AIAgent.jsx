import { useState, useRef, useEffect } from "react";
import "./AIAgent.css";

export default function AIAgent({ selectedState, weatherData, soilData, registerOpen }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const messagesEndRef          = useRef(null);

  // Register open function so App.jsx can open chat from outside
  useEffect(() => {
    if (registerOpen) registerOpen(() => setIsOpen(true));
  }, [registerOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When state changes, reset chat with welcome message
  useEffect(() => {
    if (selectedState) {
      setMessages([
        {
          role: "assistant",
          content: `👋 Hello! I'm AgriFriend AI.\n\nI can see you've selected **${selectedState}**. I have access to the live weather and soil data for this region.\n\nAsk me anything — crop recommendations, fertilizer advice, irrigation tips, pest warnings, and more!`,
        },
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content: "👋 Hello! I'm AgriFriend AI.\n\nClick any state on the map and I'll give you region-specific farming advice based on live weather and soil data!",
        },
      ]);
    }
  }, [selectedState]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          state:    selectedState || null,
          weather:  weatherData   || null,
          soil:     soilData      || null,
        }),
      });

      if (!res.ok) throw new Error("Agent error");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Could not connect to AI. Is FastAPI running?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderText = (text) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );

  return (
    <>
      {/* ── Chat Window ── */}
      <div className={`agent-window ${isOpen ? "open" : ""}`}>

        {/* Header */}
        <div className="agent-window__header">
          <div className="agent-window__header-left">
            <div className="agent-window__avatar">🌿</div>
            <div>
              <p className="agent-window__name">AgriFriend AI</p>
              <p className="agent-window__status">
                {selectedState ? `📍 ${selectedState}` : "Select a state on map"}
              </p>
            </div>
          </div>
          <button className="agent-window__close" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="agent-window__messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`agent-msg ${msg.role === "user" ? "agent-msg--user" : "agent-msg--ai"}`}
            >
              {msg.role === "assistant" && (
                <div className="agent-msg__avatar">🌿</div>
              )}
              <div className="agent-msg__bubble">
                {renderText(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="agent-msg agent-msg--ai">
              <div className="agent-msg__avatar">🌿</div>
              <div className="agent-msg__bubble agent-msg__typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="agent-window__input-wrap">
          <textarea
            className="agent-window__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about crops, soil, weather..."
            rows={1}
          />
          <button
            className="agent-window__send"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            ➤
          </button>
        </div>

      </div>

      {/* ── Floating Button ── */}
      <button
        className={`agent-fab ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="AgriFriend AI"
      >
        {isOpen ? "✕" : "🤖"}
        {!isOpen && <span className="agent-fab__pulse" />}
      </button>
    </>
  );
}