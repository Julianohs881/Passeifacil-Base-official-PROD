
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Check, Eye, Crown, Settings, Menu, X } from "lucide-react";
import PlanBadge from "./PlanBadge";
import PremiumFeatureGate from "./PremiumFeatureGate";
import { useState, useEffect } from "react";
import PlanUpgradeDialog from "./PlanUpgradeDialog";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const NavBar = () => {
  const { user, signOut, userProfile, isPro } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const { verifySubscriptionStatus, openCustomerPortal, isLoading } = useStripeSubscription();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleOpenUpgradeDialog = () => {
    setIsUpgradeDialogOpen(true);
  };
  
  const handleManageSubscription = async () => {
    if (isPro()) {
      await openCustomerPortal();
    } else {
      setIsUpgradeDialogOpen(true);
    }
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Verificar o status da assinatura quando parâmetros de URL indicam retorno do Stripe
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const subscriptionStatus = queryParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      // Verificar e atualizar o status da assinatura
      verifySubscriptionStatus().then((result) => {
        if (result.success) {
          toast({
            title: "Assinatura PRO ativada com sucesso!",
            description: "Você agora tem acesso a todos os recursos premium.",
            duration: 5000,
          });
          
          // Limpar os parâmetros da URL
          navigate(location.pathname, { replace: true });
        }
      });
    } else if (subscriptionStatus === 'canceled') {
      toast({
        title: "Processo de assinatura cancelado",
        description: "Você pode tentar novamente quando desejar.",
        duration: 5000,
      });
      
      // Limpar os parâmetros da URL
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo with maximum height */}
          <Link to="/" className="flex items-center">
            <div className="relative h-8 sm:h-12 flex items-center">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-900" />
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 absolute bottom-0 right-0" />
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-blue-900 whitespace-nowrap">Passei Fácil</span>
            </div>
          </Link>
          
          {/* Navigation buttons - always visible */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link to="/quizzes">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="whitespace-nowrap border-blue-500 text-blue-900 hover:bg-blue-50"
                  >
                    Meus Quizzes
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-blue-900 hover:bg-blue-50 whitespace-nowrap"
                >
                  Sair
                </Button>
                
                {userProfile && !isMobile && (
                  <div className="flex items-center gap-2 ml-2">
                    <PlanBadge plan={userProfile.plan} />
                    
                    <Button
                      onClick={handleManageSubscription}
                      size="sm"
                      disabled={isLoading}
                      className={`${isPro() 
                        ? "border border-amber-400 bg-white text-amber-600 hover:bg-amber-50" 
                        : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white"} rounded-full`}
                    >
                      {isLoading ? (
                        <span>Aguarde...</span>
                      ) : isPro() ? (
                        <>
                          <Settings className="h-3.5 w-3.5 mr-1" />
                          <span>Gerenciar PRO</span>
                        </>
                      ) : (
                        <>
                          <Crown className="h-3.5 w-3.5 mr-1" />
                          <span>Fazer Upgrade</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {!isMobile && (
                  <PremiumFeatureGate feature="explore">
                    <Link 
                      to="/explore" 
                      className="flex items-center text-sm text-gray-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="inline-block">Explorar</span>
                    </Link>
                  </PremiumFeatureGate>
                )}
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-500 text-blue-900 hover:bg-blue-50 whitespace-nowrap"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white whitespace-nowrap"
                  >
                    Criar conta
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile menu for additional options */}
            {user && isMobile && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMobileMenu} 
                  className="ml-1"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
                
                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                    {userProfile && (
                      <div className="px-4 py-2">
                        <PlanBadge plan={userProfile.plan} />
                        
                        <Button
                          onClick={handleManageSubscription}
                          size="sm"
                          disabled={isLoading}
                          className={`${isPro() 
                            ? "border border-amber-400 bg-white text-amber-600 hover:bg-amber-50" 
                            : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white"} rounded-full w-full mt-2`}
                        >
                          {isLoading ? (
                            <span>Aguarde...</span>
                          ) : isPro() ? (
                            <>
                              <Settings className="h-3.5 w-3.5 mr-1" />
                              <span>Gerenciar PRO</span>
                            </>
                          ) : (
                            <>
                              <Crown className="h-3.5 w-3.5 mr-1" />
                              <span>Fazer Upgrade</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <PremiumFeatureGate feature="explore">
                      <Link 
                        to="/explore" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          <span>Explorar</span>
                        </div>
                      </Link>
                    </PremiumFeatureGate>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Upgrade Dialog */}
      <PlanUpgradeDialog 
        isOpen={isUpgradeDialogOpen} 
        onClose={() => setIsUpgradeDialogOpen(false)} 
      />
    </header>
  );
};

export default NavBar;
