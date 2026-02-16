import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Événement personnalisé pour déclencher le logout depuis l'intercepteur axios
export const AUTH_LOGOUT_EVENT = "auth:logout";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // Écouter les changements du localStorage (pour synchronisation entre onglets)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        const newToken = localStorage.getItem("token");
        const newUserRaw = localStorage.getItem("user");
        const newUser = newUserRaw ? JSON.parse(newUserRaw) : null;
        
        setToken(newToken);
        setUser(newUser);
      }
    };

    // Écouter l'événement personnalisé de logout
    const handleLogoutEvent = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogoutEvent);
    };
  }, []);

  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, role: user?.role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
