import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import notificationService from "../../features/notification/services/notificationService";

const NotificationUnreadContext = createContext(null);

export function NotificationUnreadProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const canTrack = (user?.role || "GUEST") !== "GUEST";

  const refreshUnreadCount = useCallback(async () => {
    if (!canTrack) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(typeof count === "number" ? count : 0);
    } catch {
      setUnreadCount(0);
    }
  }, [canTrack]);

  const syncUnreadCount = useCallback((count) => {
    if (typeof count === "number" && count >= 0) {
      setUnreadCount(count);
    }
  }, []);

  const decrementUnreadCount = useCallback((delta = 1) => {
    const d = Number(delta);
    if (!Number.isFinite(d) || d <= 0) return;
    setUnreadCount((prev) => Math.max(0, prev - d));
  }, []);

  useEffect(() => {
    if (!canTrack) {
      setUnreadCount(0);
      return undefined;
    }
    refreshUnreadCount();
    const timer = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(timer);
  }, [canTrack, refreshUnreadCount]);

  const value = useMemo(
    () => ({
      unreadCount,
      refreshUnreadCount,
      syncUnreadCount,
      decrementUnreadCount,
    }),
    [unreadCount, refreshUnreadCount, syncUnreadCount, decrementUnreadCount]
  );

  return (
    <NotificationUnreadContext.Provider value={value}>
      {children}
    </NotificationUnreadContext.Provider>
  );
}

export function useNotificationUnread() {
  const ctx = useContext(NotificationUnreadContext);
  if (!ctx) {
    throw new Error("useNotificationUnread doit être utilisé dans NotificationUnreadProvider");
  }
  return ctx;
}
