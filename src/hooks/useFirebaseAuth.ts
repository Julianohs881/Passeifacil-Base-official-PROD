
import { useState } from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${result.user.displayName}!`,
      });
      
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      
      toast({
        title: "Erro no login com Google",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
      
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${result.user.displayName}!`,
      });
      
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error("Error signing up with Google:", error);
      
      toast({
        title: "Erro no cadastro com Google",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
      
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Sua conta foi criada. Agora você pode fazer login.",
      });
      
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error("Error signing up with email:", error);
      
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
      
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta!`,
      });
      
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error("Error signing in with email:", error);
      
      toast({
        title: "Erro no login",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
      
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error signing out:", error);
      
      toast({
        title: "Erro no logout",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signInWithGoogle,
    signUpWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout
  };
};
