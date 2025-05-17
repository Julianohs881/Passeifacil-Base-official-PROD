import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserProfile } from "../types";
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
          plan: data.plan,
          ai_questions_created: data.ai_questions_created || 0,
          created_at: data.created_at
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
          plan: data.plan,
          ai_questions_created: data.ai_questions_created || 0,
          created_at: data.created_at
        };
        setUserProfile(typedProfile);
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
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

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      toast({
        title: "Registro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
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
      // Update local state with properly typed object
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          ai_questions_created: (userProfile.ai_questions_created || 0) + 1
        };
        setUserProfile(updatedProfile);
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
      }
    } catch (error) {
      console.error("Error in updateAIQuestionsCreated:", error);
    }
  };

  // Atualizar a função isPro para ser mais clara
  const isPro = () => {
    return userProfile?.plan === 'pro';
  };
  
  const hasReachedAILimit = () => !isPro() || (userProfile?.ai_questions_created || 0) >= 50;

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
