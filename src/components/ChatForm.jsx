import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    // Add user message to history, then add Thinking... and call generator with fresh history
    setChatHistory((prev) => {
      const withUser = [...prev, { role: "user", text: userMessage }];
      // add Thinking placeholder and call generator with that latest history
      const withThinking = [...withUser, { role: "model", text: "Thinking..." }];

      // call backend using freshest history
      generateBotResponse(withThinking);

      return withThinking;
    });
  };

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
