import { useCallback, useEffect, useState } from "react";
import {
  getAuthToken,
  platformApi,
  setAuthToken,
  type PlatformUserDto,
} from "@/lib/platformApi";

export interface CompatAuthUser {
  id: string;
  email: string;
  role: PlatformUserDto["role"];
  user_metadata: {
    full_name: string;
    role: PlatformUserDto["role"];
  };
}

export interface CompatSession {
  access_token: string;
  user: CompatAuthUser;
}

function toCompatUser(u: PlatformUserDto): CompatAuthUser {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    user_metadata: {
      full_name: u.fullName,
      role: u.role,
    },
  };
}

export const useAuth = () => {
  const [platformUser, setPlatformUser] = useState<PlatformUserDto | null>(null);
  const [user, setUser] = useState<CompatAuthUser | null>(null);
  const [session, setSession] = useState<CompatSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setPlatformUser(null);
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const { user: fetched } = await platformApi.getMe();
      const compat = toCompatUser(fetched);
      setPlatformUser(fetched);
      setUser(compat);
      setSession({ access_token: token, user: compat });
    } catch {
      // Token expired or invalid — clear cleanly
      setAuthToken(null);
      setPlatformUser(null);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Scrub any legacy mock user entry left from older sessions
    try {
      localStorage.removeItem("udayantu_mock_user");
    } catch {
      // ignore
    }

    refreshSession();

    const onAuthChange = () => {
      refreshSession();
    };
    window.addEventListener("udayantu-auth-change", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("udayantu-auth-change", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setPlatformUser(null);
    setUser(null);
    setSession(null);
  }, []);

  return { user, platformUser, session, loading, signOut, refreshSession };
};
