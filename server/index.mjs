import express from 'express';
import cors from 'cors';
import http from 'http';
import { createHash, randomUUID } from 'crypto';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: '*' }));
app.use(express.json());

const users = new Map();
const sessions = new Map();
const rooms = new Map();
const onlineUsers = new Set();

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

function createToken() {
  return randomUUID();
}

function getRoomMessages(room) {
  if (!rooms.has(room)) rooms.set(room, []);
  return rooms.get(room);
}

function emitUserList() {
  const list = Array.from(onlineUsers).map((username) => ({ username }));
  io.emit('users', list);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'filona' });
});

app.post('/api/register', (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();

  if (!username || !password || password.length < 3) {
    return res.status(400).json({ error: 'Имя и пароль обязательны, пароль минимум 3 символа.' });
  }

  if (users.has(username)) {
    return res.status(409).json({ error: 'Пользователь уже существует.' });
  }

  const user = {
    username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.set(username, user);
  const token = createToken();
  sessions.set(token, username);

  res.json({ token, user: { username } });
});

app.post('/api/login', (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();

  const user = users.get(username);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Неверный логин или пароль.' });
  }

  const token = createToken();
  sessions.set(token, username);
  res.json({ token, user: { username } });
});

app.post('/api/logout', (req, res) => {
  const token = String(req.body?.token || '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const token = String(req.query.token || '');
  const username = sessions.get(token);
  if (!username) {
    return res.status(401).json({ error: 'Не авторизован.' });
  }

  res.json({ user: { username } });
});

app.get('/api/users', (req, res) => {
  const token = String(req.query.token || '');
  const username = sessions.get(token);
  if (!username) {
    return res.status(401).json({ error: 'Не авторизован.' });
  }

  const list = Array.from(users.keys()).map((name) => ({ username: name }));
  res.json({ users: list });
});

io.on('connection', (socket) => {
  const token = socket.handshake.auth?.token || '';
  const username = sessions.get(token);

  if (!username) {
    socket.disconnect();
    return;
  }

  socket.username = username;
  onlineUsers.add(username);
  emitUserList();

  socket.on('join', ({ room = 'filona' }) => {
    socket.join(room);
    const history = getRoomMessages(room);
    socket.emit('history', history);
  });

  socket.on('message', ({ room = 'filona', text }) => {
    const safeText = String(text || '').trim();
    if (!safeText) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: socket.username,
      text: safeText,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    const roomMessages = getRoomMessages(room);
    roomMessages.push(message);
    if (roomMessages.length > 200) roomMessages.splice(0, roomMessages.length - 200);

    io.to(room).emit('message', message);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      emitUserList();
    }
  });
});

const port = Number(process.env.PORT || 3001);
server.listen(port, '0.0.0.0', () => {
  console.log(`Filona server ready on http://127.0.0.1:${port}`);
});
