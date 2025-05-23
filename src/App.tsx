
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Landing from "./pages/Landing";
import Home from "@/pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Explore from "./pages/Explore";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import Subscription from "./pages/Subscription"; 
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import CreateQuiz from "./pages/CreateQuiz";
import { useEffect, useState } from "react";
import { useStripeSubscription } from "./hooks/useStripeSubscription";
import { useToast } from "@/hooks/use-toast";

// Redireciona para quizzes se já estiver logado
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/quizzes" />;
  return <>{children}</>;
};

// Componente melhorado para verificar assinatura ao carregar o app
const SubscriptionVerifier = () => {
  const { user, updateUserProfile, userProfile, isPro } = useAuth();
  const { verifySubscriptionStatus } = useStripeSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Add state to prevent multiple concurrent checks
  const [isVerifying, setIsVerifying] = useState(false);
  // Track if the current page is already subscription page to prevent loops
  const [isOnSubscriptionPage, setIsOnSubscriptionPage] = useState(false);

  useEffect(() => {
    // Update the isOnSubscriptionPage flag when pathname changes
    setIsOnSubscriptionPage(window.location.pathname === '/subscription');
  }, [window.location.pathname]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || isVerifying) return;

      try {
        // Don't verify if we're already on the subscription page - helps prevent loops
        if (window.location.pathname === '/subscription') {
          console.log("Already on subscription page, skipping verification to avoid loops");
          return;
        }

        setIsVerifying(true);
        
        // Check if we're coming back from a checkout session
        const isAfterCheckout = sessionStorage.getItem("new_subscriber") === "true";
        const isSubscriptionParam = window.location.search.includes('subscription=');
        
        // Only do verification if we need to
        if (isAfterCheckout || isSubscriptionParam || !isPro()) {
          console.log("Subscription verification needed:", { 
            isAfterCheckout, 
            isSubscriptionParam,
            hasPremiumAccess: isPro() 
          });
          
          // Last verification error throttling
          const lastVerificationError = sessionStorage.getItem("verification_error_timestamp");
          if (lastVerificationError) {
            const errorTime = parseInt(lastVerificationError, 10);
            const currentTime = Date.now();
            if ((currentTime - errorTime) < 60000) {
              setIsVerifying(false);
              return;
            } else {
              sessionStorage.removeItem("verification_error_timestamp");
            }
          }

          // Verify subscription status
          const result = await verifySubscriptionStatus();
          
          if (result.success) {
            // Force profile refresh to ensure we have latest data
            await updateUserProfile();
            
            // If we're coming back from checkout, clear the flag and show success toast
            if (isAfterCheckout) {
              sessionStorage.removeItem("new_subscriber");
              toast({
                title: "Assinatura ativada com sucesso!",
                description: "Seu acesso foi liberado.",
                duration: 3000,
              });
            }
            
            // Only redirect if not subscribed after verification and not already on subscription page
            if (!isPro() && window.location.pathname !== '/subscription') {
              console.log("User doesn't have premium access, redirecting to subscription");
              navigate("/subscription");
            } else if (isPro() && window.location.pathname === '/subscription') {
              // If user has access and is on subscription page, send them to quizzes
              console.log("User has premium access but is on subscription page, redirecting to quizzes");
              navigate("/quizzes");
            }
          }
        }
      } catch (error) {
        console.error("Error in subscription verification:", error);
        sessionStorage.setItem("verification_error_timestamp", Date.now().toString());
      } finally {
        setIsVerifying(false);
      }
    };
    
    checkSubscription();
  }, [user?.id, userProfile, navigate, updateUserProfile, verifySubscriptionStatus, isPro]);

  return null;
};

function AppContent() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <SubscriptionVerifier />
      <main className="pt-16 sm:pt-20">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Landing />} />
          <Route 
            path="/login" 
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route 
            path="/register" 
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            }
          />
          
          {/* Página de assinatura - aberta */}
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/success" element={<Subscription />} />
          <Route path="/cancel" element={<Subscription />} />

          {/* Rotas protegidas básicas */}
          <Route 
            path="/quizzes" 
            element={
              <ProtectedRoute requirePremium={false}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas que exigem acesso premium */}
          <Route 
            path="/quiz/:id" 
            element={
              <ProtectedRoute requirePremium={true}>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/quizzes/new" 
            element={
              <ProtectedRoute requirePremium={true}>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requirePremium={false}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute requirePremium={true}>
                <Explore />
              </ProtectedRoute>
            }
          />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
