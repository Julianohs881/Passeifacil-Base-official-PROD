// Utilitário para debug do Supabase
import { supabase } from '@/integrations/supabase/client';

export const debugSupabaseConfig = () => {
  console.log('=== DEBUG SUPABASE CONFIG ===');
  
  // Verificar variáveis de ambiente
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado');
  
  // Verificar configuração do cliente
  console.log('Supabase Client URL:', supabase.supabaseUrl);
  console.log('Supabase Client Key:', supabase.supabaseKey ? '✅ Configurado' : '❌ Não configurado');
  
  // Verificar configurações de auth
  console.log('Auth Config:', {
    storage: supabase.auth.storage,
    persistSession: supabase.auth.persistSession,
    autoRefreshToken: supabase.auth.autoRefreshToken,
    detectSessionInUrl: supabase.auth.detectSessionInUrl,
    flowType: supabase.auth.flowType
  });
  
  // Verificar URL atual
  console.log('URL Atual:', window.location.href);
  console.log('Parâmetros da URL:', Object.fromEntries(new URLSearchParams(window.location.search)));
  
  console.log('=== FIM DEBUG ===');
};

export const checkSupabaseConnection = async () => {
  try {
    console.log('Testando conexão com Supabase...');
    
    const { data, error } = await supabase.from('_dummy_table_').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('✅ Conexão com Supabase funcionando (erro esperado para tabela inexistente)');
        return true;
      } else {
        console.error('❌ Erro na conexão com Supabase:', error);
        return false;
      }
    }
    
    console.log('✅ Conexão com Supabase funcionando');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};

export const checkAuthStatus = async () => {
  try {
    console.log('Verificando status de autenticação...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return { hasSession: false, error: error.message };
    }
    
    if (session) {
      console.log('✅ Usuário autenticado:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at
      });
      return { hasSession: true, session };
    } else {
      console.log('ℹ️ Nenhuma sessão ativa');
      return { hasSession: false, session: null };
    }
  } catch (error) {
    console.error('❌ Erro ao verificar status de autenticação:', error);
    return { hasSession: false, error: 'Erro inesperado' };
  }
};
