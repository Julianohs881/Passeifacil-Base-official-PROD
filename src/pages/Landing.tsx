
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Music, Users, MessageCircle, Check, Star, Hashtag } from "lucide-react";

const Landing = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 py-4">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10L80 25V75L50 90L20 75V25L50 10Z" fill="#2D3F60" />
                <path d="M40 35L50 30L60 35V65L50 70L40 65V35Z" fill="#2D3F60" stroke="white" strokeWidth="2" />
                <path d="M50 30V20M50 20L35 15V20M50 20L65 15V20" stroke="white" strokeWidth="2" />
                <path d="M65 80C65 80 55 85 50 85C45 85 35 80 35 80" stroke="white" strokeWidth="2" />
                <path d="M70 70L80 80" stroke="#2D3F60" strokeWidth="3" />
                <path d="M80 65L90 50L75 35L60 50L70 60L80 65Z" fill="#22C55E" />
              </svg>
            </div>
            <span className="ml-2 text-2xl font-bold text-[#2D3F60]">Passei Fácil</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-10 ml-12 mr-auto">
            <div className="group relative">
              <Link to="#primeiros-passos" className="text-gray-600 hover:text-[#2D3F60] text-sm flex flex-col items-center">
                <span className="font-medium">Primeiros Passos</span>
                <span className="text-xs text-gray-500">Comece por aqui</span>
              </Link>
            </div>
            <div className="group relative">
              <Link to="#grupos" className="text-gray-600 hover:text-[#2D3F60] text-sm flex flex-col items-center">
                <span className="font-medium">Grupos</span>
                <span className="text-xs text-gray-500">O que estão compartilhando?</span>
              </Link>
            </div>
            <div className="group relative">
              <Link to="#ajuda" className="text-gray-600 hover:text-[#2D3F60] text-sm flex flex-col items-center">
                <span className="font-medium">Ajuda</span>
                <span className="text-xs text-gray-500">Em que posso te ajudar?</span>
              </Link>
            </div>
          </nav>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <Link to="/quizzes">
                <button className="px-6 py-2 text-[#0096FF] font-medium hover:underline transition-all">
                  Meus Quizzes
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-6 py-2 text-[#0096FF] font-medium hover:underline transition-all">
                    Entrar
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-6 py-3 bg-[#0096FF] text-white rounded-full hover:bg-blue-500 transition-all font-medium">
                    Cadastre-se
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2D3F60] mb-4 leading-tight">
              Divida assinaturas e <br/>economize até 80% em
              <span className="text-[#0096FF] block mt-1">Exercícios</span>
            </h1>
            <p className="text-lg text-gray-700 mb-10 mt-6">
              Com o Passei Fácil você pode compartilhar mais de 500 questões
              e exercícios de forma fácil, rápida e segura.
            </p>
            <div>
              <Link to={user ? "/quizzes" : "/register"}>
                <button className="bg-[#0096FF] text-white px-8 py-4 rounded-full hover:bg-blue-500 transition-all text-lg font-medium">
                  Cadastrar gratuitamente
                </button>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Illustration */}
          <div className="relative">
            <div className="landing-illustration relative w-full h-full">
              {/* Colorful icons floating */}
              <div className="absolute top-0 right-0 animate-float-slow">
                <Star className="text-yellow-400" size={24} />
              </div>
              <div className="absolute top-10 right-32 animate-float">
                <Hashtag className="text-pink-500" size={20} />
              </div>
              <div className="absolute top-20 left-20 animate-float-slow">
                <Music className="text-green-500" size={22} />
              </div>
              <div className="absolute bottom-32 right-10 animate-float">
                <Check className="text-blue-400" size={20} />
              </div>
              <div className="absolute top-16 right-60 animate-float-medium">
                <MessageCircle className="text-orange-400" size={20} />
              </div>
              <div className="absolute bottom-40 left-20 animate-float-medium">
                <Star className="text-purple-400" size={16} />
              </div>
              
              {/* Speech bubbles */}
              <div className="absolute left-10 top-36">
                <div className="bg-yellow-100 rounded-full w-10 h-10"></div>
              </div>
              <div className="absolute left-20 top-16">
                <div className="bg-blue-100 rounded-full w-12 h-12"></div>
              </div>
              
              {/* People illustration */}
              <svg width="100%" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-4">
                {/* Person 1 - Yellow shirt */}
                <g transform="translate(240, 180)">
                  <rect x="0" y="-50" width="50" height="100" rx="10" fill="#FCD34D" />
                  <circle cx="25" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M15 -70 C 15,-70 25,-65 35,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="18" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="32" cy="-75" r="2" fill="#2D3F60" />
                  <path d="M15 -80 L 35 -80" stroke="#2D3F60" strokeWidth="1" opacity="0.5" />
                  <rect x="10" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="10" y="29" width="12" height="40" rx="5" fill="#2D3F60" />
                  <rect x="28" y="29" width="12" height="40" rx="5" fill="#2D3F60" />
                </g>

                {/* Person 2 - Green shirt */}
                <g transform="translate(200, 190)">
                  <rect x="0" y="-50" width="40" height="90" rx="10" fill="#4ADE80" />
                  <circle cx="20" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M10 -70 C 10,-70 20,-65 30,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="13" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="27" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="5" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="5" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  <rect x="23" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                </g>

                {/* Person 3 - Orange shirt */}
                <g transform="translate(290, 200)">
                  <rect x="0" y="-50" width="40" height="90" rx="10" fill="#FB923C" />
                  <circle cx="20" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M10 -70 C 10,-70 20,-65 30,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="13" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="27" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="5" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="5" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  <rect x="23" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  <path d="M40 -20 L 60 -40" stroke="#2D3F60" strokeWidth="2" />
                  <rect x="60" y="-60" width="20" height="20" rx="4" fill="#94A3B8" />
                </g>

                {/* Person 4 - Red shirt */}
                <g transform="translate(330, 180)">
                  <rect x="0" y="-50" width="45" height="100" rx="10" fill="#FB7185" />
                  <circle cx="22" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M12 -70 C 12,-70 22,-65 32,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="15" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="29" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="7" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="7" y="29" width="12" height="40" rx="5" fill="#2D3F60" />
                  <rect x="25" y="29" width="12" height="40" rx="5" fill="#2D3F60" />
                </g>

                {/* Person 5 - Light blue shirt */}
                <g transform="translate(370, 195)">
                  <rect x="0" y="-50" width="40" height="90" rx="10" fill="#7DD3FC" />
                  <circle cx="20" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M10 -70 C 10,-70 20,-65 30,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="13" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="27" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="5" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="5" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  <rect x="23" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                </g>

                {/* Person 6 - Purple shirt */}
                <g transform="translate(410, 180)">
                  <rect x="0" y="-50" width="45" height="100" rx="10" fill="#C084FC" />
                  <circle cx="22" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M12 -70 C 12,-70 22,-65 32,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="15" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="29" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="7" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="7" y="29" width="12" height="40" rx="5" fill="#2D3F60" />
                  <rect x="25" y="29" width="12" height="40" rx="5" fill="#2D3F60" />
                </g>

                {/* Person 7 - Mint shirt */}
                <g transform="translate(450, 190)">
                  <rect x="0" y="-50" width="40" height="90" rx="10" fill="#5EEAD4" />
                  <circle cx="20" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M10 -70 C 10,-70 20,-65 30,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="13" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="27" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="5" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="5" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  <rect x="23" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                </g>

                {/* Person 8 - Pink shirt */}
                <g transform="translate(160, 200)">
                  <rect x="0" y="-50" width="40" height="90" rx="10" fill="#FDA4AF" />
                  <circle cx="20" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M10 -70 C 10,-70 20,-65 30,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="13" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="27" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="5" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="5" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  <rect x="23" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                </g>

                {/* Person in wheelchair */}
                <g transform="translate(120, 220)">
                  <circle cx="24" cy="-54" r="20" fill="#FFEDD5" />
                  <path d="M14 -54 C 14,-54 24,-49 34,-54" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="17" cy="-59" r="2" fill="#2D3F60" />
                  <circle cx="31" cy="-59" r="2" fill="#2D3F60" />
                  
                  <rect x="9" y="-34" width="30" height="40" rx="5" fill="#4ADE80" />
                  
                  {/* Wheelchair */}
                  <circle cx="10" cy="25" r="15" stroke="#2D3F60" strokeWidth="2" fill="#E2E8F0" />
                  <circle cx="40" cy="25" r="15" stroke="#2D3F60" strokeWidth="2" fill="#E2E8F0" />
                  <rect x="10" y="5" width="30" height="5" rx="2" fill="#64748B" />
                  <path d="M15 5 C 15,5 25,-20 35,-20" stroke="#64748B" strokeWidth="2" fill="none" />
                  <path d="M35 -20 C 35,-20 40,-15 40,-10" stroke="#64748B" strokeWidth="2" fill="none" />
                  <path d="M25 5 L 25 25" stroke="#64748B" strokeWidth="2" />
                </g>

                {/* Kid with parent */}
                <g transform="translate(490, 220)">
                  {/* Parent */}
                  <rect x="0" y="-50" width="40" height="90" rx="10" fill="#FCD34D" />
                  <circle cx="20" cy="-70" r="20" fill="#FFEDD5" />
                  <path d="M10 -70 C 10,-70 20,-65 30,-70" stroke="#2D3F60" strokeWidth="1.5" />
                  <circle cx="13" cy="-75" r="2" fill="#2D3F60" />
                  <circle cx="27" cy="-75" r="2" fill="#2D3F60" />
                  <rect x="5" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                  <rect x="5" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  <rect x="23" y="29" width="12" height="30" rx="5" fill="#2D3F60" />
                  
                  {/* Kid */}
                  <g transform="translate(30, 10) scale(0.6)">
                    <rect x="0" y="-50" width="40" height="70" rx="10" fill="#FB923C" />
                    <circle cx="20" cy="-70" r="20" fill="#FFEDD5" />
                    <path d="M10 -70 C 10,-70 20,-65 30,-70" stroke="#2D3F60" strokeWidth="1.5" />
                    <circle cx="13" cy="-75" r="2" fill="#2D3F60" />
                    <circle cx="27" cy="-75" r="2" fill="#2D3F60" />
                    <rect x="5" y="-20" width="30" height="50" rx="5" fill="#2D3F60" />
                    <rect x="5" y="29" width="12" height="20" rx="5" fill="#2D3F60" />
                    <rect x="23" y="29" width="12" height="20" rx="5" fill="#2D3F60" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
