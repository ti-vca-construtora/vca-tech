"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function useUser() {
  const router = useRouter();
  const store = useAuthStore();

  const enhancedLogout = () => {
    store.logout();
    router.push("/login");
  };

  return {
    ...store,
    logout: enhancedLogout,
  };
}
