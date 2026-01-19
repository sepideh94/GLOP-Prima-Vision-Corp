import api from "./axiosInstance";

const authService = {
  async signIn(email, password) {
    const res = await api.post("/api/auth/signin", {
      email,
      password,
    });
    return res.data; 
  },
  async signUp(firstName, lastName, email, password, role) {
    const res = await api.post("/api/auth/signup", {
      firstName,
      lastName,
      email,
      password,
      role,
    });
    return res.data;
  },
  async forgotPassword(email) {
    const res = await api.post("/api/auth/forgot-password", {
      email,
    });
    return res.data;
  },
  async resetPassword(token, newPassword, confirmNewPassword) {
    const res = await api.post("/api/auth/forgot-password/complete", {
      token,
      newPassword,
      confirmNewPassword,
    });
    return res.data;
  },
};

export default authService;
