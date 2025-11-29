import { useRef, useEffect } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();
  const hasCalledRef = useRef(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    // Just add user message and thinking placeholder - don't call API yet
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: userMessage },
      { role: "model", text: "Thinking..." },
    ]);
    hasCalledRef.current = false;
  };

  // Call API only when "Thinking..." appears, and only once
  useEffect(() => {
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg?.text === "Thinking..." && !hasCalledRef.current) {
      hasCalledRef.current = true;
      generateBotResponse(chatHistory);
    }
  }, [chatHistory, generateBotResponse]);

  return (
    <form className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button className="material-symbols-rounded">arrow_upward</button>
    </form>
  );
};

export default ChatForm;

