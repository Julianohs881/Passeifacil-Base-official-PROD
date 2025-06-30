import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2, RefreshCw, AlertCircle } from "lucide-react";
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
                              (userProfile && isPro()) ||
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
          
          // Agora, após atualizar o perfil, verificamos se ele é PRO
          if (isPro()) {
            // Se for um novo assinante PRO, mostrar mensagem de boas-vindas
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
            
            // Se já era PRO (ou se tornou PRO agora), redirecionar
            toast({
              title: "Assinatura ativa",
              description: "Você já possui uma assinatura ativa!",
              duration: 3000,
            });
            navigate("/quizzes");
            return;
          }
          // Se tem has_access=true mas não é PRO, não faz nada (continua na página de assinatura)
        }
        
        // Se chegamos até aqui (result.success && result.has_access é false, ou !result.success)
        // significa que não tem uma assinatura PRO ativa. Paramos a verificação
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
        }).catch(error => {
          console.error("Erro na verificação periódica:", error);
          // Incrementar tentativas em caso de erro
          setVerificationAttempts(prev => {
            // Se já atingimos o limite de tentativas, parar verificações automáticas
            if (prev + 1 >= maxVerificationAttempts) {
              setShouldContinueChecking(false);
            }
            return prev + 1;
          });
        });
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        console.log("Limpando intervalo de verificação automática");
        clearInterval(intervalId);
      }
    };
  }, [user, userProfile, navigate, toast, updateUserProfile, verifySubscriptionStatus, verificationAttempts, maxVerificationAttempts, isRetrying, checkingStatus, shouldContinueChecking]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Função auxiliar para checar status e redirecionar se virar PRO
    const checkAndRedirectIfPro = async (label: string) => {
      const result = await verifySubscriptionStatus();
      if (result.success && result.has_access) {
        await updateUserProfile();
        if (isPro()) {
          toast({
            title: "Assinatura ativada!",
            description: `Seu acesso foi liberado com sucesso (${label}).`,
            duration: 4000,
          });
          navigate("/quizzes");
        }
      }
    };

    // Guardar timeouts para limpar depois
    const timeouts: NodeJS.Timeout[] = [];

    // Agendar checagens em 30s, 1min e 5min
    timeouts.push(setTimeout(() => checkAndRedirectIfPro('30s'), 30000));
    timeouts.push(setTimeout(() => checkAndRedirectIfPro('1min'), 60000));
    timeouts.push(setTimeout(() => checkAndRedirectIfPro('5min'), 300000));

    // Limpar timeouts se o componente desmontar
    // (garantir que não haja vazamento de memória)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      return () => {
        timeouts.forEach(clearTimeout);
      };
      // Não adicionar dependências, pois queremos rodar só no unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fluxo normal de assinatura
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
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Plano Gratuito */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-xl text-center">Plano Gratuito</CardTitle>
            <CardDescription className="text-gray-600 text-center">
              Limitado mas funcional
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold">R$0<span className="text-base font-normal text-gray-500">/mês</span></p>
            </div>
            
            <ul className="space-y-3">
              {[
                "Criar quizzes ilimitados",
                "Quizzes apenas privados",
                "Suporte básico"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
              
              {[
                "Explorar",
                "Sem criação com IA",
                "Sem compartilhamento",
                "Sem importação"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Plano Atual
            </Button>
          </CardFooter>
        </Card>

        {/* Plano PRO */}
        <Card className="border-2 border-violet-200 shadow-lg relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Recomendado
            </span>
          </div>
          
          <CardHeader className="bg-violet-500 text-white">
            <CardTitle className="text-2xl text-center">Assinatura PRO</CardTitle>
            <CardDescription className="text-violet-100 text-center">
              Acesso completo a todas as funcionalidades
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">R$14,90<span className="text-base font-normal text-gray-500">/mês</span></p>
            </div>
            
            <ul className="space-y-3 mt-6">
              {[
                "Criação ilimitada de quizzes",
                "Acesso ilimitado a quizzes públicos",
                "Compartilhamento de quizzes",
                "Geração de questões com IA (50/mês)",
                "Importação de quizzes",
                "Quizzes públicos e privados",
                "Suporte prioritário"
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            {/* Se o usuário for PRO, mostra botão de gerenciar. Caso contrário, mostra assinar. */}
            {isPro() ? (
               <Button 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg"
                onClick={openCustomerPortal}
                disabled={isLoading}
              >
                Gerenciar Assinatura
              </Button>
            ) : (
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
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Se o usuário for PRO, não mostra a seção de erro/retry. */}
      {!isPro() && verificationError && (
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
    </div>
  );
};

export default Subscription;
