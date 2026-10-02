import { useMemo, useSyncExternalStore } from "react";
import { supabase } from "../services/supabase";

// The signed-in user lives in localStorage ("user"), exactly like the existing pages use it.
// useAuth() re-renders components whenever it changes.

const subscribe = (callback) => {
  window.addEventListener("auth-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("auth-changed", callback);
    window.removeEventListener("storage", callback);
  };
};

const getSnapshot = () => localStorage.getItem("user");

export const HOME_BY_ROLE = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
  receptionist: "/receptionist/dashboard",
};

export const homeFor = (role) => HOME_BY_ROLE[role] || "/login";

export const useAuth = () => {
  const raw = useSyncExternalStore(subscribe, getSnapshot);

  const user = useMemo(() => {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [raw]);

  const login = (profile) => {
    const safeProfile = { ...profile };
    delete safeProfile.password;
    localStorage.setItem("user", JSON.stringify(safeProfile));
    window.dispatchEvent(new Event("auth-changed"));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* not a Google session - ignore */
    }
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
  };

  return { user, login, logout };
};
