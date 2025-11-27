import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  // ---------------- BOT RESPONSE ----------------
  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    const formatted = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    try {
      const backend =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backend}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formatted }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Server error");
      }

      // -----------------------------------------------------
      //      UNIVERSAL TEXT EXTRACTOR (fix [object Object])
      // -----------------------------------------------------
      function extractText(d) {
        let text = "";

        try {
          const parts = d?.candidates?.[0]?.content?.parts;

          if (Array.isArray(parts)) {
            text = parts
              .map((p) => {
                if (typeof p.text === "string") return p.text;
                if (typeof p.text === "object")
                  return JSON.stringify(p.text, null, 2);
                return "";
              })
              .join("\n");
          }
        } catch {
          text = "";
        }

        if (!text) text = "No response";
        return text.trim();
      }

      const cleanedText = extractText(data);
      updateHistory(cleanedText);
    } catch (err) {
      updateHistory(err.message, true);
    }
  };

  // -------------- AUTO SCROLL -------------------
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  // ----------------- JSX UI --------------------
  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatbot((p) => !p)} id="chatbot-toggler">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="chatbot-popup">
        {/* Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>

          <button
            onClick={() => setShowChatbot((p) => !p)}
            className="material-symbols-rounded"
          >
            keyboard_arrow_down
          </button>
        </div>

        {/* Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there 👋 <br /> How can I help you today?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
