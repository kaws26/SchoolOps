// Auth utility functions
export const auth = {
  // Get token from localStorage
  getToken: () => localStorage.getItem('token'),

  // Set token in localStorage
  setToken: (token) => localStorage.setItem('token', token),

  // Remove token from localStorage
  removeToken: () => localStorage.removeItem('token'),

  // Check if user is authenticated
  isAuthenticated: () => !!localStorage.getItem('token'),

  // Get auth headers for API requests
  getAuthHeaders: () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }),

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default auth;