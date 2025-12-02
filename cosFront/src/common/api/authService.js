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
};

export default authService;
