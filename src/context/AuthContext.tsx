
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserProfile, UserPlan } from "../types";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      // Make sure the data conforms to the UserProfile type
      if (data) {
        const typedProfile: UserProfile = {
          id: data.id,
          plan: data.plan as UserPlan,
          ai_questions_created: data.ai_questions_created || 0,
          created_at: data.created_at,
          name: data.name || undefined,
          avatar_url: data.avatar_url || undefined
        };
        setUserProfile(typedProfile);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const updateUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      
      // Make sure the data conforms to the UserProfile type
      if (data) {
        const typedProfile: UserProfile = {
          id: data.id,
          plan: data.plan as UserPlan,
          ai_questions_created: data.ai_questions_created || 0,
          created_at: data.created_at,
          name: data.name || undefined,
          avatar_url: data.avatar_url || undefined
        };
        setUserProfile(typedProfile);
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
    }
  };

  const updateProfile = async ({ name, avatarUrl }: { name?: string, avatarUrl?: string }) => {
    if (!user) return;

    try {
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...(name !== undefined ? { name } : {}),
          ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {})
        });
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível atualizar seu perfil.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: name
          }
        },
      });

      if (error) throw error;

      // Update the profile with the name
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error("Error updating profile with name:", profileError);
        }
      }

      toast({
        title: "Registro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAIQuestionsCreated = async () => {
    if (!user) return;
    
    try {
      console.log("Updating AI questions created count");
      
      // Update local state with properly typed object
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          ai_questions_created: (userProfile.ai_questions_created || 0) + 1
        };
        setUserProfile(updatedProfile);
        
        console.log("New AI questions count:", updatedProfile.ai_questions_created);
      }
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({
          ai_questions_created: (userProfile?.ai_questions_created || 0) + 1
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating AI questions count:", error);
        throw error;
      }
      
      console.log("AI questions count updated successfully in database");
      
      // Refresh profile data to ensure we have the latest count
      await fetchUserProfile(user.id);
      
    } catch (error) {
      console.error("Error in updateAIQuestionsCreated:", error);
      toast({
        title: "Erro ao atualizar contagem",
        description: "Não foi possível atualizar sua contagem de questões com IA.",
        variant: "destructive",
      });
    }
  };

  // Atualizar a função isPro para ser mais clara
  const isPro = () => {
    return userProfile?.plan === 'pro';
  };
  
  // Check if the user has reached their monthly AI question limit
  const hasReachedAILimit = () => {
    // If not Pro, or if they've created 50 or more questions, they've reached the limit
    return !isPro() || (userProfile?.ai_questions_created || 0) >= 50;
  };

  // Get the current month's usage statistics
  const getAIUsageStats = () => {
    const aiQuestionsCreated = userProfile?.ai_questions_created || 0;
    const aiQuestionsLimit = 50;
    const aiQuestionsRemaining = Math.max(0, aiQuestionsLimit - aiQuestionsCreated);
    
    return {
      used: aiQuestionsCreated,
      limit: aiQuestionsLimit,
      remaining: aiQuestionsRemaining,
      percentUsed: Math.min(100, (aiQuestionsCreated / aiQuestionsLimit) * 100)
    };
  };

  // Reset AI question count (this would typically be done by a scheduled job each month)
  const resetAIQuestionsCount = async () => {
    if (!user) return;
    
    try {
      // Update local state
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          ai_questions_created: 0
        };
        setUserProfile(updatedProfile);
      }
      
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({
          ai_questions_created: 0
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Contagem resetada",
        description: "Sua contagem de questões com IA foi resetada.",
      });
    } catch (error) {
      console.error("Error in resetAIQuestionsCount:", error);
      toast({
        title: "Erro ao resetar contagem",
        description: "Não foi possível resetar sua contagem de questões com IA.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        userProfile,
        isPro,
        hasReachedAILimit,
        updateAIQuestionsCreated,
        updateUserProfile,
        updateProfile,
        getAIUsageStats,
        resetAIQuestionsCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
