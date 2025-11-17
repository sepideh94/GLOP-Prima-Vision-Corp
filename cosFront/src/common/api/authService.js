import api from "./axiosInstance";

const authService = {
  async signIn(email, password) {
    const res = await api.post("/api/auth/signin", {
      email,
      password,
    });
    return res.data; 
  },
};

export default authService;
