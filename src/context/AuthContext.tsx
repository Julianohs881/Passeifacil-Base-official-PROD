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

  // Cache duration - 30 seconds (reduced for better responsiveness)
  const CACHE_DURATION = 30 * 1000;

  // Função otimizada para verificar status PRO
  const checkProStatus = (profile: UserProfile): boolean => {
    console.log("Verificando status PRO para perfil:", {
      plan: profile.plan,
      has_access: profile.has_access,
      manual_access: profile.manual_access,
      subscription_status: profile.subscription_status,
      subscription_end_date: profile.subscription_end_date
    });
    
    // PRIMEIRO: Se tem manual_access = true, é PRO independente de outras verificações
    if (profile.manual_access === true) {
      console.log("Usuário é PRO (manual_access = true)");
      return true;
    }
    
    // SEGUNDO: Verificar se tem plano PRO baseado no campo 'plan'
    if (profile.plan === 'pro' || profile.plan === 'assinante') {
        // Se tiver data de expiração, verificar se não expirou
        if (profile.subscription_end_date) {
            const isExpired = new Date(profile.subscription_end_date) <= new Date();
            console.log("Verificando data de expiração:", {
              end_date: profile.subscription_end_date,
              is_expired: isExpired,
              subscription_status: profile.subscription_status
            });
            
            // Se não expirou, é PRO (mesmo que cancelado)
            if (!isExpired) {
              console.log("Usuário é PRO (ainda dentro do período pago)");
              return true;
            } else {
              console.log("Usuário NÃO é PRO (período expirado)");
              return false;
            }
        }
        
        // Se não tiver data de expiração, é PRO
        console.log("Usuário é PRO (plano assinante/pro sem data de expiração)");
        return true;
    }

    // Em todos os outros casos (plano 'gratuito', etc.), não é PRO
    console.log("Usuário NÃO é PRO (plano gratuito)");
    return false;
  };

  // Atualize a assinatura de loadUserProfile para aceitar email
  const loadUserProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log("loadUserProfile chamado para usuário:", userId);
      
      // Verifica cache primeiro
      const cached = profileCache.current[userId];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("Usando perfil do cache:", cached.profile);
        setUserProfile(cached.profile);
        setIsProfileLoaded(true);
        return;
      }

      // Evita múltiplas chamadas em sequência
      const now = Date.now();
      if (now - lastProfileCheck.current < 2000) { // Reduzido para 2 segundos
        console.log("Evitando múltiplas chamadas em sequência");
        return;
      }
      lastProfileCheck.current = now;

      console.log("Buscando perfil no banco para usuário:", userId);
      
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
        console.log("Dados do perfil carregados do banco:", data);
        console.log("Name from database:", data.name);
        console.log("Tipo do name:", typeof data.name);
        
        const planValue = data.plan as string;
        const validPlan: UserPlan = 
          ['gratuito', 'pro', 'assinante', 'cancelado', 'sem assinatura'].includes(planValue)
            ? planValue as UserPlan
            : 'gratuito';
        const profileWithEmail: UserProfile = {
          ...data,
          plan: validPlan,
          email: user?.email || userEmail || ""
        };
        
        console.log("Perfil processado:", profileWithEmail);
        console.log("Final name in profile:", profileWithEmail.name);
        console.log("Final name type:", typeof profileWithEmail.name);
        
        // Atualiza o cache
        profileCache.current[userId] = {
          profile: profileWithEmail,
          timestamp: Date.now()
        };
        
        setUserProfile(profileWithEmail);
      } else {
        console.log("Nenhum perfil encontrado para o usuário:", userId);
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
            loadUserProfile(session.user.id, session.user.email);
            return;
          }
        }
        // Se não tem cache ou é inválido, busca nova sessão
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          loadUserProfile(session.user.id, session.user.email);
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
          loadUserProfile(session.user.id, session.user.email);
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
            name: name
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
  const updateUserProfile = async (force: boolean = false) => {
    if (!user) return;
    
    console.log("updateUserProfile chamado, force:", force);
    
    // Se for uma atualização forçada, ignora as verificações de debounce
    if (!force) {
      if (!canVerify()) {
        console.log("canVerify retornou false, saindo");
        return;
      }
      
      // Evita múltiplas chamadas simultâneas
      if (subscriptionState.isVerifying) {
        console.log("subscriptionState.isVerifying é true, saindo");
        return;
      }
    }

    // Limpa o cache para forçar uma nova busca
    if (profileCache.current[user.id]) {
      console.log("Limpando cache do usuário:", user.id);
      delete profileCache.current[user.id];
    }

    // Se for forçado, executa imediatamente, senão usa debounce
    if (force) {
      console.log("Executando loadUserProfile imediatamente (force=true)");
      await loadUserProfile(user.id);
    } else {
      console.log("Usando debounce para loadUserProfile");
      // Usa debounce para evitar múltiplas chamadas em sequência
      debouncedAction(() => loadUserProfile(user.id));
    }
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
    
    console.log("updateProfile called with data:", data);
    console.log("User ID:", user.id);
    
    try {
      const updates: any = {};
      
      if (data.name !== undefined) {
        updates.name = data.name;
        console.log("Adding name to updates:", data.name);
        console.log("Name type:", typeof data.name);
      }
      
      if (data.avatarUrl !== undefined) {
        updates.avatar_url = data.avatarUrl;
        console.log("Adding avatar_url to updates:", data.avatarUrl);
      }
      
      console.log("Final updates object:", updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) {
        console.error("Erro ao atualizar perfil no banco:", error);
        throw error;
      }
      
      console.log("Profile updated successfully in database");
      
      // Força a atualização do perfil para refletir as mudanças
      console.log("Forçando atualização do perfil...");
      await updateUserProfile(true);
      console.log("Perfil atualizado com sucesso");
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
