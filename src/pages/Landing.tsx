
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-6">
        {/* Header */}
        <header className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="relative">
              <svg width="60" height="60" viewBox="0 0 290 290" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M145 30L260 90V210L145 270L30 210V90L145 30Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2"/>
                <path d="M123 120L145 107.5L167 120V190L145 202.5L123 190V120Z" fill="#0F172A" stroke="white" strokeWidth="3"/>
                <path d="M145 107.5V77.5M145 77.5L110 63V77.5M145 77.5L180 63V77.5" stroke="white" strokeWidth="3"/>
                <path d="M180 225C180 225 165 235 145 235C125 235 110 225 110 225" stroke="white" strokeWidth="3"/>
                <path d="M198 204.5L230 230" stroke="#0F172A" strokeWidth="8"/>
                <path d="M230 190L270 150L225 105L175 155L205 185L230 190Z" fill="#22C55E"/>
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
        <main className="mt-16 md:mt-24 lg:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 leading-tight">
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
            
            {/* Right Column - Illustration (matching the reference image) */}
            <div className="relative">
              <div className="w-full">
                <svg className="w-full h-auto" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Document/Form background */}
                  <rect x="100" y="70" width="280" height="360" rx="8" fill="#E5EEF6" />
                  <rect x="120" y="100" width="240" height="15" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="130" width="220" height="15" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="160" width="240" height="15" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="190" width="240" height="15" rx="2" fill="#A0AEC0" />
                  <rect x="120" y="220" width="180" height="15" rx="2" fill="#A0AEC0" />
                  
                  {/* Image becoming quiz illustration */}
                  <rect x="370" y="100" width="150" height="120" rx="8" fill="#E5EEF6" />
                  <rect x="390" y="120" width="110" height="80" rx="4" fill="#4ADE80" />
                  <path d="M420 140 L445 165 L470 125" stroke="#0F172A" strokeWidth="4" />
                  
                  {/* Quiz options */}
                  <rect x="400" y="240" width="20" height="20" rx="2" fill="#E5EEF6" />
                  <text x="430" y="255" fill="#0F172A" fontSize="14">Option A</text>
                  <rect x="400" y="270" width="20" height="20" rx="2" fill="#E5EEF6" />
                  <text x="430" y="285" fill="#0F172A" fontSize="14">Option B</text>
                  <rect x="400" y="300" width="20" height="20" rx="2" fill="#E5EEF6" />
                  <text x="430" y="315" fill="#0F172A" fontSize="14">Option C</text>
                  
                  {/* Person 1 - left side pointing */}
                  <ellipse cx="70" cy="300" rx="40" ry="40" fill="#4ADE80" />
                  <rect x="50" y="340" width="40" height="80" rx="10" fill="#0F172A" />
                  <rect x="45" y="420" width="50" height="10" rx="5" fill="#0F172A" />
                  <circle cx="70" cy="290" r="25" fill="#FBD38D" />
                  <path d="M60 285 C 60,285 70,290 80,285" stroke="#0F172A" strokeWidth="2" />
                  <circle cx="65" cy="280" r="2" fill="#0F172A" />
                  <circle cx="75" cy="280" r="2" fill="#0F172A" />
                  <line x1="90" y1="300" x2="120" y2="280" stroke="#0F172A" strokeWidth="4" />
                  
                  {/* Person 2 - girl sitting on document with laptop */}
                  <ellipse cx="240" cy="70" rx="30" ry="30" fill="#FFC107" />
                  <rect x="225" y="100" width="30" height="60" rx="8" fill="#0F172A" />
                  <circle cx="240" cy="65" r="18" fill="#FBD38D" />
                  <path d="M235 62 C 235,62 240,65 245,62" stroke="#0F172A" strokeWidth="1.5" />
                  <circle cx="237" cy="58" r="1.5" fill="#0F172A" />
                  <circle cx="243" cy="58" r="1.5" fill="#0F172A" />
                  <path d="M228 55 C 230,48 250,48 252,55" stroke="#0F172A" strokeWidth="1.5" fill="none" />
                  <rect x="210" y="90" width="60" height="35" rx="4" fill="#0F172A" />
                  <rect x="215" y="95" width="50" height="25" rx="2" fill="#E5EEF6" />
                  <circle cx="240" cy="130" r="3" fill="#E5EEF6" />
                  
                  {/* Person 3 - sitting at bottom with laptop */}
                  <ellipse cx="240" cy="420" rx="30" ry="30" fill="#FFC107" />
                  <rect x="225" y="450" width="30" height="60" rx="8" fill="#0F172A" />
                  <circle cx="240" cy="415" r="18" fill="#FBD38D" />
                  <path d="M235 412 C 235,412 240,415 245,412" stroke="#0F172A" strokeWidth="1.5" />
                  <circle cx="237" cy="408" r="1.5" fill="#0F172A" />
                  <circle cx="243" cy="408" r="1.5" fill="#0F172A" />
                  <rect x="210" y="430" width="60" height="35" rx="4" fill="#0F172A" />
                  <rect x="215" y="435" width="50" height="25" rx="2" fill="#E5EEF6" />
                  <circle cx="240" cy="470" r="3" fill="#E5EEF6" />
                  
                  {/* Person 4 - pointing at quiz */}
                  <ellipse cx="390" cy="360" rx="30" ry="30" fill="#FFC107" />
                  <rect x="375" y="390" width="30" height="60" rx="8" fill="#0F172A" />
                  <circle cx="390" cy="355" r="18" fill="#FBD38D" />
                  <path d="M385 352 C 385,352 390,355 395,352" stroke="#0F172A" strokeWidth="1.5" />
                  <circle cx="387" cy="348" r="1.5" fill="#0F172A" />
                  <circle cx="393" cy="348" r="1.5" fill="#0F172A" />
                  <line x1="370" y1="360" x2="340" y2="320" stroke="#0F172A" strokeWidth="3" />
                  
                  {/* Person 5 - with tablet */}
                  <ellipse cx="520" cy="280" rx="30" ry="30" fill="#4ADE80" />
                  <rect x="505" y="310" width="30" height="70" rx="8" fill="#0F172A" />
                  <circle cx="520" cy="275" r="18" fill="#FBD38D" />
                  <path d="M515 272 C 515,272 520,275 525,272" stroke="#0F172A" strokeWidth="1.5" />
                  <circle cx="517" cy="268" r="1.5" fill="#0F172A" />
                  <circle cx="523" cy="268" r="1.5" fill="#0F172A" />
                  <rect x="495" y="280" width="35" height="45" rx="4" fill="#0F172A" />
                  <rect x="500" y="285" width="25" height="35" rx="2" fill="#E5EEF6" />
                  
                  {/* Person 6 - kid with book */}
                  <ellipse cx="475" cy="380" rx="25" ry="25" fill="#FFC107" />
                  <rect x="465" y="405" width="20" height="45" rx="6" fill="#0F172A" />
                  <circle cx="475" cy="375" r="15" fill="#FBD38D" />
                  <path d="M470 373 C 470,373 475,375 480,373" stroke="#0F172A" strokeWidth="1" />
                  <circle cx="472" cy="370" r="1" fill="#0F172A" />
                  <circle cx="478" cy="370" r="1" fill="#0F172A" />
                  <rect x="450" y="385" width="30" height="25" rx="2" fill="#FF5722" />
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
