
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Subscription = () => {
  const { user, userProfile, updateUserProfile, signOut, isPro } = useAuth();
  const { createCheckoutSession, verifySubscriptionStatus, isLoading, openCustomerPortal } = useStripeSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estados para gerenciar verificações e erros
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [maxVerificationAttempts] = useState(2); // Limite de 2 tentativas de verificação
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [shouldContinueChecking, setShouldContinueChecking] = useState(true);

  useEffect(() => {
    // If user already has premium access and we're not in the middle of a checkout flow,
    // redirect them to quizzes immediately
    if (isPro() && !sessionStorage.getItem("new_subscriber") && !window.location.search.includes('subscription=')) {
      console.log("User already has premium access, redirecting to quizzes");
      navigate("/quizzes");
      return;
    }

    const checkSubscriptionStatus = async () => {
      // Se não houver usuário logado, não é necessário verificar
      if (!user) {
        setCheckingStatus(false);
        return;
      }
      
      // Verificar se existe um novo assinante pela sessão (retornando do checkout)
      const isNewSubscriber = sessionStorage.getItem("new_subscriber");
      
      // Determinar se devemos verificar o status da assinatura
      const shouldCheckStatus = isNewSubscriber || 
                              window.location.search.includes('subscription=') ||
                              isRetrying;
      
      // Não verificar se já atingimos o limite de tentativas ou não devemos mais continuar verificando
      if ((!shouldCheckStatus && verificationAttempts >= maxVerificationAttempts) || !shouldContinueChecking) {
        console.log("Parando verificações automáticas após tentativas máximas ou cancelamento manual");
        setCheckingStatus(false);
        return;
      }
      
      try {
        // Incrementar contador de tentativas
        setVerificationAttempts(prev => prev + 1);
        console.log(`Tentativa ${verificationAttempts + 1} de verificar status da assinatura`);
        setVerificationError(null);
        
        // Verificar manualmente o status da assinatura no Stripe
        const result = await verifySubscriptionStatus();
        console.log("Verificação de assinatura retornou:", result);
        
        // Se o usuário tem acesso após a verificação, atualizar o perfil local
        if (result.success && result.has_access) {
          await updateUserProfile();
          
          // Se for um novo assinante, mostrar mensagem de boas-vindas e redirecionar
          if (isNewSubscriber) {
            toast({
              title: "Assinatura ativada com sucesso!",
              description: "Bem-vindo(a) ao Passei Fácil! Você já tem acesso completo.",
              duration: 5000,
            });
            
            // Remove the new subscriber flag
            sessionStorage.removeItem("new_subscriber");
            
            // Check if premium access was granted
            if (isPro()) {
              console.log("Premium access granted after subscription, redirecting to quizzes");
              navigate("/quizzes");
              return;
            }
          }
          
          // If already has premium access, redirect to quizzes
          if (isPro()) {
            toast({
              title: "Assinatura ativa",
              description: "Você já possui uma assinatura ativa!",
              duration: 3000,
            });
            navigate("/quizzes");
            return;
          }
        }
        
        // Se chegamos até aqui, vamos parar de verificar
        setCheckingStatus(false);
        setIsRetrying(false);
      } catch (error) {
        console.error("Erro ao verificar status da assinatura:", error);
        
        // Armazenar a mensagem de erro para exibição
        let errorMessage = "Erro de comunicação com o servidor";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = String(error.message);
        }
        
        setVerificationError(errorMessage);
        
        // Em caso de erro na verificação, mostrar a página de assinatura após tentativas máximas
        if (verificationAttempts >= maxVerificationAttempts) {
          setCheckingStatus(false);
          setIsRetrying(false);
          setShouldContinueChecking(false); // Parar verificações automáticas após tentativas máximas
        }
      }
    };
    
    // Executar verificação inicial
    checkSubscriptionStatus();
    
    // Verificar o status a cada 5 segundos SOMENTE se:
    // 1. Estivermos na página após um checkout
    // 2. Ainda não ultrapassamos o limite de tentativas
    // 3. Não estivermos em modo de retry manual
    // 4. shouldContinueChecking for true
    const isAfterCheckout = window.location.search.includes('subscription=');
    
    let intervalId: number | undefined;
    if (isAfterCheckout && user && verificationAttempts < maxVerificationAttempts && !isRetrying && checkingStatus && shouldContinueChecking) {
      intervalId = window.setInterval(async () => {
        console.log("Verificação periódica de assinatura após checkout");
        try {
          const result = await verifySubscriptionStatus();
          if (result.success && result.has_access) {
            // Important: Force profile refresh to get latest data
            await updateUserProfile();
            
            // Check if premium access is now granted
            if (isPro()) {
              toast({
                title: "Assinatura ativada!",
                description: "Seu acesso foi liberado com sucesso.",
                duration: 3000,
              });
              // Clear session storage flag
              sessionStorage.removeItem("new_subscriber");
              // Redirect to quizzes
              navigate("/quizzes");
              // Clear the interval
              if (intervalId) clearInterval(intervalId);
            }
          } else {
            // Incrementar tentativas de verificação automática
            setVerificationAttempts(prev => {
              // Se já atingimos o limite de tentativas, parar verificações automáticas
              if (prev + 1 >= maxVerificationAttempts) {
                setShouldContinueChecking(false);
              }
              return prev + 1;
            });
          }
        } catch (error) {
          console.error("Erro na verificação periódica:", error);
          // Incrementar tentativas em caso de erro
          setVerificationAttempts(prev => {
            // Se já atingimos o limite de tentativas, parar verificações automáticas
            if (prev + 1 >= maxVerificationAttempts) {
              setShouldContinueChecking(false);
            }
            return prev + 1;
          });
        }
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        console.log("Limpando intervalo de verificação automática");
        clearInterval(intervalId);
      }
    };
  }, [user, userProfile, navigate, toast, updateUserProfile, verifySubscriptionStatus, verificationAttempts, maxVerificationAttempts, isRetrying, checkingStatus, shouldContinueChecking, isPro]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Indicar que estamos processando
    try {
      const result = await createCheckoutSession();
      
      if (result.redirectToPortal) {
        const portalResult = await openCustomerPortal();
        if (!portalResult.success) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível abrir o portal de gerenciamento de assinatura.",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao iniciar processo de assinatura:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar o processo de assinatura. Por favor, tente novamente.",
        duration: 5000,
      });
    }
  };
  
  // Função para retry manual
  const handleRetryVerification = () => {
    setIsRetrying(true);
    setCheckingStatus(true);
    setVerificationAttempts(0);
    setVerificationError(null);
    setShouldContinueChecking(true); // Reativar verificações automáticas
  };
  
  // Função para cancelar verificação
  const handleCancelVerification = () => {
    setCheckingStatus(false);
    setShouldContinueChecking(false);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Forçar recarregamento da página em último caso
      window.location.href = "/login";
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center gap-4 max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
          <p className="text-gray-600 text-center">Verificando status da assinatura...</p>
          
          {verificationError && (
            <Alert variant="destructive" className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao verificar assinatura</AlertTitle>
              <AlertDescription>{verificationError}</AlertDescription>
              
              {verificationAttempts >= maxVerificationAttempts && (
                <div className="mt-3">
                  <p className="text-sm mb-2">
                    Atingimos o número máximo de tentativas automáticas. Você pode:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleRetryVerification}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Tentar verificar novamente
                    </Button>
                    
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={handleCancelVerification}
                    >
                      Continuar sem verificar
                    </Button>
                  </div>
                </div>
              )}
            </Alert>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleCancelVerification}
              className="mt-3"
            >
              Cancelar verificação
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mt-3"
            >
              Sair
            </Button>
          </div>
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

      {verificationError && (
        <Alert variant="destructive" className="max-w-md mx-auto mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao verificar assinatura</AlertTitle>
          <AlertDescription>{verificationError}</AlertDescription>
          <div className="flex flex-col sm:flex-row justify-center gap-2 mt-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRetryVerification}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar verificar novamente
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </Alert>
      )}

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
