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
      console.log("Loading user profile for ID:", userId);
      setProfileError(null);
      // Add a timeout to the profile loading to prevent infinite waiting
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Tempo esgotado ao carregar perfil")), 10000);
      });

      // Race between actual request and timeout
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
        // Safely convert the database plan string to UserPlan enum type
        const planValue = data.plan as string;
        // Validate plan against allowed UserPlan values or use default
        const validPlan: UserPlan = 
          ['gratuito', 'pro', 'assinante', 'cancelado', 'sem assinatura'].includes(planValue)
            ? planValue as UserPlan
            : 'gratuito'; // Default fallback

        // Convert database profile to UserProfile with email from user and validated plan
        const profileWithEmail: UserProfile = {
          ...data,
          plan: validPlan,
          email: user?.email || ""
        };
        
        console.log("User profile loaded successfully:", profileWithEmail);
        setUserProfile(profileWithEmail);
      } else {
        console.log("No user profile data found");
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      setProfileError(error instanceof Error ? error : new Error(String(error)));
    }
  };

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
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // In case of error and force is true, reset the state locally
      if (force) {
        console.log("Forçando logout local mesmo com erro");
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        window.location.href = "/login";
      } else {
        throw error; // Re-throw to let caller handle
      }
    } finally {
      setLoading(false);
    }
  };

  // Update user profile function
  const updateUserProfile = async () => {
    console.log("Manually refreshing user profile");
    if (user) {
      await loadUserProfile(user.id);
    }
  };
  
  // Check if user is a PRO user - UPDATED FUNCTION FOR NEW ACCESS LOGIC
  const isPro = () => {
    if (!userProfile) return false;
    
    console.log("Checking PRO access:", {
      uid: user?.id,
      has_access: userProfile.has_access,
      manual_access: userProfile.manual_access,
      plan: userProfile.plan,
    });
    
    // Access is now ONLY granted if has_access is explicitly true
    // or manual_access is explicitly true
    // The 'gratuito' plan no longer gets access
    if (typeof userProfile.has_access === 'boolean' && userProfile.has_access === true) {
      return true;
    }
    
    // Check if the user has manual access granted
    if (typeof userProfile.manual_access === 'boolean' && userProfile.manual_access === true) {
      return true;
    }
    
    // Legacy plan-based access is now restricted - ONLY 'assinante' or 'pro' plans get access
    // 'gratuito' plan no longer gets access
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
