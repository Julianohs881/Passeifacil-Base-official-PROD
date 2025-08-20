import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import PlanUpgradeDialog from "@/components/PlanUpgradeDialog";
import { useIsMobile } from "@/hooks/use-mobile";

// Price configuration object for easy editing
const PRICING_CONFIG = {
  monthlyPriceDisplay: "R$ 14,90",
  // Amount in cents for Stripe
  monthlyPriceAmount: 1990,
  currency: "brl"
};

const Landing = () => {
  const { user } = useAuth();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Micro-animations on scroll
  useEffect(() => {
    const fadeInElements = document.querySelectorAll('.fade-in-element');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    fadeInElements.forEach(element => {
      observer.observe(element);
    });
    
    return () => {
      fadeInElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  const handleOpenUpgradeDialog = () => {
    setIsUpgradeDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white mx-0 px-0 my-0 py-0">
      {/* Hero Section */}
      <section className="pt-24 pb-24 px-0 py-0">
        <div className="container mx-auto px-6 md:px-8 lg:px-16">
          {/* Mobile-only logo at the top */}
          {isMobile && (
            <div className="flex justify-center mb-8 mt-0">
              <img 
                alt="Passei Fácil Logo" 
                src="/lovable-uploads/4ed732db-a250-4cac-ba13-9727435d44dc.png" 
                className="h-[104px] w-auto object-contain" 
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 fade-in-element">
              {/* Logo removed - keeping only the header logo */}
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight px-0 mx-[11px] my-0 py-0 lg:text-6xl tracking-tight">
                O jeito mais fácil de estudar e criar questões!
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Transforme textos e imagens em quizzes interativos em segundos. 
                Prepare-se melhor para provas, concursos e OAB.
              </p>
              
              {/* Pricing display */}
              <div className="mb-8 bg-blue-50 p-6 rounded-xl inline-block">
                <p className="text-gray-600 mb-1">Assinatura mensal</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-800">{PRICING_CONFIG.monthlyPriceDisplay}</span>
                  <span className="text-gray-500 ml-2">/mês</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to={user ? "/quizzes" : "/register"}>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-6 text-lg font-medium shadow-md transition-transform hover:scale-105">
                    Assine Agora →
                  </Button>
                </Link>
              </div>
              
              {/* Benefits list */}
              <div className="space-y-4 fade-in-element">
                <h3 className="text-xl font-medium text-gray-800">O que você recebe:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>Quizzes ilimitados para otimizar seus estudos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>Geração de questões com IA a partir de seus materiais</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>Acesso à biblioteca compartilhada da comunidade</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span>Exportação e importação de conteúdos</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="order-1 md:order-2 flex justify-center md:justify-end fade-in-element">
              {/* Only show the illustration if we're not in mobile, or if in mobile, push it down */}
              <div className={`relative ${isMobile ? 'mt-8 order-3' : ''}`}>
                <img 
                  src="/lovable-uploads/d0b7d885-b5b8-4bab-81b6-9afe1e2720a7.png" 
                  alt="Estudantes interagindo com quizzes" 
                  className="w-full max-w-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 fade-in-element">
        <div className="container mx-auto px-6 md:px-8 lg:px-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16 tracking-tight">
            Como funciona?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-all">
              <div className="bg-blue-50 p-4 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-blue-500">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                  <path d="M9 17h6"></path>
                  <path d="M9 13h6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">1. Envie seu material</h3>
              <p className="text-gray-600">
                Faça upload de texto, PDF ou imagem da sua apostila ou material de estudo.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-all">
              <div className="bg-blue-50 p-4 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-blue-500">
                  <path d="M12 2v8l4 4"></path>
                  <circle cx="12" cy="14" r="8"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">2. Crie questões automaticamente</h3>
              <p className="text-gray-600">
                Nossa IA gera questões personalizadas instantaneamente para você praticar.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-all">
              <div className="bg-blue-50 p-4 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-blue-500">
                  <path d="M16 21v-2a4 4 0 0 0 -4 -4h-4a4 4 0 0 0 -4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0 -3 -3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">3. Resolva, compartilhe, aprenda</h3>
              <p className="text-gray-600">
                Responda, revise e compartilhe quizzes com amigos para aprender de forma colaborativa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 fade-in-element">
        <div className="container mx-auto px-6 md:px-8 lg:px-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16 tracking-tight">
            O que nossos usuários dizem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
              <p className="text-gray-600 mb-4 italic">
                "O Passei Fácil revolucionou minha forma de estudar para a OAB. Aumentei meu desempenho nos simulados em 30%!"
              </p>
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Ana Silva</h4>
                  <p className="text-sm text-gray-500">Estudante de Direito</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
              <p className="text-gray-600 mb-4 italic">
                "Gerar questões automaticamente a partir dos meus resumos economizou horas de estudo. A ferramenta é incrível!"
              </p>
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Carlos Mendes</h4>
                  <p className="text-sm text-gray-500">Concurseiro</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
              <p className="text-gray-600 mb-4 italic">
                "Uso o Passei Fácil para preparar atividades para meus alunos. Os resultados são excelentes!"
              </p>
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Mariana Costa</h4>
                  <p className="text-sm text-gray-500">Professora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 fade-in-element">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">
              Perguntas Frequentes
            </h2>
          </div>
          
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-lg text-gray-800 mb-2">Como funciona a assinatura?</h3>
                  <p className="text-gray-600">
                    A assinatura mensal de R$ 14,90 dá acesso completo a todos os recursos do Passei Fácil, 
                    incluindo criação ilimitada de quizzes, geração de questões por IA, exploração de conteúdo 
                    da comunidade e muito mais. A cobrança é feita mensalmente e você pode cancelar a qualquer momento.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-lg text-gray-800 mb-2">Posso cancelar quando quiser?</h3>
                  <p className="text-gray-600">
                    Sim! Você pode cancelar sua assinatura a qualquer momento através da sua conta. 
                    Após o cancelamento, você ainda terá acesso aos recursos até o final do período 
                    já pago. Não há taxas de cancelamento ou contratos de longo prazo.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <path d="M12 17h.01"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-lg text-gray-800 mb-2">Quais métodos de pagamento são aceitos?</h3>
                  <p className="text-gray-600">
                    Aceitamos pagamentos via cartão de crédito. O Pix está em fase de implementação 
                    e em breve estará disponível como método de pagamento. Fique atento às nossas 
                    atualizações para saber quando este recurso estiver disponível.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-500 fade-in-element">
        <div className="container mx-auto px-6 md:px-8 lg:px-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Pronto para melhorar seus estudos?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de estudantes que já estão usando o Passei Fácil para se preparar melhor e mais rápido.
          </p>
          <Link to={user ? "/quizzes" : "/register"}>
            <Button className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
              Assine Agora →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6 fade-in-element">
        <div className="container mx-auto px-6 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-xl font-bold">Passei Fácil</span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma que transforma a maneira como você estuda.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ajuda</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Passei Fácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>
        {`
        .fade-in-element {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        `}
      </style>

      {/* Plan Upgrade Dialog */}
      <PlanUpgradeDialog isOpen={isUpgradeDialogOpen} onClose={() => setIsUpgradeDialogOpen(false)} />
    </div>
  );
};

export default Landing;

