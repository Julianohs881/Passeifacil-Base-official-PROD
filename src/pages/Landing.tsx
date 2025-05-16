
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="relative">
              <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10L80 25V75L50 90L20 75V25L50 10Z" fill="#0F172A" />
                <path d="M40 35L50 30L60 35V65L50 70L40 65V35Z" fill="#0F172A" stroke="white" strokeWidth="2" />
                <path d="M50 30V20M50 20L35 15V20M50 20L65 15V20" stroke="white" strokeWidth="2" />
                <path d="M65 80C65 80 55 85 50 85C45 85 35 80 35 80" stroke="white" strokeWidth="2" />
                <path d="M70 70L80 80" stroke="#0F172A" strokeWidth="3" />
                <path d="M80 65L90 50L75 35L60 50L70 60L80 65Z" fill="#22C55E" />
              </svg>
            </div>
            <span className="ml-3 text-2xl font-bold text-[#0F172A]">Passei Fácil</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/quizzes">
                <button className="px-6 py-2 border border-[#0F172A] rounded-full text-[#0F172A] hover:bg-gray-50 transition-all shadow-sm">
                  Meus Quizzes
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-6 py-2 border border-[#0F172A] rounded-full text-[#0F172A] hover:bg-gray-50 transition-all shadow-sm">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-6 py-3 bg-[#0096FF] text-white rounded-full hover:bg-blue-600 transition-all shadow-sm">
                    Criar conta
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text */}
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold text-[#0F172A] mb-6 leading-tight">
              Transforme texto e imagens em questões
            </h1>
            <p className="text-xl text-gray-700 mb-12">
              Faça upload de um texto ou imagem e converta-os em questões com apenas um clique.
            </p>
            <div>
              <Link to={user ? "/quizzes" : "/register"}>
                <button className="bg-[#22c55e] text-white px-10 py-4 rounded-full hover:bg-emerald-600 transition-all shadow-md text-xl font-medium">
                  Comece agora
                </button>
              </Link>
            </div>
          </div>
          
          {/* Right Column - Illustration */}
          <div className="relative">
            <svg className="w-full h-auto" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Document background */}
              <rect x="180" y="200" width="300" height="400" rx="8" fill="#E2E8F0" />
              <rect x="200" y="230" width="260" height="20" rx="2" fill="#CBD5E1" />
              <rect x="200" y="260" width="260" height="20" rx="2" fill="#CBD5E1" />
              <rect x="200" y="290" width="260" height="20" rx="2" fill="#CBD5E1" />
              <rect x="200" y="320" width="260" height="20" rx="2" fill="#CBD5E1" />
              <rect x="200" y="350" width="180" height="20" rx="2" fill="#CBD5E1" />
              
              {/* Woman sitting on top with laptop */}
              <rect x="250" y="75" width="100" height="70" rx="5" fill="#0F172A" />
              <rect x="255" y="80" width="90" height="60" rx="3" fill="#94A3B8" />
              
              <circle cx="300" cy="50" r="25" fill="#FCD34D" />
              <path d="M290 70 L310 70 L310 110 L290 110 Z" fill="#0F172A" />
              <circle cx="300" cy="45" r="15" fill="#FFEDD5" />
              <path d="M295 43 C 295,43 300,45 305,43" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="297" cy="40" r="1.5" fill="#0F172A" />
              <circle cx="303" cy="40" r="1.5" fill="#0F172A" />
              <path d="M292 38 C 293,33 307,33 308,38" stroke="#0F172A" strokeWidth="1" fill="transparent" />
                            
              {/* Man pointing left */}
              <circle cx="150" cy="400" r="30" fill="#4ADE80" />
              <path d="M130 430 L170 430 L170 520 L130 520 Z" fill="#0F172A" />
              <circle cx="150" cy="395" r="20" fill="#FFEDD5" />
              <path d="M140 395 C 140,395 150,400 160,395" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="145" cy="390" r="2" fill="#0F172A" />
              <circle cx="155" cy="390" r="2" fill="#0F172A" />
              <path d="M170 400 L200 380" stroke="#0F172A" strokeWidth="2" />
              
              {/* Woman with laptop at bottom */}
              <rect x="250" y="620" width="100" height="70" rx="5" fill="#0F172A" />
              <rect x="255" y="625" width="90" height="60" rx="3" fill="#94A3B8" />
              
              <circle cx="300" cy="600" r="25" fill="#FCD34D" />
              <path d="M290 625 L310 625 L310 665 L290 665 Z" fill="#0F172A" />
              <circle cx="300" cy="595" r="15" fill="#FFEDD5" />
              <path d="M295 593 C 295,593 300,595 305,593" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="297" cy="590" r="1.5" fill="#0F172A" />
              <circle cx="303" cy="590" r="1.5" fill="#0F172A" />
              
              {/* Image box with quiz */}
              <rect x="450" y="250" width="200" height="200" rx="8" fill="#E2E8F0" />
              <rect x="470" y="270" width="160" height="120" rx="4" fill="#FFFFFF" />
              <path d="M470 400 L630 400" stroke="#CBD5E1" strokeWidth="1" />
              
              {/* Image in box */}
              <rect x="480" y="290" width="70" height="40" rx="4" fill="#4ADE80" />
              <path d="M490 310 L500 320 L520 300" stroke="#0F172A" strokeWidth="2" />
              
              {/* Quiz options */}
              <rect x="480" y="420" width="15" height="15" rx="2" fill="#E2E8F0" />
              <text x="505" y="432" fill="#0F172A" fontSize="14">A</text>
              <path d="M510 432 L550 432" stroke="#94A3B8" strokeWidth="2" />
              
              <rect x="480" y="450" width="15" height="15" rx="2" fill="#E2E8F0" />
              <text x="505" y="462" fill="#0F172A" fontSize="14">B</text>
              <path d="M510 462 L550 462" stroke="#94A3B8" strokeWidth="2" />
              
              <rect x="480" y="480" width="15" height="15" rx="2" fill="#E2E8F0" />
              <text x="505" y="492" fill="#0F172A" fontSize="14">C</text>
              <path d="M510 492 L550 492" stroke="#94A3B8" strokeWidth="2" />
              
              {/* Person with green shirt */}
              <circle cx="100" cy="500" r="30" fill="#4ADE80" />
              <path d="M80 530 L120 530 L120 620 L80 620 Z" fill="#0F172A" />
              <circle cx="100" cy="495" r="20" fill="#FFEDD5" />
              <path d="M90 495 C 90,495 100,500 110,495" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="95" cy="490" r="2" fill="#0F172A" />
              <circle cx="105" cy="490" r="2" fill="#0F172A" />
              
              {/* Woman with tablet right side */}
              <rect x="520" y="450" width="60" height="80" rx="5" fill="#0F172A" />
              <rect x="525" y="455" width="50" height="70" rx="3" fill="#94A3B8" />
              
              <circle cx="550" cy="430" r="25" fill="#4ADE80" />
              <path d="M540 455 L560 455 L560 495 L540 495 Z" fill="#0F172A" />
              <circle cx="550" cy="425" r="15" fill="#FFEDD5" />
              <path d="M545 423 C 545,423 550,425 555,423" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="547" cy="420" r="1.5" fill="#0F172A" />
              <circle cx="553" cy="420" r="1.5" fill="#0F172A" />
              
              {/* Man pointing at quiz */}
              <circle cx="400" cy="600" r="30" fill="#FCD34D" />
              <path d="M380 630 L420 630 L420 720 L380 720 Z" fill="#0F172A" />
              <circle cx="400" cy="595" r="20" fill="#FFEDD5" />
              <path d="M390 595 C 390,595 400,600 410,595" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="395" cy="590" r="2" fill="#0F172A" />
              <circle cx="405" cy="590" r="2" fill="#0F172A" />
              <path d="M380 600 L350 550" stroke="#0F172A" strokeWidth="2" />
              
              {/* Girl with book */}
              <circle cx="450" cy="530" r="20" fill="#FCD34D" />
              <path d="M440 550 L460 550 L460 590 L440 590 Z" fill="#0F172A" />
              <circle cx="450" cy="525" r="15" fill="#FFEDD5" />
              <path d="M445 523 C 445,523 450,525 455,523" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="447" cy="520" r="1.5" fill="#0F172A" />
              <circle cx="453" cy="520" r="1.5" fill="#0F172A" />
              <rect x="430" y="540" width="25" height="20" rx="2" fill="#FCA5A5" />
            </svg>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
