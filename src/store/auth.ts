import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  expiresAt: number | null;
  setToken: (token: string, expiresIn: number) => void;
  clearToken: () => void;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      setToken: (token: string, expiresIn: number) => {
        // Calculate expiry time (with 1 minute buffer)
        const expiresAt = Date.now() + (expiresIn - 60) * 1000;
        set({ accessToken: token, expiresAt });
      },
      clearToken: () => set({ accessToken: null, expiresAt: null }),
      isTokenValid: () => {
        const { accessToken, expiresAt } = get();
        return !!accessToken && !!expiresAt && Date.now() < expiresAt;
      },
    }),
    {
      name: "orbitport-auth",
    }
  )
);
