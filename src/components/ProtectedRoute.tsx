
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/use-toast";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, userProfile, authError, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Maximum time to wait for loading before showing error
  const MAX_LOADING_TIME = 10000; // 10 seconds

  useEffect(() => {
    // If loading takes too long, we'll consider it an error
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        // Only show the timeout toast if we're still loading
        if (loading) {
          toast({
            title: "Tempo excedido",
            description: "Falha ao carregar dados do usuário. Tente fazer login novamente.",
            variant: "destructive",
          });
          
          // Force logout after timeout to avoid being stuck
          signOut();
          navigate("/login");
        }
      }, MAX_LOADING_TIME);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, navigate, signOut, toast]);

  // Show authentication error if present
  useEffect(() => {
    if (authError) {
      toast({
        title: "Erro de autenticação",
        description: authError,
        variant: "destructive",
      });
    }
  }, [authError, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mb-4"></div>
        <p className="text-gray-600">Verificando autenticação...</p>
        
        {/* Add manual logout button that always works */}
        <button 
          onClick={() => {
            signOut();
            navigate("/login");
          }}
          className="mt-6 text-sm text-violet-600 hover:text-violet-800 underline"
        >
          Cancelar e voltar ao login
        </button>
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
  
  // Check access based on profile
  if (userProfile) {
    // Main check: if has_access is explicitly false
    // And we're not on the subscription page (to avoid loop)
    if (typeof userProfile.has_access === 'boolean' && userProfile.has_access === false &&
        window.location.pathname !== '/subscription') {
      console.log("User does not have subscription access, redirecting to subscription page");
      return <Navigate to="/subscription" replace />;
    }
    
    // For backward compatibility - if has_access not defined, check plan
    if (userProfile.has_access === undefined && userProfile.plan === 'gratuito' &&
        window.location.pathname !== '/subscription') {
      console.log("User has free plan and no has_access field, redirecting to subscription page");
      return <Navigate to="/subscription" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
