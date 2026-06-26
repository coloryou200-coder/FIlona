import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { fetchUsers } from "../services/api";

type Message = {
  id: string;
  from: string;
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

type MainLayoutProps = {
  username: string;
  token: string;
};

export default function MainLayout({ username, token }: MainLayoutProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await fetchUsers(token);
      setUsers(response.users.map((user: { username: string }) => user.username));
    };

    loadUsers();
  }, [token]);

  useEffect(() => {
    const client = io("http://127.0.0.1:3001", { auth: { token } });
    setSocket(client);

    client.on("connect", () => {
      client.emit("join", { room: "filona" });
    });

    client.on("history", (history: Message[]) => {
      setRoomMessages(history);
    });

    client.on("message", (message: Message) => {
      setRoomMessages((prev) => [...prev, message]);
    });

    return () => {
      client.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const nextChats = users
      .filter((name) => name !== username)
      .map((name, index) => ({
        id: index + 1,
        name,
        avatar: name[0].toUpperCase(),
        status: "в сети",
        preview: "Нажмите, чтобы открыть чат",
        messages: [],
      }));

    setChats(nextChats);
    if (!activeChatId && nextChats[0]) {
      setActiveChatId(nextChats[0].id);
    }
  }, [users, username, activeChatId]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? null,
    [activeChatId, chats]
  );

  const handleSendMessage = (text: string) => {
    if (!socket || !activeChat) return;
    socket.emit("message", { room: "filona", text });
  };

  const mappedMessages = useMemo(() => {
    if (!activeChat) return [];
    return roomMessages
      .filter((message) => message.from === username || message.from === activeChat.name)
      .map((message) => ({
        ...message,
        from: message.from === username ? "me" : "friend",
      }));
  }, [activeChat, roomMessages, username]);

  return (
    <div className="layout">
      <Sidebar username={username} />
      <ChatList
        chats={chats.map((chat) => ({
          ...chat,
          preview: chat.preview,
        }))}
        activeChatId={activeChatId ?? null}
        onSelectChat={setActiveChatId}
      />
      <ChatWindow
        chat={activeChat ? {
          ...activeChat,
          messages: mappedMessages.map((message) => ({
            id: message.id,
            from: message.from as "me" | "friend",
            text: message.text,
            time: message.time,
          })),
          preview: activeChat.preview,
        } : null}
        onSendMessage={handleSendMessage}
        username={username}
      />
    </div>
  );
}