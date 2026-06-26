import { useState } from "react";

type SidebarProps = {
  username: string;
};

export default function Sidebar({ username }: SidebarProps) {
  const [active, setActive] = useState("chats");

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-circle">F</div>
        <span>Filona</span>
      </div>

      <div className="sidebar-menu">
        <button className={active === "chats" ? "active" : ""} onClick={() => setActive("chats")}>💬</button>
        <button className={active === "friends" ? "active" : ""} onClick={() => setActive("friends")}>👥</button>
        <button className={active === "premium" ? "active" : ""} onClick={() => setActive("premium")}>⭐</button>
        <button className={active === "settings" ? "active" : ""} onClick={() => setActive("settings")}>⚙️</button>
      </div>

      <div className="profile">
        <div className="avatar-badge">{username[0]?.toUpperCase() || "U"}</div>
        <div className="profile-info">
          <span className="name">{username}</span>
          <span className="status">🟢 Онлайн</span>
        </div>
      </div>
    </div>
  );
}