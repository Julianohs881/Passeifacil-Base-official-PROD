import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Check, ArrowRight, Upload, Zap, Users, User, HelpCircle, Facebook, Instagram, Twitter, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PlanUpgradeDialog from "@/components/PlanUpgradeDialog";
import { useIsMobile } from "@/hooks/use-mobile";

// Price configuration object for easy editing
const PRICING_CONFIG = {
  monthlyPriceDisplay: "R$ 19,90",
  // Display price (formatted with comma)
  monthlyPriceAmount: 1990,
  // Amount in cents for Stripe
  currency: "brl"
};
const Landing = () => {
  const {
    user
  } = useAuth();
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const handleOpenUpgradeDialog = () => {
    setIsUpgradeDialogOpen(true);
  };
  return <div className="min-h-screen bg-white pt-20 my-0 py-[6px]">
      {/* Hero Section */}
      <section className="pt-16 pb-16 md:pt-24 md:pb-24 px-0 py-0">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          {/* Mobile-only logo at the top */}
          {isMobile && <div className="flex justify-center mb-8 mt-0">
              <img alt="Passei Fácil Logo" src="/lovable-uploads/4ed732db-a250-4cac-ba13-9727435d44dc.png" className="h-[104px] w-auto object-contain" />
            </div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              {/* Logo centered above the title - visible only on desktop */}
              {!isMobile && <div className="flex justify-center md:justify-start mb-6 px-0 py-0 rounded-none my-[2px]">
                  <img alt="Passei Fácil Logo" src="/lovable-uploads/4ed732db-a250-4cac-ba13-9727435d44dc.png" className="h-[64px] lg:h-[72px] w-auto object-contain" />
                </div>}
              
              <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6 leading-tight px-0 mx-[11px] my-0 py-0 lg:text-6xl">
                O jeito mais fácil de estudar e criar questões!
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                Transforme textos e imagens em quizzes interativos em segundos. Prepare-se melhor para provas, concursos e OAB.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={user ? "/quizzes" : "/register"}>
                  <Button className="btn-cta w-full sm:w-auto">
                    Comece Agora (Grátis)
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Button onClick={handleOpenUpgradeDialog} variant="outline" className="border-blue-500 text-blue-900 hover:bg-blue-50 w-full sm:w-auto">
                  Veja os Benefícios do PRO
                </Button>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              {/* Only show the illustration if we're not in mobile, or if in mobile, push it down */}
              <div className={`relative ${isMobile ? 'mt-8 order-3' : ''}`}>
                <img src="/lovable-uploads/d0b7d885-b5b8-4bab-81b6-9afe1e2720a7.png" alt="Estudantes interagindo com quizzes" className="w-full max-w-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 text-center mb-16">
            Como funciona?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-50 p-4 rounded-full mb-6">
                <Upload className="w-10 h-10 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Envie seu material</h3>
              <p className="text-gray-600">
                Faça upload de texto, PDF ou imagem da apostila.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-50 p-4 rounded-full mb-6">
                <Zap className="w-10 h-10 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Gere questões automaticamente</h3>
              <p className="text-gray-600">
                IA cria perguntas instantaneamente para você praticar.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-50 p-4 rounded-full mb-6">
                <Users className="w-10 h-10 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Resolva, compartilhe, aprenda</h3>
              <p className="text-gray-600">
                Responda, revise e troque quizzes com amigos ou colegas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens do PRO Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Por que vale a pena ser PRO?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desbloqueie todo o potencial do Passei Fácil e estude de forma mais eficiente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Tabela comparativa */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="bg-gray-50 p-6 border-b">
                <h3 className="text-xl font-bold text-gray-700">Plano Gratuito</h3>
                <p className="text-2xl font-bold mt-2">R$ 0,00</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Até 5 quizzes</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Até 20 questões por quiz</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Criação manual de questões</span>
                </div>
                <div className="flex items-start text-gray-400">
                  <Check className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="line-through">Geração de quizzes com IA</span>
                </div>
                <div className="flex items-start text-gray-400">
                  <Check className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="line-through">Explorar quizzes da comunidade</span>
                </div>
                <div className="flex items-start text-gray-400">
                  <Check className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="line-through">Exportação e importação</span>
                </div>
                <div className="flex items-start text-gray-400">
                  <Check className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="line-through">Suporte prioritário</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl overflow-hidden shadow-lg border-2 border-amber-400 relative">
              <div className="absolute top-0 right-0 bg-amber-400 text-white px-4 py-1 rounded-bl-lg font-medium">Recomendado</div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 border-b">
                <h3 className="text-xl font-bold text-white">Plano PRO</h3>
                <p className="text-2xl font-bold mt-2 text-white">{PRICING_CONFIG.monthlyPriceDisplay}<span className="text-base font-normal">/mês</span></p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Quizzes ilimitados</strong></span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Questões ilimitadas</strong> por quiz</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Criação manual de questões</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Geração de quizzes com IA</strong> (até 50/mês)</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Explorar quizzes da comunidade</strong></span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Exportação e importação</strong> de quizzes</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span><strong>Suporte prioritário</strong></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button onClick={handleOpenUpgradeDialog} className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white text-xl px-10 py-6 rounded-full shadow-md">
              <Crown className="h-5 w-5 mr-2" />
              Quero ser PRO
            </Button>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 text-center mb-16">
            O que nossos usuários dizem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold">Ana Silva</h4>
                  <p className="text-sm text-gray-500">Estudante de Direito</p>
                </div>
              </div>
              <p className="text-gray-700">
                "O Passei Fácil revolucionou minha forma de estudar para a OAB. Em apenas um mês de uso do plano PRO, consegui aumentar meu desempenho nos simulados em 30%!"
              </p>
            </div>
            
            {/* Depoimento 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold">Carlos Mendes</h4>
                  <p className="text-sm text-gray-500">Concurseiro</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Gerar questões automaticamente a partir dos meus resumos economizou horas de estudo. A ferramenta de IA é simplesmente incrível e muito precisa!"
              </p>
            </div>
            
            {/* Depoimento 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold">Mariana Costa</h4>
                  <p className="text-sm text-gray-500">Professora</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Uso o Passei Fácil para preparar atividades para meus alunos. A possibilidade de compartilhar quizzes facilita muito o trabalho e os resultados são excelentes!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre o Passei Fácil
            </p>
          </div>
          
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start">
                <HelpCircle className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-blue-900 mb-2">Como funciona o plano PRO?</h3>
                  <p className="text-gray-700">
                    O plano PRO é uma assinatura mensal que dá acesso a todos os recursos premium do Passei Fácil, 
                    incluindo criação ilimitada de quizzes, geração de questões por IA, exploração de conteúdo da comunidade e muito mais. 
                    A cobrança é feita mensalmente e você pode cancelar a qualquer momento.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start">
                <HelpCircle className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-blue-900 mb-2">O que posso fazer de graça?</h3>
                  <p className="text-gray-700">
                    Na versão gratuita, você pode criar até 5 quizzes com até 20 questões cada. Também é possível 
                    fazer login, acessar e responder seus próprios quizzes. A criação manual de questões está 
                    disponível, mas recursos avançados como IA e exploração de conteúdo são exclusivos para usuários PRO.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start">
                <HelpCircle className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-blue-900 mb-2">Posso cancelar quando quiser?</h3>
                  <p className="text-gray-700">
                    Sim! Você pode cancelar sua assinatura PRO a qualquer momento através da sua conta. 
                    Após o cancelamento, você ainda terá acesso aos recursos PRO até o final do período 
                    já pago. Não há taxas de cancelamento ou contratos de longo prazo.
                  </p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-start">
                <HelpCircle className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-blue-900 mb-2">Pix é aceito?</h3>
                  <p className="text-gray-700">
                    Atualmente aceitamos pagamentos via cartão de crédito. O Pix está em fase de implementação 
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para melhorar seus estudos?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de estudantes que já estão usando o Passei Fácil para se preparar melhor e mais rápido.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={user ? "/quizzes" : "/register"}>
              <Button className="bg-white text-blue-800 hover:bg-blue-50 text-lg px-8 py-6 rounded-full shadow-lg w-full sm:w-auto">
                Comece Agora (Grátis)
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button onClick={handleOpenUpgradeDialog} className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white text-lg px-8 py-6 rounded-full shadow-lg w-full sm:w-auto">
              <Crown className="h-5 w-5 mr-2" />
              Quero ser PRO
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative">
                  <GraduationCap className="w-8 h-8 text-white" />
                  <Check className="w-4 h-4 text-emerald-500 absolute bottom-0 right-0" />
                </div>
                <span className="ml-3 text-xl font-bold">Passei Fácil</span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma que transforma a maneira como você estuda.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Pol��tica de Privacidade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Ajuda</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Passei Fácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Plan Upgrade Dialog */}
      <PlanUpgradeDialog isOpen={isUpgradeDialogOpen} onClose={() => setIsUpgradeDialogOpen(false)} />
    </div>;
};
export default Landing;