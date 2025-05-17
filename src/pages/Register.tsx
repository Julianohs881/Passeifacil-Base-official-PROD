
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 2MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }
      
      setAvatar(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };
  
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatar) return null;
    
    try {
      const fileExt = avatar.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, avatar, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validate name
    if (!name.trim()) {
      setError("O nome é obrigatório");
      setLoading(false);
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }
    
    try {
      // Sign up the user
      const { data: userData, error: signUpError } = await signUp(email, password, name);
      
      if (signUpError) throw signUpError;
      
      // If avatar was selected, upload it after successful signup
      if (avatar && userData?.user) {
        const avatarUrl = await uploadAvatar(userData.user.id);
        
        if (avatarUrl) {
          // Update the profile with avatar URL
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', userData.user.id);
            
          if (updateError) console.error("Error updating profile with avatar:", updateError);
        }
      }
      
      // Notify user of successful registration
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
      
      // Navigate to login page
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Falha ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para começar a criar seus quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
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
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-violet-500 hover:bg-violet-600" 
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
