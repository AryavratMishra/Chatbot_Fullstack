import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat }) => {
  if (chat.hideInChat) return null;
  const isBot = chat.role === "model";
  return (
    <div
      className={`message ${isBot ? "bot-message" : "user-message"} ${
        chat.isError ? "error" : ""
      }`}
    >
      {isBot && <ChatbotIcon />}
      <p className="message-text">{chat.text ?? " "}</p>
    </div>
  );
};

export default ChatMessage;
