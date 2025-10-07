import React, { createContext, useContext, useEffect, useState } from 'react';
import { authLogin, authRegister, authMe, setToken, getToken, authLogout, googleAuth } from '../services/api';

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('gs_user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    // Try to restore session from token
    (async () => {
      try {
        if (!getToken()) return;
        const { user } = await authMe();
        if (user) {
          const normalized = { id: user._id || user.id, name: user.name, email: user.email, role: (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1) }
          localStorage.setItem('gs_user', JSON.stringify(normalized))
          setUser(normalized)
        }
      } catch {
        setToken(null)
        localStorage.removeItem('gs_user')
        setUser(null)
      }
    })()
  }, [])

  const login = async ({ email, password }) => {
    const { token, user } = await authLogin({ email, password })
    setToken(token)
    const normalized = { id: user.id, name: user.name, email: user.email, role: (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1) }
    localStorage.setItem('gs_user', JSON.stringify(normalized))
    setUser(normalized)
  }

  const signup = async ({ name, email, password, role }) => {
    // role is expected in lowercase by backend
    const { token, user } = await authRegister({ name, email, password, role: (role || '').toLowerCase() })
    setToken(token)
    const normalized = { id: user.id, name: user.name, email: user.email, role: (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1) }
    localStorage.setItem('gs_user', JSON.stringify(normalized))
    setUser(normalized)
  }

  const googleLogin = async (credential) => {
    const { token, user } = await googleAuth({ credential });
    setToken(token);
    const normalized = { 
      id: user._id || user.id, 
      name: user.name, 
      email: user.email, 
      role: (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1),
      picture: user.picture || user.profilePicture
    };
    localStorage.setItem('gs_user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const logout = async () => {
    try { await authLogout() } catch {}
    localStorage.removeItem('gs_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
