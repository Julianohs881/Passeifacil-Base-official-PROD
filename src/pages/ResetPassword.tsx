import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePasswordRecovery } from '@/hooks/usePasswordRecovery';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  const { loading, resetPassword, checkRecoverySession } = usePasswordRecovery();

  // Verificar se o usuário está autenticado via link de recuperação
  useEffect(() => {
    // Executar apenas uma vez
    if (hasCheckedAuth) return;
    
    const checkAuth = async () => {
      try {
        setIsChecking(true);
        setHasCheckedAuth(true);
        
        console.log('Verificando autenticação...');
        
        // Verificar sessão atual
        const { isValid, error, session } = await checkRecoverySession();
        
        if (!isValid) {
          console.error('Sessão inválida:', error);
          toast.error('Link inválido ou expirado. Solicite um novo link de recuperação.');
          navigate('/forgot-password');
          return;
        }
        
        if (session) {
          console.log('Sessão válida encontrada');
          setIsValidSession(true);
          toast.success('Link válido! Você pode alterar sua senha.');
        } else {
          console.error('Sessão inválida');
          toast.error('Erro na sessão. Solicite um novo link de recuperação.');
          navigate('/forgot-password');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        toast.error('Erro ao verificar autenticação. Tente novamente.');
        navigate('/forgot-password');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, []); // Array vazio para executar apenas uma vez

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error('A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números.');
      return;
    }

    const result = await resetPassword(password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
            <span className="ml-3 text-gray-600">
              Verificando link...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar erro se não tiver sessão válida
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Link Inválido</CardTitle>
            <CardDescription>
              Este link de recuperação é inválido ou expirou. Solicite um novo link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/forgot-password">
                <RefreshCw className="mr-2 h-4 w-4" />
                Solicitar Novo Link
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Senha Alterada!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Você será redirecionado para o login em alguns segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">
                Ir para o Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validation = validatePassword(password);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Nova Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Validação de senha */}
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-700">Requisitos da senha:</p>
              <div className="space-y-1">
                <div className={`flex items-center ${validation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${validation.minLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Mínimo 8 caracteres
                </div>
                <div className={`flex items-center ${validation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${validation.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Pelo menos uma maiúscula
                </div>
                <div className={`flex items-center ${validation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${validation.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Pelo menos uma minúscula
                </div>
                <div className={`flex items-center ${validation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${validation.hasNumbers ? 'bg-green-500' : 'bg-gray-300'}`} />
                  Pelo menos um número
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password || !confirmPassword || !validation.isValid}
            >
              {loading ? 'Alterando Senha...' : 'Alterar Senha'}
            </Button>
            
            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o Login
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
