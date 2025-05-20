
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast"; 
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

// Redirect to home if authenticated, otherwise show login
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (user) return <Navigate to="/quizzes" />;
  
  return <>{children}</>;
};

// Component to verify subscription status when the app loads
const SubscriptionVerifier = () => {
  const { user, updateUserProfile, userProfile, signOut } = useAuth();
  const { verifySubscriptionStatus } = useStripeSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  
  useEffect(() => {
    // Maximum allowed verification attempts
    const MAX_VERIFICATION_ATTEMPTS = 3;
    // Cooldown period after errors (in milliseconds)
    const ERROR_COOLDOWN_PERIOD = 60000; // 1 minute
    
    const checkSubscription = async () => {
      // Only check subscription if user is logged in
      if (!user) {
        return;
      }
      
      // Don't start new verification if already verifying
      if (isVerifying) {
        return;
      }
      
      console.log("Checking subscription status on app load");
      setIsVerifying(true);
      
      try {
        // Skip verification if we're already on the subscription page
        if (window.location.pathname === '/subscription') {
          console.log("Already on subscription page, skipping verification");
          setIsVerifying(false);
          return;
        }
        
        // Skip verification for users who are known to not have access
        // This prevents unnecessary API calls and potential rate limiting
        if (userProfile && typeof userProfile.has_access === 'boolean' && userProfile.has_access === false) {
          console.log("User already known to not have access, redirecting to subscription page");
          navigate("/subscription");
          setIsVerifying(false);
          return;
        }
        
        // Check for recent errors to avoid loops
        const lastVerificationError = sessionStorage.getItem("verification_error_timestamp");
        if (lastVerificationError) {
          const errorTime = parseInt(lastVerificationError, 10);
          const currentTime = Date.now();
          // Skip verification if error was less than cooldown period ago
          if ((currentTime - errorTime) < ERROR_COOLDOWN_PERIOD) {
            console.log("Skipping verification due to recent error");
            setIsVerifying(false);
            return;
          } else {
            // Clear error record if enough time has passed
            sessionStorage.removeItem("verification_error_timestamp");
          }
        }
        
        // Check for verification attempt count to prevent infinite loops
        const verificationAttempts = parseInt(sessionStorage.getItem("verification_attempts") || "0", 10);
        if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
          console.log(`Maximum verification attempts (${MAX_VERIFICATION_ATTEMPTS}) reached`);
          
          // Show a message to the user
          toast({
            title: "Verificação de assinatura desativada",
            description: "Muitas tentativas de verificação. Tente fazer logout e login novamente.",
            variant: "destructive",
          });
          
          setIsVerifying(false);
          return;
        }
        
        // Increment verification attempts
        sessionStorage.setItem("verification_attempts", (verificationAttempts + 1).toString());
        
        // Only check subscription status if the user profile indicates they should have access
        // or if we don't know their status yet
        if (!userProfile || userProfile.has_access === true) {
          console.log("Checking subscription status for user with potential access");
          
          // Add timeout to prevent hanging forever
          const subscriptionPromise = verifySubscriptionStatus();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Subscription verification timed out")), 10000);
          });
          
          // Race between subscription check and timeout
          const result = await Promise.race([subscriptionPromise, timeoutPromise]) as any;
          
          // Update the user profile to reflect any changes
          if (result.success) {
            await updateUserProfile();
            console.log("Subscription check completed:", result);
            
            // If user doesn't have access and not already on subscription page, redirect
            if (!result.has_access) {
              console.log("User doesn't have subscription access, redirecting to subscription page");
              navigate("/subscription");
            }
            
            // Reset verification attempts on success
            sessionStorage.removeItem("verification_attempts");
          }
        }
      } catch (error) {
        console.error("Error checking subscription on app load:", error);
        
        // Record timestamp of error to avoid loop
        sessionStorage.setItem("verification_error_timestamp", Date.now().toString());
        
        // Show error to user
        toast({
          title: "Erro ao verificar assinatura",
          description: "Não foi possível verificar seu status de assinatura. Você ainda pode usar o app.",
          variant: "destructive",
        });
        
        // If we hit a critical error multiple times in a row, suggest logout
        const verificationAttempts = parseInt(sessionStorage.getItem("verification_attempts") || "0", 10);
        if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS - 1) {
          toast({
            title: "Múltiplos erros detectados",
            description: "Recomendamos fazer logout e login novamente para resolver o problema.",
            variant: "destructive",
            duration: 10000,
          });
        }
      } finally {
        setIsVerifying(false);
      }
    };
    
    // Execute subscription check
    checkSubscription();
    
    // Clear verification attempts on component unmount
    return () => {
      // Only clear if the user is logging out to avoid clearing during normal navigation
      if (!user) {
        sessionStorage.removeItem("verification_attempts");
      }
    };
  }, [user?.id, userProfile, navigate, verifySubscriptionStatus, updateUserProfile, toast, isVerifying, signOut]);
  
  return null; // Component doesn't render anything
};

function AppContent() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <SubscriptionVerifier />
      <main className="pt-16 sm:pt-20">
        <Routes>
          {/* Public routes */}
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
          
          {/* Subscription route - accessible even without subscription */}
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/success" element={<Subscription />} />
          <Route path="/cancel" element={<Subscription />} />

          {/* Protected routes */}
          <Route 
            path="/quizzes" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/quiz/:id" 
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          
          {/* Add new route for quiz creation */}
          <Route 
            path="/quizzes/new" 
            element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          
          {/* User Profile route */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          
          {/* Explore page - available for all authenticated users */}
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />

          {/* 404 route */}
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
