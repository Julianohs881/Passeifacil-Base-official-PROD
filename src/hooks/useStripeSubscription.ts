
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthContext";

export const useStripeSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateUserProfile } = useAuth();
  
  // Função para extrair mensagem de erro detalhada
  const extractDetailedErrorMessage = (error: any): string => {
    if (!error) return "Erro desconhecido";
    
    // Se o erro vier diretamente da função Edge
    if (error.message?.includes("Edge Function returned")) {
      console.log("Erro completo da Edge Function:", error);
      
      try {
        // Tentar extrair o corpo da resposta como JSON
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
    
    // Se for um erro com estrutura detalhada
    if (typeof error === 'object') {
      if (error.error) return error.error;
      if (error.message) return error.message;
      if (error.details) return error.details;
    }
    
    // Se for um erro com mensagem simples
    return typeof error === 'string' ? error : JSON.stringify(error);
  };
  
  const createCheckoutSession = async () => {
    setIsLoading(true);
    
    try {
      // Registrar início da operação para debugging
      console.log("Iniciando criação de sessão de checkout");
      
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error("Erro detalhado ao invocar função create-checkout:", error);
        throw new Error(`Erro na função create-checkout: ${extractDetailedErrorMessage(error)}`);
      }
      
      if (data.error) {
        // Se o erro indicar que o usuário já tem uma assinatura ativa
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
      
      // Flag to know this is a new subscriber
      sessionStorage.setItem("new_subscriber", "true");
      
      // Abrir a URL de checkout do Stripe em uma nova aba
      window.open(data.url, '_blank');
      
      // Verificar o status da assinatura após um breve atraso
      // para permitir que o usuário complete o processo de checkout
      setTimeout(async () => {
        await verifySubscriptionStatus();
      }, 5000);
      
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
    setIsLoading(true);
    
    try {
      console.log("Verificando status de assinatura");
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error("Erro detalhado ao invocar função check-subscription:", error);
        throw new Error(`Erro na verificação de assinatura: ${extractDetailedErrorMessage(error)}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Atualizar o perfil do usuário com o status da assinatura
      if (data) {
        await updateUserProfile();
        
        // Check if user is now subscribed and show toast
        if (data.has_access) {
          // This toast will be shown via NavBar component when it detects the user has access
          sessionStorage.setItem("new_subscriber", "true");
        }
      }
      
      return { 
        success: true, 
        has_access: data.has_access,
        plan: data.plan,
        subscription_status: data.subscription_status,
        subscription_end: data.subscription_end_date
      };
    } catch (error: any) {
      console.error("Erro completo ao verificar status da assinatura:", error);
      
      const detailedMessage = extractDetailedErrorMessage(error);
      
      toast({
        variant: "destructive",
        title: "Erro ao verificar assinatura",
        description: detailedMessage,
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
      console.log("Iniciando abertura do portal do cliente");
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error("Erro detalhado ao invocar função customer-portal:", error);
        throw new Error(`Erro no portal do cliente: ${extractDetailedErrorMessage(error)}`);
      }
      
      if (data.error) {
        // Verifica se é o erro específico de configuração do portal não encontrada
        if (data.error.includes("Portal do cliente do Stripe não está configurado")) {
          throw new Error("O Portal do Cliente do Stripe não está configurado. Acesse o Dashboard do Stripe para configurá-lo em: Configurações > Portal do Cliente.");
        }
        
        throw new Error(data.error);
      }
      
      // Abrir o portal de clientes do Stripe em uma nova aba
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
};
