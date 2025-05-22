
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, userProfile, signOut, updateUserProfile } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  // Set timeout to show emergency logout if loading takes too long
  useEffect(() => {
    // Only set timeout if we're in a loading state
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // Show emergency logout after 5 seconds of loading
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Ensure profile is refreshed when route is accessed
  useEffect(() => {
    const refreshProfile = async () => {
      if (user && !loading && !isRefreshingProfile) {
        setIsRefreshingProfile(true);
        try {
          console.log("ProtectedRoute: Refreshing user profile");
          await updateUserProfile();
          console.log("ProtectedRoute: Profile refresh complete");
        } catch (error) {
          console.error("ProtectedRoute: Error refreshing profile:", error);
        } finally {
          setIsRefreshingProfile(false);
        }
      }
    };
    
    refreshProfile();
  }, [user, loading]);

  const handleEmergencyLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout de emergência:", error);
      // Force reload to login page as last resort
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
        
        {loadingTimeout && (
          <Alert variant="warning" className="mt-6 border-amber-200 bg-amber-50 max-w-md">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-700">Está demorando mais que o normal</AlertTitle>
            <AlertDescription className="text-amber-700">
              Parece que estamos tendo dificuldades para carregar seus dados. 
              Você pode tentar novamente ou sair e fazer login novamente.
            </AlertDescription>
            <div className="mt-3 flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleEmergencyLogout}
                className="border-amber-500 text-amber-700 hover:bg-amber-100"
              >
                Sair e voltar para login
              </Button>
            </div>
          </Alert>
        )}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Log user profile for debugging purposes
  console.log("ProtectedRoute checking user access:", {
    userId: user.id,
    plan: userProfile?.plan,
    has_access: userProfile?.has_access,
    manual_access: userProfile?.manual_access,
    subscription_status: userProfile?.subscription_status
  });
  
  // Verificar o acesso baseado nos campos do perfil
  if (userProfile) {
    // Verificação principal: se has_access é explicitamente falso
    // E não estamos na página de assinatura (para evitar loop)
    if (typeof userProfile.has_access === 'boolean' && userProfile.has_access === false &&
        window.location.pathname !== '/subscription') {
      console.log("User does not have subscription access, redirecting to subscription page");
      return <Navigate to="/subscription" replace />;
    }
    
    // Para compatibilidade retroativa - se não tiver has_access definido, verificar o plano
    if (userProfile.has_access === undefined && userProfile.plan === 'gratuito' &&
        window.location.pathname !== '/subscription') {
      console.log("User has free plan and no has_access field, redirecting to subscription page");
      return <Navigate to="/subscription" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
