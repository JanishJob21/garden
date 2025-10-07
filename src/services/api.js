// Simple API client with token support and CRA proxy to http://localhost:4000
const API_BASE = ''; // CRA proxy handles /api/* to backend

let token = null;

export const setToken = (t) => {
  token = t;
  if (t) localStorage.setItem('gs_token', t);
  else localStorage.removeItem('gs_token');
};

export const getToken = () => token || localStorage.getItem('gs_token');

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const t = getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { 
      ...options, 
      headers,
      credentials: 'include', // This is important for cookies/auth to work cross-origin
      mode: 'cors', // Explicitly set CORS mode
    });
    const responseData = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      // Create an error object with response details
      const error = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.response = {
        status: res.status,
        statusText: res.statusText,
        data: responseData,
      };
      
      if (res.status === 401) {
        // For auth endpoints, show the real error (e.g., invalid credentials)
        if (String(path).startsWith('/api/auth')) {
          throw error;
        }
        // For other endpoints, clear session and prompt re-login
        try { localStorage.removeItem('gs_user'); } catch {}
        setToken(null);
        error.message = 'Session expired or invalid. Please login again.';
        throw error;
      }
      
      // For 403 Forbidden, include the error message from the server if available
      if (res.status === 403) {
        error.message = responseData.message || 'You do not have permission to access this resource.';
      }
      
      throw error;
    }
    
    return responseData;
  } catch (error) {
    // If it's already our error with response, rethrow it
    if (error.response) throw error;
    
    // Handle network errors and other exceptions
    const networkError = new Error(error.message || 'Network error. Please check your connection.');
    networkError.isNetworkError = true;
    throw networkError;
  }
}

// Auth
export const authRegister = (payload) => apiFetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const authLogin = (payload) => apiFetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const googleAuth = (payload) => apiFetch('/api/auth/google', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const authMe = () => apiFetch('/api/auth/me');
export const authLogout = () => apiFetch('/api/auth/logout', { method: 'POST' });

// Admin Users
export const usersList = () => apiFetch('/api/users');
export const usersUpdateRole = (id, role) => apiFetch(`/api/users/${id}/role`, {
  method: 'PATCH',
  body: JSON.stringify({ role }),
});

// Registrations
export const registrationsCreate = (payload) => apiFetch('/api/registrations', {
  method: 'POST',
  body: JSON.stringify(payload),
});
export const registrationsMine = () => apiFetch('/api/registrations/me');
export const registrationsList = () => apiFetch('/api/registrations');

// Bookings
export const bookingsCreate = (payload) => apiFetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify(payload),
});
export const bookingsMine = () => apiFetch('/api/bookings/me');
export const bookingsList = () => apiFetch('/api/bookings');

export const updateBookingStatus = (id, status) => apiFetch(`/api/bookings/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});

// Tools
export const toolsCreate = (payload) => apiFetch('/api/tools', {
  method: 'POST',
  body: JSON.stringify(payload),
});
export const toolsMine = () => apiFetch('/api/tools/me');
export const toolsList = () => apiFetch('/api/tools');

// Feedback
export const feedbackCreate = (payload) => apiFetch('/api/feedback', {
  method: 'POST',
  body: JSON.stringify(payload),
});
export const feedbackMine = () => apiFetch('/api/feedback/me');
export const feedbackList = () => apiFetch('/api/feedback');

// Sessions
export const sessionsList = ({ q='', status='', from='', to='', page=1, pageSize=10 }={}) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return apiFetch(`/api/sessions?${params.toString()}`);
}
export const sessionsSummary = () => apiFetch('/api/sessions/summary');
export const sessionsDelete = (id) => apiFetch(`/api/sessions/${id}`, {
  method: 'DELETE'
});
