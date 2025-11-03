"use client";
import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [message, setMessage] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  const brandColor = "#25D366"; // WhatsApp green
  const brandHover = "#1ebe5d";
  const lightBg = "#fffbea";

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open) {
      setShowTyping(true);
      const typingTimer = setTimeout(() => {
        setShowTyping(false);
        setShowGreeting(true);
      }, 2000);
      return () => clearTimeout(typingTimer);
    } else {
      setShowGreeting(false);
      setShowPrompt(true);
      setShowTyping(false);
    }
  }, [open]);

  useEffect(() => {
    const savedMessage = localStorage.getItem("chatMessage");
    if (savedMessage) setMessage(savedMessage);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessage", message);
  }, [message]);

  const whatsappNumber = "2348124106198";
  const baseUrl = `https://wa.me/${whatsappNumber}`;

  const handleSend = (customMessage) => {
    const textToSend = typeof customMessage === "string" ? customMessage : message;
    if (!textToSend.trim()) {
      window.open(baseUrl, "_blank");
      return;
    }
    const encodedMessage = encodeURIComponent(textToSend);
    window.open(`${baseUrl}?text=${encodedMessage}`, "_blank");
  };

  const quickOptions = [
    "I have a problem with Signup/Register",
    "I have a problem with Login",
    "It's not verifying me",
  ];

  return (
    <div className="fixed bottom-1 right-6 z-50 flex flex-col items-end space-y-3 font-sans">
      {/* 💬 Show Prompt only on md+ screens */}
      {showPrompt && !open && (
        <div
          onClick={() => setOpen(true)}
          className="hidden md:flex bg-white shadow-md border border-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-800 items-center gap-2 animate-fadeIn mb-2 cursor-pointer hover:shadow-lg transition"
        >
          <span>Need Expert Advice? We're Here 👋</span>
        </div>
      )}

      {/* Chat Box */}
      {open && (
        <div
          className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 mb-3 overflow-hidden animate-fadeInUp max-sm:w-[90vw]"
          style={{ borderTop: `3px solid ${brandColor}` }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center text-white px-4 py-3"
            style={{ backgroundColor: brandColor }}
          >
            <div className="flex items-center gap-2">
              <Image
                src="/agent-avatar.jpg"
                alt="Support Agent"
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                width={32}
                height={32}
              />
              <div>
                <h4 className="font-semibold text-sm">DCIP Support</h4>
                <p className="text-xs opacity-90">Online now ✨</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-80">
              <X size={18} />
            </button>
          </div>

          {/* Message Area */}
          <div className="p-4 h-56 overflow-y-auto text-sm space-y-3 bg-gray-50">
            {showTyping && (
              <div
                className="text-gray-700 px-3 py-2 rounded-lg inline-block shadow-sm flex items-center gap-2"
                style={{ backgroundColor: lightBg }}
              >
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                </div>
                <span className="text-xs text-gray-500">Typing...</span>
              </div>
            )}

            {showGreeting && (
              <p
                className="text-gray-700 px-3 py-2 rounded-lg inline-block shadow-sm"
                style={{ backgroundColor: lightBg }}
              >
                👋 Hello! How can we assist you today?
              </p>
            )}

            {showGreeting && (
              <div className="flex flex-col items-start gap-2 mt-2">
                {quickOptions.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(option)}
                    className="text-gray-800 px-4 py-2 rounded-2xl text-left w-auto max-w-[90%] shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: lightBg,
                      border: `1px solid ${brandColor}`,
                    }}
                  >
                    💬 {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-3 flex gap-2 bg-white">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-1"
              style={{ focusRing: brandColor }}
            />
            <button
              onClick={() => handleSend()}
              className="text-white px-4 py-2 rounded-full text-sm font-medium transition shadow-sm"
              style={{
                backgroundColor: brandColor,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = brandHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = brandColor)
              }
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Button (always visible) */}
      <button
        onClick={() => setOpen(!open)}
        className="text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: brandColor }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = brandHover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = brandColor)
        }
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
}
