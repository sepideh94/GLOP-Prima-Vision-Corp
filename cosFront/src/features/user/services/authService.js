import api from "./axiosInstance";

const authService = {
  async signIn(email, password) {
    const res = await api.post("/auth/signin", { email, password });
    return res.data; // { token: "..." }
  },
};

export default authService;
