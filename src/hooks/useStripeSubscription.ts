
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
      return "Erro de comunicação com o servidor. Verifique os logs para mais detalhes.";
    }
    
    // Se for um erro com estrutura detalhada
    if (error.error) return error.error;
    
    // Se for um erro com mensagem simples
    if (error.message) return error.message;
    
    // Fallback para qualquer outro formato de erro
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
      console.error("Erro completo ao criar sessão de checkout:", error);
      
      const detailedMessage = extractDetailedErrorMessage(error);
      
      toast({
        variant: "destructive",
        title: "Erro ao iniciar processo de assinatura",
        description: detailedMessage,
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
      }
      
      return { 
        success: true, 
        subscribed: data.subscribed,
        plan: data.plan,
        subscription_end: data.subscription_end
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
