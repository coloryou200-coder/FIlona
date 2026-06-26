import { useState } from 'react';
import type { FormEvent } from 'react';
import { loginUser, registerUser } from '../services/api';

type AuthScreenProps = {
  onAuthenticated: (token: string, username: string) => void;
};

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = mode === 'login'
        ? await loginUser(username, password)
        : await registerUser(username, password);

      onAuthenticated(response.token, response.user.username);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Не удалось выполнить действие.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-circle">F</div>
          <h1>Filona</h1>
          <p>Премиум-мессенджер для переписки с друзьями</p>
        </div>

        <div className="auth-switch">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Вход</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Регистрация</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Имя пользователя" />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Пароль" />
          {error ? <p className="auth-error">{error}</p> : null}
          <button type="submit" disabled={loading}>{loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button>
        </form>
      </div>
    </div>
  );
}
