type ChatPreview = {
  id: number;
  name: string;
  avatar: string;
  status: string;
  preview: string;
};

type ChatListProps = {
  chats: ChatPreview[];
  activeChatId: number | null;
  onSelectChat: (id: number) => void;
};

export default function ChatList({ chats, activeChatId, onSelectChat }: ChatListProps) {
  return (
    <aside className="chat-list">
      <div className="chat-list-header">
        <div>
          <p className="eyebrow">Сообщения</p>
          <h3>Друзья</h3>
        </div>
        <button className="ghost-button">＋</button>
      </div>

      <label className="search-box">
        <span>🔎</span>
        <input placeholder="Поиск по друзьям" />
      </label>

      <div className="chat-list-items">
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`chat-item ${activeChatId === chat.id ? "active" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="avatar-badge">{chat.avatar}</div>
            <div className="chat-item-text">
              <div className="chat-item-top">
                <strong>{chat.name}</strong>
                <span>now</span>
              </div>
              <p>{chat.preview}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}