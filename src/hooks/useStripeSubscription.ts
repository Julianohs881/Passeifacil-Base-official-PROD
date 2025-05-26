import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthContext";

export const useStripeSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();
  
  // Cache mais inteligente com TTL maior
  const cacheTimeoutMs = 60000; // 1 minuto
  const verificationCache = {
    lastResult: null as any,
    timestamp: 0,
    isValid: function() {
      return this.lastResult && Date.now() - this.timestamp < cacheTimeoutMs;
    },
    set: function(result: any) {
      this.lastResult = result;
      this.timestamp = Date.now();
    },
    get: function() {
      return this.lastResult;
    },
    clear: function() {
      this.lastResult = null;
      this.timestamp = 0;
    }
  };
  
  // Função para extrair mensagem de erro detalhada
  const extractDetailedErrorMessage = (error: any): string => {
    if (!error) return "Erro desconhecido";
    
    if (error.message?.includes("Edge Function returned")) {
      console.log("Erro completo da Edge Function:", error);
      
      try {
        if (error.body) {
          const errorBody = JSON.parse(error.body);
          if (errorBody.error) return errorBody.error;
          if (errorBody.details) return errorBody.details;
          if (errorBody.message) return errorBody.message;
        }
      } catch (parseError) {
        console.log("Erro ao parsear corpo do erro:", parseError);
      }
      
      return "Erro de comunicação com o servidor. Verifique se você tem uma conexão estável com a internet e tente novamente.";
    }
    
    if (typeof error === 'object') {
      if (error.error) return error.error;
      if (error.message) return error.message;
      if (error.details) return error.details;
    }
    
    return typeof error === 'string' ? error : JSON.stringify(error);
  };
  
  // Função com timeout
  const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operação excedeu o tempo limite de ${timeoutMs/1000} segundos`));
      }, timeoutMs);
      
      promise.then(
        (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  };
  
  const createCheckoutSession = async () => {
    setIsLoading(true);
    
    try {
      console.log("Iniciando criação de sessão de checkout");
      
      const { data, error } = await withTimeout(
        supabase.functions.invoke('create-checkout'),
        15000
      );
      
      if (error) {
        console.error("Erro detalhado ao invocar função create-checkout:", error);
        throw new Error(`Erro na função create-checkout: ${extractDetailedErrorMessage(error)}`);
      }
      
      if (data.error) {
        if (data.redirectToPortal) {
          toast({
            title: "Você já possui uma assinatura ativa",
            description: "Redirecionando para o portal de gerenciamento de assinatura...",
            duration: 3000,
          });
          
          return { 
            success: false, 
            error: { message: data.error },
            redirectToPortal: true 
          };
        }
        
        throw new Error(data.error);
      }
      
      sessionStorage.setItem("new_subscriber", "true");
      
      // Clear cache when starting new subscription
      verificationCache.clear();
      
      // Update profile after a brief delay
      setTimeout(async () => {
        await verifySubscriptionStatus();
      }, 2000);
      
      window.open(data.url, '_blank');
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro completo ao criar sessão de checkout:", error);
      
      const detailedMessage = extractDetailedErrorMessage(error);
      
      toast({
        variant: "destructive",
        title: "Erro ao iniciar processo de assinatura",
        description: detailedMessage,
        duration: 5000,
      });
      
      return { 
        success: false, 
        error,
        redirectToPortal: false
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifySubscriptionStatus = async () => {
    if (isLoading) {
      console.log("Já existe uma verificação em andamento, ignorando chamada");
      return { 
        success: false, 
        error: { message: "Já existe uma verificação em andamento" },
        has_access: false
      };
    }
    
    if (verificationCache.isValid()) {
      console.log("Retornando resultado em cache para verificação de assinatura");
      return verificationCache.get();
    }
    
    setIsLoading(true);
    
    try {
      console.log("Verificando status de assinatura");
      
      const { data, error } = await withTimeout(
        supabase.functions.invoke('check-subscription'),
        15000
      );
      
      if (error) {
        console.error("Erro detalhado ao invocar função check-subscription:", error);
        throw new Error(`Erro na verificação de assinatura: ${extractDetailedErrorMessage(error)}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log("Resposta da verificação de assinatura:", data);
      
      // Always update the profile
      await updateUserProfile();
      
      const result = { 
        success: true, 
        has_access: data.has_access,
        plan: data.plan,
        subscription_status: data.subscription_status,
        subscription_end: data.subscription_end_date
      };
      
      verificationCache.set(result);
      
      return result;
    } catch (error: any) {
      console.error("Erro completo ao verificar status da assinatura:", error);
      
      const detailedMessage = extractDetailedErrorMessage(error);
      
      toast({
        variant: "destructive",
        title: "Erro ao verificar assinatura",
        description: detailedMessage,
        duration: 5000,
      });
      
      const errorResult = { 
        success: false, 
        error: { message: detailedMessage },
        has_access: false
      };
      
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };
  
  const openCustomerPortal = async () => {
    setIsLoading(true);
    
    try {
      console.log("Iniciando abertura do portal do cliente");
      
      const { data, error } = await withTimeout(
        supabase.functions.invoke('customer-portal'),
        15000
      );
      
      if (error) {
        console.error("Erro detalhado ao invocar função customer-portal:", error);
        throw new Error(`Erro no portal do cliente: ${extractDetailedErrorMessage(error)}`);
      }
      
      if (data.error) {
        if (data.error.includes("Portal do cliente do Stripe não está configurado")) {
          throw new Error("O Portal do Cliente do Stripe não está configurado. Acesse o Dashboard do Stripe para configurá-lo em: Configurações > Portal do Cliente.");
        }
        
        throw new Error(data.error);
      }
      
      if (data.url) {
        window.open(data.url, '_blank');
        return { success: true };
      } else {
        throw new Error("URL do portal não disponível");
      }
    } catch (error: any) {
      console.error("Erro completo ao abrir portal do cliente:", error);
      
      const detailedMessage = extractDetailedErrorMessage(error);
      
      toast({
        variant: "destructive",
        title: "Erro ao abrir portal de gerenciamento",
        description: detailedMessage,
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

  // Helper functions
  function extractDetailedErrorMessage(error: any): string {
    if (!error) return "Erro desconhecido";
    
    if (error.message?.includes("Edge Function returned")) {
      console.log("Erro completo da Edge Function:", error);
      
      try {
        if (error.body) {
          const errorBody = JSON.parse(error.body);
          if (errorBody.error) return errorBody.error;
          if (errorBody.details) return errorBody.details;
          if (errorBody.message) return errorBody.message;
        }
      } catch (parseError) {
        console.log("Erro ao parsear corpo do erro:", parseError);
      }
      
      return "Erro de comunicação com o servidor. Verifique se você tem uma conexão estável com a internet e tente novamente.";
    }
    
    if (typeof error === 'object') {
      if (error.error) return error.error;
      if (error.message) return error.message;
      if (error.details) return error.details;
    }
    
    return typeof error === 'string' ? error : JSON.stringify(error);
  }
  
  function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operação excedeu o tempo limite de ${timeoutMs/1000} segundos`));
      }, timeoutMs);
      
      promise.then(
        (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }
};
