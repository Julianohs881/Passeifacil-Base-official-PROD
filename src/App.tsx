
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import CreateQuiz from "./pages/CreateQuiz"; // Add import for the new component

// Redirect to home if authenticated, otherwise show login
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (user) return <Navigate to="/quizzes" />;
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <NavBar />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
