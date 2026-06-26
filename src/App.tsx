import { useEffect, useState } from "react";
import "./App.css";
import AuthScreen from "./components/AuthScreen";
import MainLayout from "./components/MainLayout";
import { fetchMe } from "./services/api";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("filona-token"));
  const [username, setUsername] = useState<string | null>(localStorage.getItem("filona-username"));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      if (!token) {
        setReady(true);
        return;
      }

      try {
        const response = await fetchMe(token);
        setUsername(response.user.username);
      } catch {
        localStorage.removeItem("filona-token");
        localStorage.removeItem("filona-username");
        setToken(null);
        setUsername(null);
      } finally {
        setReady(true);
      }
    };

    restore();
  }, [token]);

  const onAuthenticated = (nextToken: string, nextUsername: string) => {
    localStorage.setItem("filona-token", nextToken);
    localStorage.setItem("filona-username", nextUsername);
    setToken(nextToken);
    setUsername(nextUsername);
  };

  if (!ready) return null;
  if (!token || !username) return <AuthScreen onAuthenticated={onAuthenticated} />;

  return <MainLayout username={username} token={token} />;
}