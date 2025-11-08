import axiosInstance from './axiosInstance';

const authService = {
  // Connexion
  signIn: async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/signin', {
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erreur de connexion';
    }
  },

  // Inscription
  signUp: async (firstName, lastName, email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/signup', {
        firstName,
        lastName,
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erreur d\'inscription';
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;