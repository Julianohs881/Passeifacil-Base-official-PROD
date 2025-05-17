
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthContext";

export const useStripeSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();
  
  const createCheckoutSession = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        throw error;
      }
      
      if (data.error) {
        if (data.redirectToPortal) {
          toast({
            title: "Você já possui uma assinatura ativa",
            description: "Redirecionando para o portal de gerenciamento de assinatura...",
            duration: 3000,
          });
          
          return openCustomerPortal();
        }
        
        throw new Error(data.error);
      }
      
      // Abrir a URL de checkout do Stripe em uma nova aba
      window.open(data.url, '_blank');
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao criar sessão de checkout:", error);
      
      toast({
        variant: "destructive",
        title: "Erro ao iniciar processo de assinatura",
        description: error?.message || "Ocorreu um erro ao processar sua solicitação.",
        duration: 5000,
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifySubscriptionStatus = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw error;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Atualizar o perfil do usuário com o status da assinatura
      if (data) {
        await updateUserProfile();
      }
      
      return { 
        success: true, 
        subscribed: data.subscribed,
        plan: data.plan,
        subscription_end: data.subscription_end
      };
    } catch (error: any) {
      console.error("Erro ao verificar status da assinatura:", error);
      
      toast({
        variant: "destructive",
        title: "Erro ao verificar assinatura",
        description: error?.message || "Ocorreu um erro ao verificar seu status de assinatura.",
        duration: 5000,
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const openCustomerPortal = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw error;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Abrir o portal de clientes do Stripe em uma nova aba
      window.open(data.url, '_blank');
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao abrir portal do cliente:", error);
      
      toast({
        variant: "destructive",
        title: "Erro ao abrir portal de gerenciamento",
        description: error?.message || "Ocorreu um erro ao tentar acessar seu portal de assinatura.",
        duration: 5000,
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    createCheckoutSession,
    verifySubscriptionStatus,
    openCustomerPortal
  };
};
