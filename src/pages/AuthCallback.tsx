import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${session.user.user_metadata.full_name || session.user.email}!`,
          });
          navigate('/quizzes');
        } else {
          navigate('/login');
        }
      } catch (error: any) {
        console.error('Erro ao processar autenticação:', error);
        toast({
          title: "Erro na autenticação",
          description: error.message || "Erro inesperado",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Processando login...</h2>
        <p className="text-gray-600">Por favor, aguarde enquanto redirecionamos você.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 