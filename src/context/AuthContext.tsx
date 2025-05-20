
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { UserProfile, UserPlan } from '../types';

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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
        setAuthError("Falha ao verificar sessão do usuário");
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        try {
          await loadUserProfile(session.user.id);
        } catch (error) {
          console.error("Erro ao carregar perfil após mudança de estado:", error);
          setAuthError("Falha ao carregar perfil do usuário");
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
        setAuthError("Falha ao carregar perfil do usuário");
        return false;
      }

      if (data) {
        // Convert database profile to UserProfile with email from user and validate plan type
        const profileWithEmail: UserProfile = {
          ...data,
          email: user?.email || "",
          // Ensure plan is a valid UserPlan type
          plan: (data.plan as UserPlan) || "gratuito" 
        };
        setUserProfile(profileWithEmail);
        return true;
      } else {
        setUserProfile(null);
        return false;
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      setAuthError("Falha ao carregar perfil do usuário");
      return false;
    }
  };

  // Sign In function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthError(null);
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
      setAuthError(null);
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

  // Logout function - Made more robust and always works
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Clear state no matter what happens with the API call
      setUser(null);
      setLoading(false);
      setUserProfile(null);
      setAuthError(null);
      
      // Remove any verification timestamps saved in session
      sessionStorage.removeItem("verification_error_timestamp");
      sessionStorage.removeItem("new_subscriber");
      sessionStorage.removeItem("auth_error_cooldown");
    }
  };

  // Update user profile function
  const updateUserProfile = async () => {
    if (user) {
      return await loadUserProfile(user.id);
    }
    return false;
  };
  
  // Check if user is a PRO user
  const isPro = () => {
    if (!userProfile) return false;
    
    // Check if the user has explicit access via subscription
    if (typeof userProfile.has_access === 'boolean') {
      return userProfile.has_access === true;
    }
    
    // Legacy check based on plan
    return userProfile.plan === 'pro' || userProfile.plan === 'assinante';
  };
  
  // Check if user has reached AI generation limit
  const hasReachedAILimit = () => {
    if (!userProfile) return true;
    
    const questionsCreated = userProfile.ai_questions_created || 0;
    const limit = 50; // Monthly limit
    
    return questionsCreated >= limit;
  };
  
  // Update AI questions count after creating a new AI question
  const updateAIQuestionsCreated = async () => {
    if (!user) return;
    
    try {
      // Get current count
      const currentCount = userProfile?.ai_questions_created || 0;
      
      // Update count in database
      const { error } = await supabase
        .from('profiles')
        .update({
          ai_questions_created: currentCount + 1
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      await updateUserProfile();
      
    } catch (error) {
      console.error("Error updating AI questions count:", error);
    }
  };
  
  // Reset AI questions counter (e.g., on the 1st of each month)
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
      
      // Update local state
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
      
      // Update local state
      await updateUserProfile();
      return true;
      
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  // Clear authentication error
  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        authError,
        clearAuthError,
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
