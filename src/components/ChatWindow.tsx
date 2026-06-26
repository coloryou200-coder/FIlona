import { useState } from "react";

type Message = {
  id: string;
  from: "me" | "friend";
  text: string;
  time: string;
};

type Chat = {
  id: number;
  name: string;
  avatar: string;
  status: string;
  preview: string;
  messages: Message[];
};

type ChatWindowProps = {
  chat: Chat | null;
  onSendMessage: (text: string) => void;
  username: string;
};

export default function ChatWindow({ chat, onSendMessage }: ChatWindowProps) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !chat) return;
    onSendMessage(draft.trim());
    setDraft("");
  };

  if (!chat) {
    return (
      <main className="chat-window empty-state">
        <h3>Пока нет активного чата</h3>
        <p>Зарегистрируйте друзей и начинайте переписку в Filona.</p>
      </main>
    );
  }

  return (
    <main className="chat-window">
      <header className="chat-header">
        <div className="avatar-badge large">{chat.avatar}</div>
        <div>
          <h3>{chat.name}</h3>
          <p>{chat.status}</p>
        </div>
      </header>

      <section className="messages">
        {chat.messages.map((message) => (
          <div key={message.id} className={`message ${message.from === "me" ? "me" : "other"}`}>
            <span>{message.text}</span>
            <small>{message.time}</small>
          </div>
        ))}
        {chat.messages.length === 0 ? <p className="empty-hint">Скоро здесь появятся сообщения. Напишите первым.</p> : null}
      </section>

      <form className="input-area" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Написать ${chat.name}...`}
        />
        <button type="submit">➤</button>
      </form>
    </main>
  );
}