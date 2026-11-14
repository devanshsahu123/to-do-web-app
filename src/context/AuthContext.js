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
      const storedGuestActive = localStorage.getItem('todo_guest_active');
      const storedGuestId = localStorage.getItem('todo_guest_id');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (storedGuestActive === 'true' && storedGuestId) {
        setGuestId(storedGuestId);
        setUser({
          id: storedGuestId,
          name: 'Guest User',
          email: null,
          isGuest: true,
        });
      } else {
        // Not logged in and not guest - prompt login page
        setUser(null);
        setToken(null);
        setGuestId(null);
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send 6-digit OTP to Gmail
   */
  const sendOtp = useCallback(async ({ email, name }) => {
    try {
      const res = await api.sendOtp({ email, name });
      return res;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Verify OTP and log in
   */
  const verifyOtp = useCallback(async ({ email, otp, name }) => {
    try {
      const currentGuestId = localStorage.getItem('todo_guest_id');
      const data = await api.verifyOtp({
        email,
        otp,
        guestId: currentGuestId,
        name,
      });

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('todo_token', data.token);
        localStorage.setItem('todo_user', JSON.stringify(data.user));
        localStorage.removeItem('todo_guest_active');
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  /**
   * Resend OTP
   */
  const resendOtp = useCallback(async ({ email }) => {
    try {
      return await api.resendOtp({ email });
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Continue as Guest
   */
  const continueAsGuest = useCallback(async () => {
    let existingGuestId = localStorage.getItem('todo_guest_id');
    if (!existingGuestId) {
      existingGuestId = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('todo_guest_id', existingGuestId);
    }
    localStorage.setItem('todo_guest_active', 'true');

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

  /**
   * Log out
   */
  const logout = useCallback(() => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    localStorage.removeItem('todo_guest_active');
    setToken(null);
    setUser(null);
    setGuestId(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        guestId,
        loading,
        isAuthenticated: !!token,
        isGuest: user?.isGuest ?? false,
        sendOtp,
        verifyOtp,
        resendOtp,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
