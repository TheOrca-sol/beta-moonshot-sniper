// src/AuthContext.js

import { createContext } from 'react';

export const AuthContext = createContext({
  auth: false,
  setAuth: () => {},
  token: null,
  setToken: () => {}
});
