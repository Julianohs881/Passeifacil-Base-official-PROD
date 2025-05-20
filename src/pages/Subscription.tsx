
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

const Subscription = () => {
  const { user, userProfile, updateUserProfile, signOut, authError } = useAuth();
  const { createCheckoutSession, verifySubscriptionStatus, isLoading } = useStripeSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [maxVerificationAttempts] = useState(2); // Maximum verification attempts
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [checkoutTimeoutId, setCheckoutTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Safely perform logout, ensuring UI state is reset
  const safeLogout = useCallback(async () => {
    // Clear any pending timeouts
    if (checkoutTimeoutId) {
      clearTimeout(checkoutTimeoutId);
    }
    
    // Reset local state
    setCheckingStatus(false);
    setVerificationError(null);
    setVerificationAttempts(0);
    
    // Clear session storage items
    sessionStorage.removeItem("new_subscriber");
    sessionStorage.removeItem("verification_error_timestamp");
    
    try {
      // Perform logout
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force page refresh as last resort
      window.location.href = "/login";
    }
  }, [signOut, navigate, checkoutTimeoutId]);

  // Effect to handle auth errors
  useEffect(() => {
    if (authError) {
      toast({
        title: "Erro de autenticação",
        description: authError,
        variant: "destructive",
      });
      setCheckingStatus(false);
    }
  }, [authError, toast]);

  useEffect(() => {
    // Maximum time to wait for subscription verification
    const VERIFICATION_TIMEOUT = 15000; // 15 seconds
    let timeoutId: NodeJS.Timeout | null = null;
    
    const checkSubscriptionStatus = async () => {
      // If user isn't logged in, no need to verify
      if (!user) {
        setCheckingStatus(false);
        return;
      }
      
      // Start timeout for subscription verification
      timeoutId = setTimeout(() => {
        if (checkingStatus) {
          setVerificationError("Verificação de assinatura excedeu o tempo limite");
          setCheckingStatus(false);
          toast({
            title: "Tempo excedido",
            description: "A verificação demorou muito tempo. Você pode tentar novamente ou fazer logout.",
            variant: "destructive",
          });
        }
      }, VERIFICATION_TIMEOUT);
      setCheckoutTimeoutId(timeoutId);
      
      // Check if user is a new subscriber (returning from checkout)
      const isNewSubscriber = sessionStorage.getItem("new_subscriber");
      
      // Determine if we should check subscription status
      // Check only in specific cases:
      // 1. If returning from checkout
      // 2. If the user has has_access explicitly set to true
      // 3. If we have a subscription parameter in the URL
      const shouldCheckStatus = isNewSubscriber || 
                              (userProfile && userProfile.has_access === true) || 
                              window.location.search.includes('subscription=');
      
      // For new users without subscription, show page directly or
      // if we've already tried verification several times
      if (!shouldCheckStatus && verificationAttempts >= maxVerificationAttempts) {
        console.log("Showing subscription page for new user or after max attempts");
        setCheckingStatus(false);
        setVerificationError(null);
        if (timeoutId) clearTimeout(timeoutId);
        return;
      }
      
      try {
        // Increment attempt counter
        setVerificationAttempts(prev => prev + 1);
        console.log(`Attempt ${verificationAttempts + 1} to verify subscription status`);
        setVerificationError(null);
        
        // Manually verify subscription status with Stripe
        const result = await verifySubscriptionStatus();
        console.log("Subscription verification returned:", result);
        
        // If user has access after verification, update local profile
        if (result.success && result.has_access) {
          await updateUserProfile();
          
          // If this is a new subscriber, show welcome message
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
          
          // If already has access, redirect to dashboard
          toast({
            title: "Assinatura ativa",
            description: "Você já possui uma assinatura ativa!",
            duration: 3000,
          });
          navigate("/quizzes");
          return;
        }
        
        // If we reach here, user doesn't have an active subscription
        // Stop checking and show subscription page
        setCheckingStatus(false);
      } catch (error) {
        console.error("Error verifying subscription status:", error);
        
        // Store error message for display
        let errorMessage = "Erro de comunicação com o servidor";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = String(error.message);
        }
        
        setVerificationError(errorMessage);
        
        // On verification error, show subscription page
        setCheckingStatus(false);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };
    
    // Initial verification
    checkSubscriptionStatus();
    
    // Check status every 5 seconds ONLY if we're on the page after checkout
    // to avoid infinite loop for new users
    const isAfterCheckout = window.location.search.includes('subscription=');
    
    let intervalId: NodeJS.Timeout | undefined;
    if (isAfterCheckout && user) {
      intervalId = setInterval(() => {
        // Exit early if no longer checking status
        if (!checkingStatus) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        
        console.log("Checking subscription after checkout");
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
        }).catch(error => {
          console.error("Error in periodic verification:", error);
          // Don't flood user with error messages
        });
      }, 5000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, userProfile, navigate, toast, updateUserProfile, verifySubscriptionStatus, verificationAttempts, maxVerificationAttempts, checkingStatus]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
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
    } catch (error) {
      console.error("Error starting subscription process:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar o processo de assinatura. Por favor, tente novamente.",
        duration: 5000,
      });
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
          <p className="text-gray-600">Verificando status da assinatura...</p>
          
          {verificationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 max-w-md text-center">
              <p className="font-medium">Erro ao verificar assinatura</p>
              <p className="text-sm mt-1">{verificationError}</p>
            </div>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setCheckingStatus(false)}
              className="mt-3"
            >
              Cancelar verificação
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              onClick={safeLogout}
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
        <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-center">
          <p className="font-medium">Erro ao verificar assinatura</p>
          <p className="text-sm mt-1">{verificationError}</p>
          <Button 
            variant="outline"
            size="sm"
            onClick={safeLogout}
            className="mt-3"
          >
            Sair
          </Button>
        </div>
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
