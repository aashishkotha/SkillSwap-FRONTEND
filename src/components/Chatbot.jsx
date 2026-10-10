import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm your SkillSwap AI assistant. Ask me how to match, exchange skills, or coordinate meeting channels!"
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const quickPrompts = [
    "How does skill matching work?",
    "How do we connect after accepting?",
    "How do I propose a swap?",
    "What is barter exchange?"
  ];

  const handleSend = async (textToSend) => {
    const query = (textToSend || message).trim();
    if (!query) return;

    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      // Call backend AI chatbot API
      const response = await api.post("/chatbot", { message: query });
      const replyText = response.data?.reply || fallbackReply(query);
      setMessages((prev) => [...prev, { sender: "bot", text: replyText }]);
    } catch {
      // Fallback in case of server hiccup
      const localReply = fallbackReply(query);
      setMessages((prev) => [...prev, { sender: "bot", text: localReply }]);
    } finally {
      setLoading(false);
    }
  };

  const fallbackReply = (input) => {
    const text = input.toLowerCase();
    if (text.includes("connect") || text.includes("meet") || text.includes("contact")) {
      return "When proposing a swap, select your preferred platform (Google Meet, Discord, Zoom, WhatsApp, etc.). Once accepted, you can click the direct room link or copy details right on the swap card!";
    }
    if (text.includes("swap") || text.includes("barter")) {
      return "A skill swap is a 1-to-1 barter exchange. You teach a skill you excel at, and learn something you need in return without paying money.";
    }
    if (text.includes("match") || text.includes("ai")) {
      return "Skill matching scans the skills you teach against skills other members want to learn, calculating compatibility scores and reasons.";
    }
    return "You can explore peers, inspect their teach/learn chips, send a barter proposal with your meeting info, and begin learning together!";
  };

  if (!open) {
    return (
      <button
        className="chatbot-trigger-btn"
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant"
      >
        <span>🤖</span>
        <span>AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="chatbot-modal" role="dialog" aria-label="AI Assistant">
      <div className="chatbot-head">
        <div className="chatbot-head-title">
          <span>🤖</span>
          <span>SkillSwap Assistant</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Assistant"
        >
          ✕
        </button>
      </div>

      <div className="chatbot-body">
        {messages.map((item, index) => (
          <div
            key={index}
            className={`chat-bubble ${item.sender}`}
          >
            {item.text}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble bot" style={{ fontStyle: "italic", opacity: 0.7 }}>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 3 && (
        <div className="chat-quick-tags">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              className="quick-tag-btn"
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        className="chatbot-foot"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          value={message}
          placeholder="Ask a question..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!message.trim() || loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbot;