import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Clock } from "lucide-react";
import PlanBadge from "@/components/PlanBadge";
import { UserPlan } from "@/types";
import { useStripeSubscription } from "@/hooks/useStripeSubscription";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const UserProfile = () => {
  const { user, userProfile, updateProfile, isPro } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cancelSubscription, isLoading: isLoadingStripe } = useStripeSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    console.log("UserProfile useEffect - userProfile:", userProfile);
    console.log("userProfile?.name:", userProfile?.name);
    console.log("Tipo do userProfile?.name:", typeof userProfile?.name);
    
    if (userProfile?.name) {
      console.log("Setting name from userProfile:", userProfile.name);
      setName(userProfile.name);
    } else {
      console.log("No name in userProfile, setting empty string");
      setName("");
    }
    
    if (userProfile?.avatar_url) {
      setAvatarPreview(userProfile.avatar_url);
    }
  }, [userProfile]);

  // Calculate days until subscription expires
  const getSubscriptionDaysLeft = () => {
    if (!userProfile?.subscription_end_date) return null;
    
    const endDate = new Date(userProfile.subscription_end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const subscriptionDaysLeft = getSubscriptionDaysLeft();

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
  
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatar || !user) return null;
    
    try {
      const fileExt = avatar.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
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
    
    if (!user || !updateProfile) return;
    
    console.log("Submitting profile update with name:", name);
    setLoading(true);
    
    try {
      // Upload new avatar if changed
      let avatarUrl: string | undefined = undefined;
      if (avatar) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }
      
      // Update profile with name and possibly new avatar URL
      const result = await updateProfile({ 
        name: name.trim() || undefined,
        avatarUrl: avatarUrl
      });
      
      console.log("Profile update result:", result);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  // Handle the UserPlan type safely
  const userPlan: UserPlan = (userProfile?.plan as UserPlan) || "gratuito";

  return (
    <div className="container max-w-2xl py-8 px-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Meu Perfil</CardTitle>
              <CardDescription>Gerencie suas informações de perfil</CardDescription>
            </div>
            <PlanBadge plan={userPlan} />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 border-2 border-gray-200">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={name} />
                  ) : (
                    <AvatarFallback className="bg-gray-100 text-gray-400">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex items-center mt-2">
                  <label htmlFor="avatar-upload" className="cursor-pointer text-violet-500 hover:text-violet-600 text-sm font-medium">
                    {avatarPreview ? "Alterar foto" : "Adicionar foto"}
                    <input 
                      type="file" 
                      id="avatar-upload" 
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
              
              <div className="flex-1 w-full">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">
                      Nome completo
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-violet-500 hover:bg-violet-600"
              >
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Subscription Status Card */}
      {isPro() && userProfile?.subscription_end_date && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-500" />
              <CardTitle className="text-lg">Status da Assinatura</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-full">
                  <Clock className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {subscriptionDaysLeft !== null && subscriptionDaysLeft > 0
                      ? `${subscriptionDaysLeft} ${subscriptionDaysLeft === 1 ? 'dia restante' : 'dias restantes'}`
                      : subscriptionDaysLeft === 0
                      ? 'Expira hoje'
                      : 'Assinatura expirada'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    Vence em: {new Date(userProfile.subscription_end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscriptionDaysLeft !== null && subscriptionDaysLeft > 30
                    ? 'bg-green-100 text-green-800'
                    : subscriptionDaysLeft !== null && subscriptionDaysLeft > 7
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscriptionDaysLeft !== null && subscriptionDaysLeft > 0
                    ? 'Ativa'
                    : 'Expirada'
                  }
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoadingStripe}
                >
                  {isLoadingStripe ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Cancelar assinatura"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Modal de confirmação de cancelamento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogTitle>Cancelar assinatura</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar sua assinatura PRO? Você será redirecionado para o Stripe onde poderá confirmar o cancelamento. Sua conta será automaticamente rebaixada para gratuita após o cancelamento.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Não, manter PRO
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setShowCancelDialog(false);
                await cancelSubscription();
              }}
              disabled={isLoadingStripe}
            >
              {isLoadingStripe ? "Redirecionando..." : "Sim, cancelar assinatura"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
