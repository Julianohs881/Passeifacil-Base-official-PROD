
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-900 transform rotate-45 absolute top-0"></div>
            <div className="w-12 h-12 flex items-center justify-center relative">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4l-8 4v12l8-4 8 4v-12l-8-4z" fill="#0f172a"/>
                <path d="M12 4v12" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8l8 4 8-4" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="ml-2 flex items-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-500 ml-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17l-4.17-4.17 1.42-1.41 2.75 2.75 5.59-5.59 1.41 1.41-7 7z" />
            </svg>
            <span className="text-2xl font-bold text-blue-900 ml-1">Passei Fácil</span>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link to="/quizzes">
              <button className="btn-primary">
                Meus Quizzes
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button className="btn-secondary border border-blue-100 rounded-md">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-primary">
                  Criar conta
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left Column - Text */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-6">
              Transforme texto e imagens em questões
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Faça upload de um texto ou imagem e converta-os em questões com apenas um clique.
            </p>
            <Link to={user ? "/quizzes" : "/register"}>
              <button className="btn-cta">
                Comece agora
              </button>
            </Link>
          </div>
          
          {/* Right Column - Illustration */}
          <div className="w-full md:w-1/2 pl-0 md:pl-10">
            <div className="relative">
              <img 
                src="/lovable-uploads/d6da08d8-6a5c-447e-bcff-1196f1d7a626.png" 
                alt="Estudantes transformando textos e imagens em questões" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
