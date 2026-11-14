/**
 * To-Do Application API Service
 */

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:3002' : '');

const getHeaders = (token, guestId) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (guestId) {
    headers['x-guest-id'] = guestId;
  }
  return headers;
};

export const api = {
  /**
   * Send OTP via Gmail
   */
  async sendOtp({ email, name }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send OTP code.');
    }
    return data;
  },

  /**
   * Verify OTP and Log In
   */
  async verifyOtp({ email, otp, guestId, name }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, guestId, name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Verification failed.');
    }
    return data;
  },

  /**
   * Resend OTP
   */
  async resendOtp({ email }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to resend code.');
    }
    return data;
  },

  /**
   * Email Register
   */
  async register({ email, password, name, guestId }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, guestId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  /**
   * Email Login
   */
  async login({ email, password, guestId }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, guestId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  /**
   * Google Auth (optional fallback)
   */
  async googleAuth({ email, name, googleId, avatar, guestId }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, googleId, avatar, guestId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Google sign-in failed');
    }
    return res.json();
  },

  /**
   * Guest Auth Handshake
   */
  async guestAuth(guestId) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Guest session initialization failed');
    }
    return res.json();
  },

  /**
   * Get Weekly Summary
   */
  async getWeeklySummary({ search = '', category = '', token = null, guestId = null } = {}) {
    const url = new URL(`${API_BASE_URL}/to-do/api/summary`, window.location.origin);
    if (search) url.searchParams.set('search', search);
    if (category && category !== 'All') url.searchParams.set('category', category);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(token, guestId),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch weekly summary');
    }
    return res.json();
  },

  /**
   * Get All Tasks
   */
  async getTasks({ search = '', status = '', weekKey = '', token = null, guestId = null } = {}) {
    const url = new URL(`${API_BASE_URL}/to-do/api/tasks`, window.location.origin);
    if (search) url.searchParams.set('search', search);
    if (status) url.searchParams.set('status', status);
    if (weekKey) url.searchParams.set('weekKey', weekKey);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(token, guestId),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch tasks');
    }
    return res.json();
  },

  /**
   * Create Task
   */
  async createTask(taskData, { token = null, guestId = null } = {}) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/tasks`, {
      method: 'POST',
      headers: getHeaders(token, guestId),
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create task');
    }
    return res.json();
  },

  /**
   * Update Task
   */
  async updateTask(id, updateData, { token = null, guestId = null } = {}) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(token, guestId),
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update task');
    }
    return res.json();
  },

  /**
   * Toggle Status
   */
  async toggleStatus(id, { token = null, guestId = null } = {}) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(token, guestId),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to toggle task status');
    }
    return res.json();
  },

  /**
   * Delete Task
   */
  async deleteTask(id, { token = null, guestId = null } = {}) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token, guestId),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete task');
    }
    return res.json();
  },

  /**
   * Rename Category across all tasks
   */
  async renameCategory({ oldCategory, newCategory, token = null, guestId = null }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/categories/rename`, {
      method: 'PUT',
      headers: getHeaders(token, guestId),
      body: JSON.stringify({ oldCategory, newCategory, guestId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to rename category');
    }
    return res.json();
  },

  /**
   * Delete Category and migrate tasks to fallbackCategory
   */
  async deleteCategory({ category, fallbackCategory = 'Work', token = null, guestId = null }) {
    const res = await fetch(`${API_BASE_URL}/to-do/api/categories/delete`, {
      method: 'POST',
      headers: getHeaders(token, guestId),
      body: JSON.stringify({ category, fallbackCategory, guestId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete category');
    }
    return res.json();
  },
};

