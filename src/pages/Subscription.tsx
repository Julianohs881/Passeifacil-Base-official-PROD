
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

const Subscription = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { createCheckoutSession, verifySubscriptionStatus, isLoading } = useStripeSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      // Se não houver usuário logado, não é necessário verificar
      if (!user) {
        setCheckingStatus(false);
        return;
      }
      
      // Verificar se existe um novo assinante pela sessão (retornando do checkout)
      const isNewSubscriber = sessionStorage.getItem("new_subscriber");
      
      try {
        // Verificar manualmente o status da assinatura no Stripe
        const result = await verifySubscriptionStatus();
        console.log("Verificação de assinatura retornou:", result);
        
        // Se o usuário tem acesso após a verificação, atualizar o perfil local
        if (result.success && result.has_access) {
          await updateUserProfile();
          
          // Se for um novo assinante, mostrar mensagem de boas-vindas
          if (isNewSubscriber) {
            toast({
              title: "Assinatura ativada com sucesso!",
              description: "Bem-vindo(a) ao Passei Fácil! Você já tem acesso completo.",
              duration: 5000,
            });
            
            sessionStorage.removeItem("new_subscriber");
            navigate("/quizzes");
            return;
          }
          
          // Se já tem acesso, redirecionar para dashboard
          toast({
            title: "Assinatura ativa",
            description: "Você já possui uma assinatura ativa!",
            duration: 3000,
          });
          navigate("/quizzes");
          return;
        }
        
        // Se chegamos até aqui, o usuário não tem assinatura ativa
        // Vamos parar de verificar e mostrar a página de assinatura
        setCheckingStatus(false);
      } catch (error) {
        console.error("Erro ao verificar status da assinatura:", error);
        setCheckingStatus(false);
      }
    };
    
    // Executar verificação inicial
    checkSubscriptionStatus();
    
    // Verificar o status a cada 5 segundos SOMENTE se estivermos na página após um checkout
    // para não ficar em loop infinito para novos usuários
    const isAfterCheckout = window.location.search.includes('subscription=');
    
    let intervalId: number | undefined;
    if (isAfterCheckout && user) {
      intervalId = window.setInterval(() => {
        console.log("Verificando assinatura após checkout");
        verifySubscriptionStatus().then(result => {
          if (result.success && result.has_access) {
            updateUserProfile().then(() => {
              toast({
                title: "Assinatura ativada!",
                description: "Seu acesso foi liberado com sucesso.",
                duration: 3000,
              });
              navigate("/quizzes");
            });
          }
        });
      }, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, userProfile, navigate, toast, updateUserProfile, verifySubscriptionStatus]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const result = await createCheckoutSession();
    if (result.redirectToPortal) {
      const portalResult = await useStripeSubscription().openCustomerPortal();
      if (!portalResult.success) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível abrir o portal de gerenciamento de assinatura.",
          duration: 5000,
        });
      }
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
          <p className="text-gray-600">Verificando status da assinatura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Assinatura Passei Fácil</h1>
      <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
        Para acessar a plataforma Passei Fácil, é necessário ser um assinante. 
        Assine agora e tenha acesso completo a todas as funcionalidades!
      </p>

      <div className="max-w-md mx-auto">
        <Card className="border-2 border-violet-200 shadow-lg">
          <CardHeader className="bg-violet-500 text-white">
            <CardTitle className="text-2xl text-center">Assinatura Passei Fácil</CardTitle>
            <CardDescription className="text-violet-100 text-center">
              Acesso completo a todas as funcionalidades
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">R$19,90<span className="text-base font-normal text-gray-500">/mês</span></p>
            </div>
            
            <ul className="space-y-3 mt-6">
              {[
                "Acesso ilimitado a todos os quizzes",
                "Criação ilimitada de quizzes",
                "Compartilhamento de quizzes",
                "Geração de questões com IA",
                "Suporte prioritário"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <Button 
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                </span>
              ) : "Assinar Agora"}
            </Button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Cancele a qualquer momento. Processado com segurança pelo Stripe.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;
