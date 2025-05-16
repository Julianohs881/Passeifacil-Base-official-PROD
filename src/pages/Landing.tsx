
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Check } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-6">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="relative">
              <GraduationCap className="w-12 h-12 text-blue-900" />
              <Check className="w-6 h-6 text-emerald-500 absolute bottom-0 right-0" />
            </div>
            <span className="ml-3 text-2xl font-bold text-blue-900">Passei Fácil</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/quizzes">
                <button className="px-6 py-2 border border-blue-500 rounded-full text-blue-900 hover:bg-blue-50 transition-all shadow-sm">
                  Meus Quizzes
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-6 py-2 border border-blue-500 rounded-full text-blue-900 hover:bg-blue-50 transition-all shadow-sm">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-sm">
                    Criar conta
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="mt-16 md:mt-24 lg:mt-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
                Transforme texto e imagens em questões
              </h1>
              <p className="text-xl text-gray-700 mb-12">
                Faça upload de um texto ou imagem e converta-os em questões com apenas um clique.
              </p>
              <div>
                <Link to={user ? "/quizzes" : "/register"}>
                  <button className="btn-cta px-10 py-4">
                    Comece agora
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Right Column - Illustration */}
            <div className="relative">
              <div className="w-full">
                <svg className="w-full h-auto" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Document with questions illustration */}
                  <rect x="100" y="50" width="250" height="300" rx="8" fill="#E5EEF6" />
                  <rect x="120" y="80" width="210" height="10" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="100" width="190" height="10" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="120" width="210" height="10" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="150" width="30" height="30" rx="15" fill="#4299E1" />
                  <rect x="160" y="160" width="150" height="10" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="200" width="30" height="30" rx="15" fill="#4299E1" />
                  <rect x="160" y="210" width="170" height="10" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="250" width="30" height="30" rx="15" fill="#4299E1" />
                  <rect x="160" y="260" width="130" height="10" rx="2" fill="#A0AEC0" />
                  
                  {/* Image becoming quiz illustration */}
                  <rect x="370" y="100" width="150" height="120" rx="8" fill="#9AE6B4" />
                  <path d="M420 140 L450 170 L470 130" stroke="#2F855A" strokeWidth="4" />
                  <rect x="390" y="240" width="20" height="20" rx="2" fill="#4299E1" />
                  <rect x="420" y="240" width="80" height="10" rx="2" fill="#A0AEC0" />
                  <rect x="390" y="270" width="20" height="20" rx="2" fill="#4299E1" />
                  <rect x="420" y="270" width="70" height="10" rx="2" fill="#A0AEC0" />
                  <rect x="390" y="300" width="20" height="20" rx="2" fill="#4299E1" />
                  <rect x="420" y="300" width="90" height="10" rx="2" fill="#A0AEC0" />
                  
                  {/* Students */}
                  <circle cx="270" cy="350" r="30" fill="#FBD38D" />
                  <rect x="250" y="390" width="40" height="60" rx="4" fill="#2C5282" />
                  <circle cx="500" cy="320" r="30" fill="#FBD38D" />
                  <rect x="480" y="360" width="40" height="60" rx="4" fill="#2C5282" />
                </svg>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
