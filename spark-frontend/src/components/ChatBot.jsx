import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const API_URL = `${BASE_URL}/api/chat`;
const ESCALATE_URL = `${BASE_URL}/api/escalate`;
const POLL_URL = `${BASE_URL}/api/escalate/poll`;
const CONTACT_URL = `${BASE_URL}/api/contact`;

const CHAT_LIMIT = 4;
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 4000;
const NO_RESPONSE_TIMEOUT_MS = 10000;
const WHATSAPP_CHAT_LIMIT = 3;

const INITIAL_GREETING = {
  sender: "bot",
  text: "Hello! I am a SparkCurv AI Assistant, How Can I help you?",
};

const EMPTY_ENQUIRY = {
  name: "",
  email: "",
  mobile: "",
  whatsapp: "",
  services: "",
  description: "",
};

export default function ChatBot() {
  const [whatsappMessageCount, setWhatsappMessageCount] = useState(0);
  const [showWhatsappButton, setShowWhatsappButton] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isEscalated, setIsEscalated] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryData, setEnquiryData] = useState(EMPTY_ENQUIRY);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);

  const messagesEndRef = useRef(null);
  const noResponseTimerRef = useRef(null);

  // ─── Scroll to bottom whenever messages change ───────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Session init ─────────────────────────────────────────────────────────
  useEffect(() => {
    let userId = localStorage.getItem("chat_user_id");
    const createdAt = parseInt(
      localStorage.getItem("chat_user_created_at") || "0",
      10
    );

    const isExpired = !createdAt || Date.now() - createdAt > SESSION_DURATION_MS;

    if (!userId || isExpired) {
      // Clean up old keys before generating a new ID
      if (userId) {
        localStorage.removeItem(`chat_count_${userId}`);
        localStorage.removeItem(`wa_count_${userId}`);
      }

      userId = crypto.randomUUID();
      localStorage.setItem("chat_user_id", userId);
      localStorage.setItem("chat_user_created_at", Date.now().toString());
      setMessages([INITIAL_GREETING]);
    }

    const storedCount = parseInt(
      localStorage.getItem(`chat_count_${userId}`) || "0",
      10
    );
    setUserMessageCount(storedCount);

    const alreadyEscalated = storedCount >= CHAT_LIMIT;
    setIsEscalated(alreadyEscalated);

    const whatsappCount = parseInt(
      localStorage.getItem(`wa_count_${userId}`) || "0",
      10
    );
    setWhatsappMessageCount(whatsappCount);

    if (whatsappCount >= WHATSAPP_CHAT_LIMIT) {
      setShowWhatsappButton(true);
      setShowEnquiryForm(true);
    }
  }, []);

  // ─── Show greeting bubble on mount ───────────────────────────────────────
  useEffect(() => {
    setShowGreeting(true);
    const timer = setTimeout(() => setShowGreeting(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // ─── Clean up no-response timer on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current);
    };
  }, []);

  // ─── Poll for WhatsApp replies once escalated ─────────────────────────────
  useEffect(() => {
    if (!isEscalated) return;

    const userId = localStorage.getItem("chat_user_id");

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${POLL_URL}/${userId}`);
        const data = await res.json();

        if (data.replies && data.replies.length > 0) {
          // A human replied — cancel the no-response fallback form
          if (noResponseTimerRef.current) {
            clearTimeout(noResponseTimerRef.current);
            noResponseTimerRef.current = null;
          }

          setShowEnquiryForm(false);
          setMessages((prev) => [
            ...prev,
            ...data.replies.map((text) => ({ sender: "bot", text })),
          ]);
        }
      } catch {
        // Silent fail — polling errors are non-fatal
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isEscalated]);

  // ─── Typewriter effect for bot messages ──────────────────────────────────
  const typeBotMessage = (fullText, speed = 20) => {
    setIsTyping(true);
    setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          text: fullText.slice(0, charIndex),
        };
        return updated;
      });

      if (charIndex >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);
  };

  // ─── Clear the no-response timer safely ──────────────────────────────────
  const clearNoResponseTimer = () => {
    if (noResponseTimerRef.current) {
      clearTimeout(noResponseTimerRef.current);
      noResponseTimerRef.current = null;
    }
  };

  // ─── Start the no-response fallback timer ────────────────────────────────
  const startNoResponseTimer = (lastUserMessage) => {
    clearNoResponseTimer();
    noResponseTimerRef.current = setTimeout(() => {
      setShowEnquiryForm(true);
      setEnquiryData((prev) => ({ ...prev, description: lastUserMessage }));
    }, NO_RESPONSE_TIMEOUT_MS);
  };

  // ─── Send message ─────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setMessage("");

    const userId = localStorage.getItem("chat_user_id");
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);
    localStorage.setItem(`chat_count_${userId}`, newCount.toString());

    // FIX 1: use >= so escalation happens on exactly the CHAT_LIMIT-th message
    const justEscalated = newCount >= CHAT_LIMIT && !isEscalated;

    if (justEscalated || isEscalated) {
      if (justEscalated) {
        setIsEscalated(true);
        typeBotMessage(
          "Connecting you with our support team on WhatsApp — replies will show up right here."
        );
        // FIX 2: always clear any existing timer before setting a new one
        startNoResponseTimer(userMessage);
      }

      // WhatsApp message counter: only increment for messages AFTER the
      // escalation handoff (justEscalated turn itself is not a WA message yet)
      const newWhatsappCount = justEscalated
        ? whatsappMessageCount
        : whatsappMessageCount + 1;

      setWhatsappMessageCount(newWhatsappCount);
      localStorage.setItem(`wa_count_${userId}`, newWhatsappCount.toString());

      if (newWhatsappCount >= WHATSAPP_CHAT_LIMIT) {
        setShowWhatsappButton(true);
        setShowEnquiryForm(true);
        return;
      }

      try {
        await fetch(ESCALATE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, message: userMessage }),
        });
      } catch {
        typeBotMessage("Couldn't reach our support team. Please try again.");
      }

      return;
    }

    // ── Normal AI chat ────────────────────────────────────────────────────
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, question: userMessage }),
      });
      const data = await response.json();
      typeBotMessage(data.answer || "No response received.");
    } catch {
      typeBotMessage("Unable to connect to AI service.");
    }
  };

  // ─── Enquiry form helpers ─────────────────────────────────────────────────
  const handleEnquiryChange = (field) => (e) => {
    setEnquiryData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submitEnquiry = async () => {
    if (!enquiryData.name || !enquiryData.email || !enquiryData.mobile) {
      typeBotMessage(
        "Please fill in at least your name, email, and mobile number."
      );
      return;
    }

    const wordCount = enquiryData.description
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (wordCount > 200) {
      typeBotMessage(
        "Your description is too long. Please keep it under 200 words."
      );
      return;
    }

    setEnquirySubmitting(true);

    try {
      const res = await fetch(CONTACT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryData),
      });

      if (!res.ok) {
        const err = await res.json();
        typeBotMessage(
          err.detail ||
            "Something went wrong submitting your details. Please try again."
        );
        return;
      }

      setShowEnquiryForm(false);
      setEnquiryData(EMPTY_ENQUIRY);
      typeBotMessage(
        "Thanks! We've received your details and our team will reach out to you shortly."
      );
    } catch {
      typeBotMessage(
        "Something went wrong submitting your details. Please try again."
      );
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // FIX 3: clear any existing timer before starting a fresh one
  const keepWaiting = () => {
    setShowEnquiryForm(false);
    clearNoResponseTimer();
    noResponseTimerRef.current = setTimeout(() => {
      setShowEnquiryForm(true);
    }, NO_RESPONSE_TIMEOUT_MS);
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/919600265028", "_blank");
  };

  // ─── Shared enquiry form fields ───────────────────────────────────────────
  const EnquiryFields = () => (
    <>
      <input
        type="text"
        placeholder="Name"
        value={enquiryData.name}
        onChange={handleEnquiryChange("name")}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="email"
        placeholder="Email"
        value={enquiryData.email}
        onChange={handleEnquiryChange("email")}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="Mobile Number"
        value={enquiryData.mobile}
        onChange={handleEnquiryChange("mobile")}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="WhatsApp Number"
        value={enquiryData.whatsapp}
        onChange={handleEnquiryChange("whatsapp")}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="Interested Service"
        value={enquiryData.services}
        onChange={handleEnquiryChange("services")}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <textarea
        rows={4}
        placeholder="Describe your requirement..."
        value={enquiryData.description}
        onChange={handleEnquiryChange("description")}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={submitEnquiry}
          disabled={enquirySubmitting}
          className="flex-1 bg-[#02028B] text-white py-2 rounded-lg disabled:opacity-60"
        >
          {enquirySubmitting ? "Submitting..." : "Submit"}
        </button>
        <button
          onClick={keepWaiting}
          className="flex-1 border border-gray-300 py-2 rounded-lg"
        >
          Keep Waiting
        </button>
      </div>
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Greeting bubble (shown before chat opens) ── */}
      {showGreeting && !open && (
        <>
          <div className="fixed right-28 z-50 w-56 bg-white shadow-xl border rounded-[28px] p-3 top-[calc(50%-130px)]">
            <p className="text-sm text-gray-700">
              Hello! I am a SparkCurv AI Assistant, How Can I help you?
            </p>
          </div>
          <div className="fixed right-20 z-50 w-5 h-5 bg-white border shadow rounded-full top-[calc(50%-60px)]" />
          <div className="fixed right-16 z-50 w-3.5 h-3.5 bg-white border shadow rounded-full top-[calc(50%-42px)]" />
          <div className="fixed right-12 z-50 w-2 h-2 bg-white border shadow rounded-full top-[calc(50%-28px)]" />
        </>
      )}

      {/* ── Floating chatbot button ── */}
      {!open && (
        <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
          <motion.button
            layoutId="chatbot-icon"
            onClick={() => setOpen(true)}
            animate={{ y: [0, -12, 0] }}
            transition={{
              y: {
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut",
              },
              layout: { duration: 0.35 },
            }}
            className="relative p-3"
          >
            <img
              src="/images/logo/chatbot123.png"
              alt="Open chat"
              className="w-16 h-16 object-contain rounded-full"
            />
          </motion.button>
          <motion.div
            animate={{ scaleX: [1, 0.5, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
            className="w-12 h-2 -mt-1 rounded-full bg-black/50 blur-[2px] pointer-events-none"
            style={{ zIndex: -1 }}
          />
        </div>
      )}

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.3, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.3, x: "-50%", y: "-50%" }}
              transition={{ duration: 0.35 }}
              className="fixed top-1/2 left-1/2 z-50 w-[420px] h-[600px] bg-white rounded-xl shadow-2xl border flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#02028B] text-white pt-8 pb-3 px-4 rounded-t-xl flex justify-between items-center">
                <span>SparkCurv AI Assistant</span>
                <button onClick={() => setOpen(false)} aria-label="Close chat">
                  ✕
                </button>
              </div>

              {/* Avatar */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  layoutId="chatbot-icon"
                  className="w-14 h-14 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden"
                >
                  <img
                    src="/images/logo/chatbot_logo.png"
                    alt="SparkCurv bot"
                    className="w-10 h-10 object-contain rounded-full"
                  />
                </motion.div>
              </div>

              {/* Escalation badge */}
              {isEscalated && (
                <div className="px-4 py-2 bg-green-50 border-b text-xs text-green-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Connected with our support team via WhatsApp
                </div>
              )}

              {/* Message list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "ml-auto bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Footer: WhatsApp limit hit ── */}
              {showWhatsappButton ? (
                <div className="p-4 border-t space-y-3 max-h-[320px] overflow-y-auto">
                  <button
                    onClick={openWhatsApp}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-medium"
                  >
                    Continue on WhatsApp
                  </button>
                  <p className="text-sm text-gray-600">
                    Leave your details and our team will contact you.
                  </p>
                  <EnquiryFields />
                </div>
              ) : showEnquiryForm ? (
                /* ── Footer: no-response fallback form ── */
                <div className="p-4 border-t space-y-2 max-h-[280px] overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-1">
                    Our team hasn't responded yet. Leave your details and we'll
                    get back to you.
                  </p>
                  <EnquiryFields />
                </div>
              ) : (
                /* ── Footer: normal input bar ── */
                <div className="p-3 border-t flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isTyping}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isTyping}
                    className="bg-[#02028B] text-white px-4 rounded-lg disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
