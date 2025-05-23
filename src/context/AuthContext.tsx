import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { UserProfile, UserPlan } from '../types';

// Criação do contexto de autenticação
const AuthContext = createContext<any | undefined>(undefined);

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Componente AuthProvider
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        setProfileError(null);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
        setProfileError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setProfileError(null);
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tempo esgotado ao carregar perfil")), 10000);
      });

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise.then(() => { throw new Error("Tempo esgotado ao carregar perfil"); })
      ]) as any;

      if (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
        setProfileError(error);
        return;
      }

      if (data) {
        const planValue = data.plan as string;
        const validPlan: UserPlan = 
          ['gratuito', 'pro', 'assinante', 'cancelado', 'sem assinatura'].includes(planValue)
            ? planValue as UserPlan
            : 'gratuito'; // fallback

        const profileWithEmail: UserProfile = {
          ...data,
          plan: validPlan,
          email: user?.email || ""
        };
        
        setUserProfile(profileWithEmail);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      setProfileError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };
  
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async (force: boolean = false) => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      if (force) {
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        window.location.href = "/login";
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // Função robusta para identificar premium (assinante ou pro)
  const isPro = () => {
    if (!userProfile) return false;

    const isTrue = (value: any) =>
      value === true ||
      value === "true" ||
      value === 1 ||
      value === "1";

    if (isTrue(userProfile.has_access)) return true;
    if (isTrue(userProfile.manual_access)) return true;

    const plan = String(userProfile.plan || "").trim().toLowerCase();
    if (["assinante", "pro"].includes(plan)) return true;

    return false;
  };

  const hasReachedAILimit = () => {
    if (!userProfile) return true;
    const questionsCreated = userProfile.ai_questions_created || 0;
    const limit = 50;
    return questionsCreated >= limit;
  };

  const updateAIQuestionsCreated = async () => {
    if (!user) return;
    try {
      const currentCount = userProfile?.ai_questions_created || 0;
      const { error } = await supabase
        .from('profiles')
        .update({
          ai_questions_created: currentCount + 1
        })
        .eq('id', user.id);
      if (error) throw error;
      await updateUserProfile();
    } catch (error) {
      console.error("Error updating AI questions count:", error);
    }
  };

  const resetAIQuestionsCount = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ai_questions_created: 0
        })
        .eq('id', user.id);
      if (error) throw error;
      await updateUserProfile();
    } catch (error) {
      console.error("Error resetting AI questions count:", error);
    }
  };

  const getAIUsageStats = () => {
    const used = userProfile?.ai_questions_created || 0;
    const limit = 50;
    const remaining = Math.max(0, limit - used);
    const percentUsed = Math.min(100, (used / limit) * 100);
    return {
      used,
      limit,
      remaining,
      percentUsed
    };
  };

  const updateProfile = async (data: { name?: string, avatarUrl?: string }) => {
    if (!user) return false;
    try {
      const updates: any = {};
      if (data.name !== undefined) {
        updates.name = data.name;
      }
      if (data.avatarUrl !== undefined) {
        updates.avatar_url = data.avatarUrl;
      }
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      await updateUserProfile();
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        profileError,
        updateUserProfile,
        signOut,
        signIn,
        signUp,
        isPro,
        hasReachedAILimit,
        updateAIQuestionsCreated,
        updateProfile,
        getAIUsageStats,
        resetAIQuestionsCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
