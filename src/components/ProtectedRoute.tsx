
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, userProfile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
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
  
  // Primeiro checar has_access, depois checar o plano para compatibilidade retroativa
  if (userProfile) {
    // Se has_access é false, redirecionar para a página de assinatura
    if (typeof userProfile.has_access === 'boolean' && userProfile.has_access === false) {
      console.log("User does not have subscription access, redirecting to subscription page");
      return <Navigate to="/subscription" replace />;
    }
    
    // Para compatibilidade retroativa - se não tiver has_access definido, verificar o plano
    if (userProfile.has_access === undefined && userProfile.plan === 'gratuito') {
      console.log("User has free plan and no has_access field, redirecting to subscription page");
      return <Navigate to="/subscription" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
