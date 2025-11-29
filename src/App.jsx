import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";

const App = () => {
  // System instruction stored inside history BUT hidden
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "system",
      text: companyInfo,
    },
  ]);

  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  // ---------------- BOT RESPONSE (FIXED MEMORY) ----------------
  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    // EXTRACT THE SYSTEM INSTRUCTION
    const systemPrompt = history.find((msg) => msg.hideInChat)?.text || "";

    // BUILD FULL CHAT CONTEXT (excluding system instruction)
    const conversation = history
      .filter((msg) => !msg.hideInChat)
      .map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

    // ADD LATEST USER MESSAGE
    const latestUserMessage = history[history.length - 1].text;

const finalPrompt = `
SYSTEM INSTRUCTION:
${systemPrompt}

Your reply MUST follow these rules:
- Keep it short (2-5 sentences max)
- Do greet  (no “Hello I’m Buzzo and some introduction”)
- Be direct and concise
- No long paragraphs, no marketing tone

CONVERSATION SO FAR:
${conversation
  .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
  .join("\n")}

LATEST USER MESSAGE:
${latestUserMessage}

Respond concisely as Buzzo.
`;


    try {
      const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${backend}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalPrompt }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Server error");

      // Extract clean text
      const parts = data?.candidates?.[0]?.content?.parts;
      const cleanedText = parts?.map((p) => p.text).join("\n") || "No response";

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

          {/* Render only messages NOT hidden */}
          {chatHistory
            .filter((msg) => !msg.hideInChat)
            .map((chat, index) => (
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
