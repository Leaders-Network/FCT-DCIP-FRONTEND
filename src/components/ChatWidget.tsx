"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";

export default function ChatWidget() {
  const iconSize = 56;
  const lightBg = "#fffbea";
  const brandColor = "#25D366";

  const quickOptions = [
    "I have a problem with Signup/Register",
    "I have a problem with Login",
    "It's not verifying me",
  ];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const whatsappNumber = "2348060060826";
    const baseUrl = `https://wa.me/${whatsappNumber}`;

    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, text]);
      setTyping(false);
      setMessage("");
      window.open(`${baseUrl}?text=${encodeURIComponent(text)}`, "_blank");
    }, 800);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none flex flex-col items-end gap-3">
      {/* Chat modal — always above the icon */}
      {open && (
        <div
          className="w-80 max-w-[calc(100vw-40px)] h-[350px] bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden"
          style={{ borderTop: `3px solid ${brandColor}` }}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-green-500 text-white p-3">
            <div className="flex items-center gap-2">
              <Image
                src="/agent-avatar.jpg"
                alt="Agent"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
              <h4 className="text-sm font-semibold">Builders Liability Support</h4>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Chat body */}
          <div className="p-4 h-56 overflow-y-auto text-sm space-y-3 bg-gray-50 flex flex-col">
            {messages.map((msg, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-white shadow-sm self-start">
                {msg}
              </div>
            ))}

            {typing && (
              <div
                className="text-gray-700 px-3 py-2 rounded-lg inline-block shadow-sm"
                style={{ backgroundColor: lightBg }}
              >
                <div className="flex space-x-1 mb-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-xs text-gray-500">Typing...</span>
              </div>
            )}

            {!messages.length && !typing && (
              <p
                className="text-gray-700 px-3 py-2 rounded-lg inline-block shadow-sm"
                style={{ backgroundColor: lightBg }}
              >
                👋 Hello! How can we assist you today?
              </p>
            )}

            {/* Quick options */}
            {!typing && (
              <div className="flex flex-col items-start gap-2 mt-2">
                {quickOptions.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(option)}
                    className="text-gray-800 px-4 py-2 rounded-2xl text-left w-auto max-w-[90%] shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: lightBg, border: `1px solid ${brandColor}` }}
                  >
                    💬 {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-3 flex gap-2 bg-white">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(message)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <button
              onClick={() => sendMessage(message)}
              className="bg-green-500 text-white px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-green-300"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Chat icon */}
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full flex items-center justify-center text-white shadow-lg transition hover:scale-105 flex-shrink-0"
        style={{
          backgroundColor: brandColor,
          width: iconSize,
          height: iconSize,
        }}
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
}
