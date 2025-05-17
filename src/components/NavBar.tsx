
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Check, Eye, Crown, Settings } from "lucide-react";
import PlanBadge from "./PlanBadge";
import PremiumFeatureGate from "./PremiumFeatureGate";
import { useState, useEffect } from "react";
import PlanUpgradeDialog from "./PlanUpgradeDialog";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const { user, signOut, userProfile, isPro } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const { verifySubscriptionStatus, openCustomerPortal, isLoading } = useStripeSubscription();
  const { toast } = useToast();

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
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <GraduationCap className="w-10 h-10 text-blue-900" />
            <Check className="w-5 h-5 text-emerald-500 absolute bottom-0 right-0" />
          </div>
          <span className="ml-3 text-xl font-bold text-blue-900">Passei Fácil</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {userProfile && (
                <div className="flex items-center gap-2">
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
              
              <PremiumFeatureGate feature="explore">
                <Link to="/explore" className="flex items-center text-sm text-gray-600 hover:text-blue-900">
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline-block">Explorar</span>
                </Link>
              </PremiumFeatureGate>
              
              <span className="text-sm text-gray-600 hidden md:inline-block">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-blue-900 hover:bg-blue-50"
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-900 rounded-full">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 rounded-full">
                  Criar conta
                </Button>
              </Link>
            </>
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
