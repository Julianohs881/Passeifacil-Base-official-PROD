
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
    <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - com largura máxima */}
          <Link to="/" className="flex items-center max-w-[180px]">
            <div className="relative">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-blue-900" />
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 absolute bottom-0 right-0" />
            </div>
            <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-blue-900 truncate">Passei Fácil</span>
          </Link>
          
          {/* Mobile menu toggle */}
          {isMobile && (
            <button 
              onClick={toggleMobileMenu}
              className="p-2 text-blue-900 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}
          
          {/* Desktop navigation */}
          {(!isMobile || mobileMenuOpen) && (
            <div 
              className={`${
                isMobile 
                  ? "absolute top-full left-0 w-full bg-white shadow-md py-4 px-6 flex flex-col space-y-4 mt-0.5" 
                  : "flex items-center space-x-4"
              }`}
            >
              {user ? (
                <>
                  {userProfile && (
                    <div className={`flex items-center gap-2 ${isMobile ? "w-full justify-between" : ""}`}>
                      <PlanBadge plan={userProfile.plan} />
                      
                      <Button
                        onClick={handleManageSubscription}
                        size="sm"
                        disabled={isLoading}
                        className={`${isPro() 
                          ? "border border-amber-400 bg-white text-amber-600 hover:bg-amber-50" 
                          : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white"} rounded-full ${
                            isMobile ? "flex-1" : ""
                          }`}
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
                      className={`flex items-center text-sm text-gray-600 hover:text-blue-900 ${
                        isMobile ? "w-full justify-between py-2" : ""
                      }`}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="inline-block">Explorar</span>
                    </Link>
                  </PremiumFeatureGate>
                  
                  <div className={`text-sm text-gray-600 ${isMobile ? "w-full py-2" : "hidden md:inline-block"}`}>
                    {user.email}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className={`text-blue-900 hover:bg-blue-50 ${isMobile ? "w-full justify-center" : ""}`}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => isMobile && setMobileMenuOpen(false)}
                    className={isMobile ? "w-full" : ""}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`border-blue-500 text-blue-900 rounded-full ${isMobile ? "w-full" : ""}`}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => isMobile && setMobileMenuOpen(false)}
                    className={isMobile ? "w-full" : ""}
                  >
                    <Button 
                      size="sm" 
                      className={`bg-blue-500 hover:bg-blue-600 rounded-full ${isMobile ? "w-full" : ""}`}
                    >
                      Criar conta
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
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

