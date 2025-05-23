
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
import { useEffect } from "react";
import { useStripeSubscription } from "./hooks/useStripeSubscription";

// Redireciona para quizzes se já estiver logado
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/quizzes" />;
  return <>{children}</>;
};

// Verifica assinatura ao carregar o app
const SubscriptionVerifier = () => {
  const { user, updateUserProfile, userProfile, isPro } = useAuth();
  const { verifySubscriptionStatus } = useStripeSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          if (window.location.pathname === '/subscription') return;

          // If user profile is loaded and we can determine they don't have premium access,
          // redirect to subscription page immediately
          if (userProfile && !isPro()) {
            console.log("User does not have premium access, redirecting to subscription");
            navigate("/subscription");
            return;
          }

          const lastVerificationError = sessionStorage.getItem("verification_error_timestamp");
          if (lastVerificationError) {
            const errorTime = parseInt(lastVerificationError, 10);
            const currentTime = Date.now();
            if ((currentTime - errorTime) < 60000) {
              return;
            } else {
              sessionStorage.removeItem("verification_error_timestamp");
            }
          }

          // Always verify subscription status when app loads to ensure database is in sync
          const result = await verifySubscriptionStatus();
          if (result.success) {
            await updateUserProfile();
            // After refreshing the profile, check premium access again
            if (!isPro()) {
              console.log("After verification, user still doesn't have premium access");
              navigate("/subscription");
            }
          }
        } catch (error) {
          sessionStorage.setItem("verification_error_timestamp", Date.now().toString());
        }
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
