import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { UserProfile, UserPlan } from '../types';
import { useSubscriptionState } from '../hooks/useSubscriptionState';

// Create the AuthContext
const AuthContext = createContext<any | undefined>(undefined);

// Hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component with enhanced functionality
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const hasInitialized = useRef(false);
  const lastProfileCheck = useRef<number>(0);
  const profileCache = useRef<{ [key: string]: { profile: UserProfile, timestamp: number } }>({});
  
  const { subscriptionState, canVerify, debouncedAction, resetState } = useSubscriptionState();

  // Cache duration - 1 minute
  const CACHE_DURATION = 60 * 1000;

  // Função otimizada para verificar status PRO
  const checkProStatus = (profile: UserProfile): boolean => {
    // Um usuário é PRO se tiver o plano 'pro' ou 'assinante' OU acesso manual explícito
    if (profile.plan === 'pro' || profile.plan === 'assinante' || profile.manual_access === true) {
        // Se tiver data de expiração, verificar se não expirou
        if (profile.subscription_end_date) {
            return new Date(profile.subscription_end_date) > new Date();
        }
        // Se não tiver data de expiração ou se a data ainda é válida, é PRO
        return true;
    }

    // Em todos os outros casos (plano 'gratuito', 'sem assinatura', etc. sem manual_access=true), não é PRO
    return false;
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Verifica cache primeiro
      const cached = profileCache.current[userId];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("Using cached profile");
        setUserProfile(cached.profile);
        setIsProfileLoaded(true);
        return;
      }

      // Evita múltiplas chamadas em sequência
      const now = Date.now();
      if (now - lastProfileCheck.current < 2000) { // Reduzido para 2 segundos
        console.log("Skipping profile check - too soon");
        return;
      }
      lastProfileCheck.current = now;

      console.log("Loading user profile for ID:", userId);
      setProfileError(null);
      
      // Busca apenas os campos necessários
      const { data, error } = await supabase
        .from('profiles')
        .select('id, has_access, manual_access, plan, subscription_end_date, name, avatar_url, ai_questions_created')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
        setProfileError(error);
        setIsProfileLoaded(true);
        return;
      }

      if (data) {
        const planValue = data.plan as string;
        const validPlan: UserPlan = 
          ['gratuito', 'pro', 'assinante', 'cancelado', 'sem assinatura'].includes(planValue)
            ? planValue as UserPlan
            : 'gratuito';

        const profileWithEmail: UserProfile = {
          ...data,
          plan: validPlan,
          email: user?.email || ""
        };
        
        // Atualiza o cache
        profileCache.current[userId] = {
          profile: profileWithEmail,
          timestamp: Date.now()
        };
        
        setUserProfile(profileWithEmail);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      setProfileError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsProfileLoaded(true);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        setProfileError(null);
        
        // Tenta obter a sessão do cache primeiro
        const cachedSession = localStorage.getItem('supabase.auth.token');
        if (cachedSession) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUser(session.user);
            loadUserProfile(session.user.id);
            return;
          }
        }

        // Se não tem cache ou é inválido, busca nova sessão
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          loadUserProfile(session.user.id);
        } else {
          setIsProfileLoaded(true);
        }
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
        setProfileError(error instanceof Error ? error : new Error(String(error)));
        setIsProfileLoaded(true);
      } finally {
        setLoading(false);
        hasInitialized.current = true;
      }
    };

    if (!hasInitialized.current) {
      getSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!hasInitialized.current && event === 'INITIAL_SESSION') {
        return;
      }
      
      if (session) {
        setUser(session.user);
        if (event === 'SIGNED_IN' || (event === 'TOKEN_REFRESHED' && !userProfile)) {
          loadUserProfile(session.user.id);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsProfileLoaded(true);
        resetState();
        // Limpa o cache ao fazer logout
        profileCache.current = {};
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign In function
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
  
  // Sign Up function
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

  // Logout function with force option for emergency logout
  const signOut = async (force: boolean = false) => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      setIsProfileLoaded(false);
      resetState();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      if (force) {
        console.log("Forçando logout local mesmo com erro");
        setUser(null);
        setUserProfile(null);
        setIsProfileLoaded(false);
        resetState();
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

  // Update user profile function - OPTIMIZED
  const updateUserProfile = async () => {
    if (!user || !canVerify()) return;
    
    // Evita múltiplas chamadas simultâneas
    if (subscriptionState.isVerifying) {
      console.log("Profile update skipped - verification already in progress");
      return;
    }

    // Usa debounce para evitar múltiplas chamadas em sequência
    debouncedAction(() => loadUserProfile(user.id));
  };
  
  // Check if user is a PRO user - OPTIMIZED FUNCTION
  const isPro = () => {
    // Se o perfil não foi carregado ainda, retorna false
    if (!isProfileLoaded || !userProfile) {
      return false;
    }
    
    return checkProStatus(userProfile);
  };
  
  // Check if user has reached AI generation limit
  const hasReachedAILimit = () => {
    if (!userProfile) return true;
    
    const questionsCreated = userProfile.ai_questions_created || 0;
    const limit = 50;
    
    return questionsCreated >= limit;
  };
  
  // Update AI questions count after creating a new AI question
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
  
  // Reset AI questions counter
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
  
  // Get AI usage statistics
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
  
  // Update profile data function (name, avatar)
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

  // Helper function to determine if upgrade UI should be shown
  const shouldShowUpgradeUI = () => {
    return isProfileLoaded && !isPro();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        profileError,
        isProfileLoaded,
        updateUserProfile,
        signOut,
        signIn,
        signUp,
        isPro,
        shouldShowUpgradeUI,
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
