import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [guestId, setGuestId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('todo_token');
      const storedUser = localStorage.getItem('todo_user');
      const storedGuestId = localStorage.getItem('todo_guest_id');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (storedGuestId) {
        setGuestId(storedGuestId);
        setUser({
          id: storedGuestId,
          name: 'Guest User',
          email: null,
          isGuest: true,
        });
      } else {
        // Auto-assign guest ID for immediate frictionless experience if desired
        const newGuestId = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('todo_guest_id', newGuestId);
        setGuestId(newGuestId);
        setUser({
          id: newGuestId,
          name: 'Guest User',
          email: null,
          isGuest: true,
        });
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async ({ email, password }) => {
    try {
      const currentGuestId = localStorage.getItem('todo_guest_id');
      const data = await api.login({
        email,
        password,
        guestId: currentGuestId,
      });

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('todo_token', data.token);
        localStorage.setItem('todo_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  const registerWithEmail = useCallback(async ({ email, password, name }) => {
    try {
      const currentGuestId = localStorage.getItem('todo_guest_id');
      const data = await api.register({
        email,
        password,
        name,
        guestId: currentGuestId,
      });

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('todo_token', data.token);
        localStorage.setItem('todo_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  const loginWithGoogle = useCallback(async ({ email, name, avatar, googleId }) => {
    try {
      const currentGuestId = localStorage.getItem('todo_guest_id');
      const data = await api.googleAuth({
        email,
        name,
        avatar,
        googleId,
        guestId: currentGuestId,
      });

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('todo_token', data.token);
        localStorage.setItem('todo_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    let existingGuestId = localStorage.getItem('todo_guest_id');
    if (!existingGuestId) {
      existingGuestId = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('todo_guest_id', existingGuestId);
    }

    try {
      await api.guestAuth(existingGuestId);
    } catch (e) {
      console.warn('Backend guest handshake warning:', e.message);
    }

    const guestUser = {
      id: existingGuestId,
      name: 'Guest User',
      email: null,
      isGuest: true,
    };
    setUser(guestUser);
    setGuestId(existingGuestId);
    setToken(null);
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    setToken(null);
    // Return to guest mode seamlessly
    const currentGuestId = localStorage.getItem('todo_guest_id') || 'guest_' + Date.now();
    localStorage.setItem('todo_guest_id', currentGuestId);
    setGuestId(currentGuestId);
    setUser({
      id: currentGuestId,
      name: 'Guest User',
      email: null,
      isGuest: true,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        guestId,
        loading,
        isGuest: user?.isGuest ?? true,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

