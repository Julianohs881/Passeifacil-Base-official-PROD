import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { toast } from 'sonner';

export const usePasswordRecovery = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const sendResetEmail = async (email: string) => {
    setLoading(true);
    setSuccess(false);
    
    try {
      // Detectar se está em produção ou desenvolvimento
      const isProduction = window.location.hostname !== 'localhost';
      const redirectUrl = isProduction 
        ? 'https://passeifacil.com.br/reset-password'
        : `${window.location.origin.replace(':5173', ':8080')}/reset-password`;
      
      console.log('URL de redirecionamento:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Erro ao enviar email de recuperação:', error);
        toast.error('Erro ao enviar email de recuperação. Tente novamente.');
        return { success: false, error: error.message };
      }

      setSuccess(true);
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao enviar email:', error);
      toast.error('Erro inesperado. Tente novamente.');
      return { success: false, error: 'Erro inesperado' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = useCallback(async (password: string) => {
    setLoading(true);
    
    try {
      // Verificar se há uma sessão ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError);
        toast.error('Erro ao verificar sessão. Solicite um novo link de recuperação.');
        return { success: false, error: sessionError.message };
      }
      
      if (!session) {
        console.error('Nenhuma sessão encontrada');
        toast.error('Sessão expirada. Solicite um novo link de recuperação.');
        return { success: false, error: 'Sessão expirada' };
      }

      console.log('Sessão válida encontrada, alterando senha...');

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Erro ao alterar senha:', error);
        toast.error('Erro ao alterar senha. Tente novamente.');
        return { success: false, error: error.message };
      }

      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao alterar senha:', error);
      toast.error('Erro inesperado. Tente novamente.');
      return { success: false, error: 'Erro inesperado' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para verificar se o link de recuperação é válido
  const checkRecoverySession = useCallback(async () => {
    try {
      console.log('Verificando sessão de recuperação...');
      
      // Primeiro, verificar se há parâmetros na URL
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      console.log('Parâmetros da URL:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
      
      // Se há tokens na URL, tentar processar
      if (accessToken && refreshToken && type === 'recovery') {
        console.log('Processando tokens de recuperação da URL...');
        
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('Erro ao processar tokens da URL:', error);
          return { isValid: false, error: error.message };
        }
        
        if (data.session) {
          console.log('Sessão criada com sucesso a partir dos tokens da URL');
          return { isValid: true, session: data.session };
        }
      }
      
      // Verificar sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        return { isValid: false, error: error.message };
      }
      
      console.log('Sessão atual:', !!session);
      return { isValid: !!session, session };
    } catch (error) {
      console.error('Erro ao verificar sessão de recuperação:', error);
      return { isValid: false, error: 'Erro ao verificar sessão' };
    }
  }, []);

  // Função para tentar recuperar a sessão da URL
  const tryRecoverSession = useCallback(async () => {
    try {
      console.log('Tentando recuperar sessão da URL...');
      
      // Aguardar um pouco para o Supabase processar a URL
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Tentar obter a sessão novamente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao recuperar sessão:', error);
        return { isValid: false, error: error.message };
      }
      
      console.log('Sessão recuperada:', !!session);
      return { isValid: !!session, session };
    } catch (error) {
      console.error('Erro ao tentar recuperar sessão:', error);
      return { isValid: false, error: 'Erro ao tentar recuperar sessão' };
    }
  }, []);

  return {
    loading,
    success,
    sendResetEmail,
    resetPassword,
    checkRecoverySession,
    tryRecoverSession
  };
};
