
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, userProfile, signOut } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
        
        {loadingTimeout && (
          <div className="mt-6 p-4 border border-amber-200 rounded-md bg-amber-50 max-w-md text-center">
            <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Está demorando mais que o normal</p>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Parece que estamos tendo dificuldades para carregar seus dados. 
              Você pode tentar novamente ou sair e fazer login novamente.
            </p>
            <Button 
              variant="outline" 
              onClick={handleEmergencyLogout}
              className="border-amber-500 text-amber-700 hover:bg-amber-100"
            >
              Sair e voltar para login
            </Button>
          </div>
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
