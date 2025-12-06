import api from './api';

/**
 * Logs in the user by sending credentials to the backend.
 * Upon successful login, it stores the JWT token in localStorage.
 * @param {object} credentials - The user's credentials (e.g., { username, password }).
 * @returns {Promise<object>} The data from the API response.
 */
const login = async (credentials) => {
  try {
    // Corrected endpoint to /auth/signin as per the backend controller
    const response = await api.post('/auth/signin', credentials);
    
    // Corrected to look for 'accessToken' as returned by the backend
    if (response.data && response.data.accessToken) {
      const { accessToken, data } = response.data;
      
      console.log("siuu ",response.data);

      // Store the token and user info in localStorage. We'll use the key 'token' internally for consistency.
      localStorage.setItem('token', accessToken);
      if (data && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return response.data;
    } else {
      // Handle cases where login is successful by status code but no token is in the body
      throw new Error('Login did not return an access token.');
    }
  } catch (error) {
    console.error('Login failed in authService:', error);
    // Re-throw the error so the UI component can handle it
    throw error;
  }
};

/**
 * Mock login for offline demonstration
 */
const loginDemo = () => {
  const mockToken = 'demo-token-12345';
  const mockUser = { username: 'demo_parent', name: 'Demo Parent' };
  localStorage.setItem('token', mockToken);
  localStorage.setItem('user', JSON.stringify(mockUser));
  return Promise.resolve({ success: true, user: mockUser, token: mockToken });
};

/**
 * Logs out the user by removing the token and user data from localStorage.
 */
const logout = async () => {
  try {
    await api.delete('/auth/logout');
  } catch (error) {
    console.warn("Logout API call failed:", error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optional: Redirect to login page
    // window.location.href = '/parent/login';
  }
};

/**
 * Retrieves the currently stored JWT token.
 * @returns {string|null} The token or null if not found.
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Retrieves the currently stored user data.
 * @returns {object|null} The user object or null if not found.
 */
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Failed to parse user data from localStorage", e);
    return null;
  }
};

/**
 * Checks if a user is currently authenticated by verifying the presence of a token.
 * @returns {boolean} True if a token exists, false otherwise.
 */
const isAuthenticated = () => {
  return !!getToken();
};

const authService = {
  login,
  logout,
  getToken,
  getCurrentUser,
  isAuthenticated,
  loginDemo,
};

export default authService;
