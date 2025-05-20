
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

// Redirect to home if authenticated, otherwise show login
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (user) return <Navigate to="/quizzes" />;
  
  return <>{children}</>;
};

// Component to verify subscription status when the app loads
const SubscriptionVerifier = () => {
  const { user, updateUserProfile, userProfile } = useAuth();
  const { verifySubscriptionStatus } = useStripeSubscription();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkSubscription = async () => {
      // Only check subscription if user is logged in
      if (user) {
        console.log("Checking subscription status on app load");
        
        try {
          // Skip verification if we're already on the subscription page
          if (window.location.pathname === '/subscription') {
            console.log("Already on subscription page, skipping verification");
            return;
          }
          
          // Skip verification for users who are known to not have access
          // This prevents unnecessary API calls and potential rate limiting
          if (userProfile && typeof userProfile.has_access === 'boolean' && userProfile.has_access === false) {
            console.log("User already known to not have access, redirecting to subscription page");
            navigate("/subscription");
            return;
          }
          
          // Only check subscription status if the user profile indicates they should have access
          // or if we don't know their status yet
          if (!userProfile || userProfile.has_access === true) {
            console.log("Checking subscription status for user with potential access");
            
            // Check subscription status with the server
            const result = await verifySubscriptionStatus();
            
            // Update the user profile to reflect any changes
            if (result.success) {
              await updateUserProfile();
              console.log("Subscription check completed:", result);
              
              // If user doesn't have access and not already on subscription page, redirect
              if (!result.has_access) {
                console.log("User doesn't have subscription access, redirecting to subscription page");
                navigate("/subscription");
              }
            }
          }
        } catch (error) {
          console.error("Error checking subscription on app load:", error);
        }
      }
    };
    
    checkSubscription();
  }, [user?.id, userProfile]);
  
  return null; // This component doesn't render anything
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
