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
          const user = session.user;
          console.log("Usuário autenticado:", user.id);
          
          // Verificar se o usuário já tem um perfil
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', user.id)
            .single();
          
          if (profileCheckError) {
            console.log("Erro ao verificar perfil existente:", profileCheckError);
          }
          
          console.log("Perfil existente:", existingProfile);
          
          // Se não tiver perfil, criar um novo
          if (!existingProfile) {
            const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
            console.log("Criando perfil para usuário:", user.id, "com nome:", userName);
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  name: userName,
                  email: user.email,
                  plan: 'gratuito'
                }
              ]);
              
            if (profileError) {
              console.error('Erro ao criar perfil:', profileError);
              
              // Tentar novamente com upsert
              const { error: upsertError } = await supabase
                .from('profiles')
                .upsert([
                  {
                    id: user.id,
                    name: userName,
                    email: user.email,
                    plan: 'gratuito'
                  }
                ]);
                
              if (upsertError) {
                console.error('Erro no upsert do perfil:', upsertError);
              } else {
                console.log('Perfil criado com upsert');
              }
            } else {
              console.log('Perfil criado com sucesso');
            }
          } else {
            console.log('Perfil já existe:', existingProfile.name);
          }
          
          toast({
            title: "Login realizado com sucesso!",
            description: `Bem-vindo, ${user.user_metadata?.full_name || user.user_metadata?.name || user.email}!`,
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