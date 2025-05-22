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
  const { user, updateUserProfile, userProfile } = useAuth();
  const { verifySubscriptionStatus } = useStripeSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          if (window.location.pathname === '/subscription') return;

          if (userProfile && typeof userProfile.has_access === 'boolean' && userProfile.has_access === false) {
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

          if (!userProfile || userProfile.has_access === true) {
            const result = await verifySubscriptionStatus();
            if (result.success) {
              await updateUserProfile();
              if (!result.has_access) {
                navigate("/subscription");
              }
            }
          }
        } catch (error) {
          sessionStorage.setItem("verification_error_timestamp", Date.now().toString());
        }
      }
    };
    checkSubscription();
  }, [user?.id, userProfile, navigate, updateUserProfile, verifySubscriptionStatus]);

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

          {/* Rotas protegidas */}
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
          <Route 
            path="/quizzes/new" 
            element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
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
