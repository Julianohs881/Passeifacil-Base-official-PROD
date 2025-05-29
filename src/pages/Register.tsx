
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loading, signUpWithGoogle, signUpWithEmail } = useFirebaseAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/quizzes");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 2MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Por favor, envie apenas arquivos de imagem");
        return;
      }
      
      setAvatar(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    
    const { user, error: signUpError } = await signUpWithGoogle();
    
    if (signUpError) {
      setError(signUpError.message || "Falha no cadastro com Google");
    } else if (user) {
      navigate("/quizzes");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    // Validate name
    if (!name.trim()) {
      setError("O nome é obrigatório");
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    const { user, error: signUpError } = await signUpWithEmail(email, password);
    
    if (signUpError) {
      setError(signUpError.message || "Falha ao criar conta");
    } else if (user) {
      // TODO: Save additional user data (name, avatar) to your database
      navigate("/quizzes");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para começar a criar seus quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botão de cadastro com Google - movido para o topo */}
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
            
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Ou cadastre-se com e-mail
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Avatar upload */}
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-24 h-24 border-2 border-gray-200">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Preview" />
                  ) : (
                    <AvatarFallback className="bg-gray-100 text-gray-400">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex items-center">
                  <label htmlFor="avatar" className="cursor-pointer text-violet-500 hover:text-violet-600 text-sm font-medium">
                    {avatarPreview ? "Alterar foto" : "Adicionar foto de perfil"}
                    <input 
                      type="file" 
                      id="avatar" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                  </label>
                  
                  {avatarPreview && (
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-600 text-sm font-medium"
                      onClick={() => {
                        setAvatarPreview(null);
                        setAvatar(null);
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
              
              {/* Name field */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome completo *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha *
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Senha *
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-violet-500 hover:bg-violet-600 rounded-xl" 
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
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
  );
};

export default Register;
