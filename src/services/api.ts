import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    return 'http://127.0.0.1:3001/api';
  }

  return `http://${host}:3001/api`;
};

const API_URL = getApiBaseUrl();

const client = axios.create({ baseURL: API_URL });

export async function registerUser(username: string, password: string) {
  const { data } = await client.post('/register', { username, password });
  return data;
}

export async function loginUser(username: string, password: string) {
  const { data } = await client.post('/login', { username, password });
  return data;
}

export async function fetchMe(token: string) {
  const { data } = await client.get('/me', { params: { token } });
  return data;
}

export async function fetchUsers(token: string) {
  const { data } = await client.get('/users', { params: { token } });
  return data;
}
