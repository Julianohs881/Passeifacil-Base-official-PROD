import { Link } from "react-router-dom";
import { ArrowUp, Check, Book, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const {
    user
  } = useAuth();

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 w-full bg-white z-50 transition-all duration-300 ${isScrolled ? "shadow-md py-2" : "py-4"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-violet-600">PasseiFácil</span>
            </Link>
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link to="/" className="text-gray-700 hover:text-violet-600 font-medium">
                Início
              </Link>
              <Link to="/quizzes" className="text-gray-700 hover:text-violet-600 font-medium">
                Meus Quizzes
              </Link>
              <Link to="/community" className="text-gray-700 hover:text-violet-600 font-medium">
                Comunidade
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-violet-600 font-medium">
                Contato
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? <Link to="/quizzes">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white transition-all hover:scale-105">
                  Meus Quizzes
                </Button>
              </Link> : <>
                <Link to="/login">
                  <Button variant="ghost" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 transition-all hover:scale-105">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white transition-all hover:scale-105">
                    Criar Conta
                  </Button>
                </Link>
              </>}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-violet-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
                  E aí, como foi a prova?
                </h1>
                <h2 className="text-3xl md:text-4xl font-extrabold text-violet-600 mb-6">
                  Passei Fácil
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-lg">
                  Crie quizzes personalizados, pratique e compartilhe conhecimento de forma divertida e eficiente.
                </p>
                <Link to={user ? "/quizzes" : "/register"}>
                  <Button size="lg" className="bg-blue-600 hover:bg-green-600 text-white px-8 py-6 text-lg font-medium transition-all hover:scale-105">
                    {user ? "Crie seu quiz" : "Crie seu primeiro Quiz"}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <img src="/placeholder.svg" alt="Estudantes usando o Passei Fácil" className="rounded-lg shadow-2xl" />
                  <div className="absolute -right-10 top-10 bg-white rounded-full p-4 shadow-lg animate-float">
                    <Check size={30} className="text-green-500" />
                  </div>
                  <div className="absolute -left-10 top-20 bg-white rounded-full p-4 shadow-lg animate-float animation-delay-2000">
                    <Book size={30} className="text-blue-500" />
                  </div>
                  <div className="absolute -bottom-10 left-20 bg-white rounded-full p-4 shadow-lg animate-float animation-delay-4000">
                    <PenLine size={30} className="text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Seus Quizzes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Crie quizzes personalizados para os temas que você está estudando. 
              Acompanhe seu progresso e aprenda de forma divertida.
            </p>
          </div>
          <div className="flex justify-center mb-10">
            <Link to={user ? "/quizzes" : "/login"}>
              <Button size="lg" className="bg-violet-500 hover:bg-violet-600 text-white px-8 py-6 text-lg font-medium transition-all hover:scale-105 flex items-center gap-2">
                <span className="text-2xl font-bold">+</span>
                <span>{user ? "Criar novo Quiz" : "Fazer login para começar"}</span>
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Sample Quizzes */}
            <SampleQuizCard title="Matemática Básica" color="bg-blue-500" />
            <SampleQuizCard title="História do Brasil" color="bg-green-500" />
            <SampleQuizCard title="Geografia Geral" color="bg-yellow-500" />
            <SampleQuizCard title="Física" color="bg-red-500" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Por que usar o Passei Fácil?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma foi desenvolvida pensando nas necessidades dos estudantes modernos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
            <BenefitCard icon="📊" title="Estatísticas de Desempenho" description="Acompanhe seu progresso com gráficos detalhados e análises de desempenho." />
            <BenefitCard icon="🎯" title="Progresso Personalizado" description="Desenvolvemos um algoritmo que se adapta ao seu ritmo de aprendizagem." />
            <BenefitCard icon="🤓" title="Aprenda de Forma Divertida" description="Transforme o estudo em uma experiência agradável e motivadora." />
            <BenefitCard icon="🥇" title="Desafie seus Amigos" description="Crie competições com seus amigos e veja quem obtém a melhor pontuação." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-violet-400 mb-4">PasseiFácil</h3>
              <p className="text-gray-400 max-w-xs">
                A plataforma de quizzes para estudantes que querem aprender de forma eficiente e divertida.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Início</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Meus Quizzes</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Comunidade</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Suporte</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ajuda</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Feedback</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} PasseiFácil. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">TikTok</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 01 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-violet-600 text-white rounded-full p-3 shadow-lg hover:bg-violet-700 transition-all z-50" aria-label="Voltar ao topo">
          <ArrowUp size={24} />
        </button>}
    </div>;
};

// Helper components
const SampleQuizCard = ({
  title,
  color
}: {
  title: string;
  color: string;
}) => {
  return <div className={`quiz-card ${color} group relative`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="card-actions">
        <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>
        <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>;
};
const BenefitCard = ({
  icon,
  title,
  description
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  return <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>;
};
export default Landing;