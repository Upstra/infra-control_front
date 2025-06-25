export const getToken = (): string | null => localStorage.getItem('token');

type TokenChangeCallback = (token: string | null) => void;

const listeners: TokenChangeCallback[] = [];

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
  listeners.forEach((cb) => cb(token));
};

export const clearToken = (): void => {
  localStorage.removeItem('token');
  listeners.forEach((cb) => cb(null));
};

export const onTokenChange = (cb: TokenChangeCallback): void => {
  listeners.push(cb);
};
