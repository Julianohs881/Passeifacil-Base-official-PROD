import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PixPaymentData {
  payment_id: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  status: string;
}

interface UseMercadoPagoPixReturn {
  createPixPayment: () => Promise<PixPaymentData | null>;
  loading: boolean;
  error: string | null;
}

export const useMercadoPagoPix = (): UseMercadoPagoPixReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const createPixPayment = async (): Promise<PixPaymentData | null> => {
    if (!user) {
      setError("Usuário não autenticado");
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer o pagamento.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    setError(null);
    
    // Limpa cache do navegador para forçar nova requisição
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pix_payment_cache');
    }

    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-pix', {
        body: {
          user_id: user.id,
          email: user.email,
          timestamp: Date.now() // Força regeneração
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data) {
        throw new Error("Resposta inválida do servidor");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Pagamento PIX criado!",
        description: "Escaneie o QR Code para finalizar o pagamento.",
      });

      return data as PixPaymentData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao criar pagamento",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPixPayment,
    loading,
    error,
  };
}; 