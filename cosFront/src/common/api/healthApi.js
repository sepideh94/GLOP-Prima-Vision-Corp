import axiosInstance from "./axiosInstance";

export async function pingHealth() {
  try {
    const res = await axiosInstance.get("/health");
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
