import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Define the shape of the user profile
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan?: string;
  has_access?: boolean;
  subscription_status?: string;
  stripe_customer_id?: string;
  subscription_id?: string;
  subscription_end_date?: string;
  // Add other profile fields here
}

// Define the shape of the AuthContext
interface AuthContextType {
  user: any | null; // Replace 'any' with the actual type of your user object
  loading: boolean;
  userProfile: UserProfile | null;
  updateUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Dentro do componente AuthProvider, adicione a função signOut ao objeto de contexto
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
      }

      setUserProfile(data || null);
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
    }
  };

  // Adicione a função de logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setLoading(false);
      setUserProfile(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Em caso de erro, forçar o reset do estado localmente
      setUser(null);
      setLoading(false);
      setUserProfile(null);
    }
  };

  const updateUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        updateUserProfile,
        signOut, // Adicione a função de logout ao contexto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
