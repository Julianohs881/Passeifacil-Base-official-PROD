
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthContext";

export const useStripeSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();
  
  // Cache mais inteligente com TTL maior
  const cacheTimeoutMs = 120000; // 2 minutos
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
        console.error(`Timeout após ${timeoutMs}ms`);
        reject(new Error(`Operação excedeu o tempo limite de ${timeoutMs/1000} segundos`));
      }, timeoutMs);
      
      promise.then(
        (value) => {
          console.log("Promise resolvida com sucesso:", value);
          clearTimeout(timeoutId);
          resolve(value);
        },
        (error) => {
          console.error("Promise rejeitada com erro:", error);
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
  
  const cancelSubscription = async () => {
    setIsLoading(true);
    
    try {
      console.log("=== INICIANDO CANCELAMENTO DE ASSINATURA ===");
      
      toast({
        title: "Redirecionando para o Stripe...",
        description: "Você será redirecionado para cancelar sua assinatura",
        duration: 3000,
      });
      
      // Aguardar um pouco para o usuário ver a mensagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar diretamente para a URL específica do Stripe
      const stripePortalUrl = "https://billing.stripe.com/p/login/4gM3cvbuF3vu7kv3mY3ZK00";
      console.log("Redirecionando para:", stripePortalUrl);
      
      window.open(stripePortalUrl, '_blank');
      
      // Mostrar mensagem informativa
      toast({
        title: "Redirecionamento realizado",
        description: "Complete o cancelamento no Stripe. Sua conta será atualizada automaticamente após o cancelamento.",
        duration: 8000,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("=== ERRO NO CANCELAMENTO ===");
      console.error("Erro ao redirecionar para cancelamento:", error);
      
      toast({
        variant: "destructive",
        title: "Erro ao iniciar cancelamento",
        description: "Não foi possível redirecionar para o portal de cancelamento. Tente novamente.",
        duration: 5000,
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
      console.log("=== FINALIZANDO CANCELAMENTO ===");
    }
  };
  
  const fixInconsistentProfile = async () => {
    setIsLoading(true);
    
    try {
      console.log("=== CORRIGINDO PERFIL INCONSISTENTE ===");
      
      // Primeiro, verificar o status atual no Stripe
      const result = await verifySubscriptionStatus();
      
      if (result.success) {
        console.log("Status verificado no Stripe:", result);
        
        toast({
          title: "Perfil corrigido",
          description: "Seu status de assinatura foi atualizado corretamente.",
          duration: 3000,
        });
        
        return { success: true };
      } else {
        throw new Error("Falha ao verificar status no Stripe");
      }
    } catch (error: any) {
      console.error("Erro ao corrigir perfil inconsistente:", error);
      
        toast({
          variant: "destructive",
        title: "Erro ao corrigir perfil",
        description: "Não foi possível corrigir o status da sua conta. Tente fazer logout e login novamente.",
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
    cancelSubscription,
    fixInconsistentProfile
  };
};
