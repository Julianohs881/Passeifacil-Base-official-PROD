
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Check } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <GraduationCap className="w-10 h-10 text-blue-900" />
            <Check className="w-5 h-5 text-emerald-500 absolute bottom-0 right-0" />
          </div>
          <span className="ml-2 text-2xl font-bold text-blue-900">Passei Fácil</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link to="/quizzes">
              <button className="px-6 py-2 border border-blue-100 rounded-md text-blue-900 hover:bg-blue-50 transition-all shadow-sm">
                Meus Quizzes
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="px-6 py-2 border border-blue-100 rounded-md text-blue-900 hover:bg-blue-50 transition-all shadow-sm">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all shadow-sm">
                  Criar conta
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left Column - Text */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-6">
              Transforme texto e imagens em questões
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Faça upload de um texto ou imagem e converta-os em questões com apenas um clique.
            </p>
            <div className="flex justify-start">
              <Link to={user ? "/quizzes" : "/register"}>
                <button className="px-8 py-4 bg-[#22c55e] text-white rounded-lg hover:bg-emerald-600 transition-all shadow-md text-xl font-medium">
                  Comece agora
                </button>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Illustration */}
          <div className="w-full md:w-1/2">
            <img 
              src="/lovable-uploads/53bcbba0-62ef-428c-8dd5-8067d1c55eb4.png" 
              alt="Estudantes transformando textos e imagens em questões" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
