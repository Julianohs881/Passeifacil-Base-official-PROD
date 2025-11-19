import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signUpWithEmail, supabase } from "@/integrations/supabase/client";
import InterestAreasRegistration from "@/components/InterestAreasRegistration";
import SubAreasRegistration from "@/components/SubAreasRegistration";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInterestAreas, setShowInterestAreas] = useState(false);
  const [showSubAreas, setShowSubAreas] = useState(false);
  const [selectedInterestAreas, setSelectedInterestAreas] = useState<string[]>([]);
  const [selectedInterestSubareas, setSelectedInterestSubareas] = useState<string[]>([]);
  const [userData, setUserData] = useState<{ name: string; email: string; password: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
      toast({
        title: "Conta criada com sucesso!",
        description: "Você foi cadastrado com sua conta Google.",
      });
      navigate('/quizzes');
    } catch (error: any) {
      console.error("Erro no cadastro com Google:", error);
      setError(error.message || "Falha no cadastro com Google");
      toast({
        title: "Erro no cadastro com Google",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Por favor, insira seu nome");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    // Salvar dados do usuário e mostrar seleção de áreas de interesse
    setUserData({ name, email, password });
    setShowInterestAreas(true);
  };

  const handleInterestAreasContinue = () => {
    // Ir para a próxima etapa (temáticas)
    setShowInterestAreas(false);
    setShowSubAreas(true);
  };

  const handleSubAreasBack = () => {
    // Voltar para a etapa anterior (áreas principais)
    setShowSubAreas(false);
    setShowInterestAreas(true);
  };

  const handleSubAreasContinue = async () => {
    if (!userData) return;
    
    try {
      setLoading(true);
      setError("");
      
      console.log("Iniciando cadastro para:", userData.email, "com nome:", userData.name);
      
      // Criar conta com email e senha
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (data.user) {
        console.log("Usuário criado com sucesso:", data.user.id);
        
        // Aguardar um pouco para garantir que o usuário foi criado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o perfil já existe
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', data.user.id)
          .single();
          
        console.log("Perfil existente:", existingProfile);
        
        if (!existingProfile) {
          // Criar perfil do usuário com o nome e áreas de interesse
          console.log("Criando perfil para usuário:", data.user.id);
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                name: userData.name.trim(),
                email: userData.email,
                plan: 'gratuito',
                interest_areas: selectedInterestAreas,
                interest_subareas: selectedInterestSubareas
              }
            ]);
            
          if (profileError) {
            console.error("Erro ao criar perfil:", profileError);
            
            // Se der erro ao criar perfil, tentar novamente
            const { error: retryError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: data.user.id,
                  name: userData.name.trim(),
                  email: userData.email,
                  plan: 'gratuito',
                  interest_areas: selectedInterestAreas,
                  interest_subareas: selectedInterestSubareas
                }
              ]);
              
            if (retryError) {
              console.error("Erro na segunda tentativa de criar perfil:", retryError);
            } else {
              console.log("Perfil criado com upsert");
            }
          } else {
            console.log("Perfil criado com sucesso");
          }
          
          // Verificar se o perfil foi criado
          const { data: verifyProfile } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', data.user.id)
            .single();
            
          console.log("Perfil verificado após criação:", verifyProfile);
        } else {
          console.log("Perfil já existe, atualizando nome e áreas de interesse");
          
          // Atualizar o nome e áreas de interesse se o perfil já existir
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              name: userData.name.trim(),
              interest_areas: selectedInterestAreas,
              interest_subareas: selectedInterestSubareas
            })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error("Erro ao atualizar perfil:", updateError);
          } else {
            console.log("Perfil atualizado com sucesso");
          }
        }
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao Passei Fácil!",
        });
        navigate('/quizzes');
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      let errorMessage = "Falha no cadastro";
      
      // Tratar erros específicos
      if (error.message?.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login ou use outro email.";
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Por favor, insira um email válido.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterestAreasSkip = () => {
    // Pular temáticas e ir direto para o cadastro final
    handleSubAreasContinue();
  };

  // Se estiver mostrando a seleção de temáticas
  if (showSubAreas) {
    return (
      <div className="flex min-h-screen bg-white">
        {/* Lado esquerdo - Logo e frase */}
        <div className="hidden lg:flex lg:w-1/2 items-center p-12">
          <div className="max-w-lg w-full">
            <div className="flex justify-start mb-4">
               <img 
                src="/logo.png" 
                alt="Passei Fácil Logo"
                className="w-48"
              />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Especifique suas temáticas!
              </h1>
              <p className="text-gray-600 text-lg">
                Agora escolha as temáticas específicas que mais te interessam para receber recomendações ainda mais precisas.
              </p>
            </div>
          </div>
        </div>

        {/* Lado direito - Seleção de temáticas */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <SubAreasRegistration
              selectedAreas={selectedInterestAreas}
              selectedSubareas={selectedInterestSubareas}
              onSubareasChange={setSelectedInterestSubareas}
              onContinue={handleSubAreasContinue}
              onBack={handleSubAreasBack}
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
                <div className="mb-2">
                  {error}
                </div>
                {error.includes("já está cadastrado") && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/login')}
                      className="flex-1"
                    >
                      Ir para Login
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError("");
                        setShowSubAreas(false);
                        setShowInterestAreas(false);
                        setUserData(null);
                        setSelectedInterestAreas([]);
                        setSelectedInterestSubareas([]);
                      }}
                      className="flex-1"
                    >
                      Tentar outro email
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se estiver mostrando a seleção de áreas de interesse
  if (showInterestAreas) {
    return (
      <div className="flex min-h-screen bg-white">
        {/* Lado esquerdo - Logo e frase */}
        <div className="hidden lg:flex lg:w-1/2 items-center p-12">
          <div className="max-w-lg w-full">
            {/* Logo alinhada à esquerda dentro do max-w-lg */}
            <div className="flex justify-start mb-4">
               <img 
                src="/logo.png" 
                alt="Passei Fácil Logo"
                className="w-48"
              />
            </div>
            {/* Frase e parágrafo centralizados dentro do max-w-lg */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Personalize sua experiência!
              </h1>
              <p className="text-gray-600 text-lg">
                Selecione suas áreas de interesse para receber recomendações
                personalizadas de quizzes na comunidade.
              </p>
            </div>
          </div>
        </div>

        {/* Lado direito - Seleção de áreas de interesse */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <InterestAreasRegistration
              selectedAreas={selectedInterestAreas}
              selectedSubareas={selectedInterestSubareas}
              onAreasChange={setSelectedInterestAreas}
              onSubareasChange={setSelectedInterestSubareas}
              onContinue={handleInterestAreasContinue}
              onSkip={handleInterestAreasSkip}
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
                <div className="mb-2">
                {error}
                </div>
                {error.includes("já está cadastrado") && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/login')}
                      className="flex-1"
                    >
                      Ir para Login
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError("");
                        setShowInterestAreas(false);
                        setUserData(null);
                        setSelectedInterestAreas([]);
                        setSelectedInterestSubareas([]);
                      }}
                      className="flex-1"
                    >
                      Tentar outro email
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Lado esquerdo - Logo e frase */}
      <div className="hidden lg:flex lg:w-1/2 items-center p-12">
        <div className="max-w-lg w-full">
          {/* Logo alinhada à esquerda dentro do max-w-lg */}
          <div className="flex justify-start mb-4">
             <img 
              src="/logo.png" 
              alt="Passei Fácil Logo"
              className="w-48"
            />
          </div>
          {/* Frase e parágrafo centralizados dentro do max-w-lg */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              O jeito mais fácil de estudar e criar questões!
            </h1>
            <p className="text-gray-600 text-lg">
              Transforme textos e imagens em quizzes interativos em
              segundos. Prepare-se melhor para provas, concursos e OAB.
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de cadastro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados para começar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Botão de cadastro com Google */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Cadastrar com Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Formulário de cadastro com email/senha */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-sm text-gray-500">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-violet-500 hover:underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
