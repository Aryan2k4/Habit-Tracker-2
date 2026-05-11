import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { signIn, signUp, signOut, getUserProfile } from "@/lib/auth";

type UserProfile = {
  id: string;
  email: string | undefined;
  name: string;
}

type AuthContextType = {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    setIsLoading(true);
    const profile = await getUserProfile();
    setUser(profile);
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    const res = await signIn(email, password);
    if (res.success) await checkUser();
    return res.success;
  }

  async function signup(email: string, password: string, name: string) {
    const res = await signUp(email, password, name);
    if (res.success) await checkUser();
    return res.success;
  }

  async function logout() {
    await signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}