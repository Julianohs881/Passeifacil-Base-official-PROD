
import React, { useState } from "react";
import { Crown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UpgradeBannerProps {
  onUpgradeClick: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ onUpgradeClick }) => {
  const { isPro } = useAuth();
  const { createCheckoutSession, isLoading } = useStripeSubscription();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Função para lidar com o clique direto no botão de upgrade
  const handleDirectUpgrade = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setErrorMessage(null);
    
    try {
      const result = await createCheckoutSession();
      if (!result.success && result.error) {
        // Armazenar a mensagem de erro para exibição
        setErrorMessage(
          result.error.message || 
          "Ocorreu um erro ao processar sua solicitação. Verifique os logs para mais detalhes."
        );
      }
    } catch (error: any) {
      console.error("Erro não tratado ao processar checkout:", error);
      setErrorMessage(error?.message || "Erro inesperado ao processar assinatura");
      toast({
        variant: "destructive",
        title: "Erro ao processar assinatura",
        description: "Por favor, tente novamente ou entre em contato com o suporte.",
        duration: 5000,
      });
    }
  };
  
  // Don't show banner for PRO users
  if (isPro()) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center mb-3 sm:mb-0">
        <Crown className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
        <p className="text-sm text-gray-700">
          No plano gratuito? Libere IA, explorar, importar/exportar e muito mais com o PRO!
        </p>
      </div>
      <div className="flex flex-col w-full sm:w-auto">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-2 flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mr-1 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{errorMessage}</p>
          </div>
        )}
        <div className="flex space-x-2 w-full">
          <Button 
            onClick={isLoading ? undefined : onUpgradeClick}
            size="sm"
            disabled={isLoading}
            className="bg-white border border-amber-400 text-amber-600 hover:bg-amber-50 whitespace-nowrap w-full sm:w-auto"
          >
            Ver benefícios
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={isLoading ? undefined : handleDirectUpgrade}
                  size="sm"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 whitespace-nowrap w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>Assinar PRO</>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Inicia o processo de assinatura do plano PRO</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default UpgradeBanner;
