
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const { user, signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [logoSize, setLogoSize] = useState(20); // Default size value
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const { toast } = useToast();

  // Add state to track subscription success notification
  const [showedProWelcome, setShowedProWelcome] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const handleLogoSizeChange = (value: number[]) => {
    setLogoSize(value[0]);
  };

  const saveLogoSize = () => {
    localStorage.setItem("logo-size", logoSize.toString());
    setShowLogoEditor(false);
    toast({
      title: "Tamanho do logo salvo",
      description: "O tamanho do logo foi atualizado com sucesso."
    });
  };

  // Load saved logo size from localStorage on component mount
  useEffect(() => {
    const savedSize = localStorage.getItem("logo-size");
    if (savedSize) {
      setLogoSize(parseInt(savedSize));
    }
  }, []);

  // Show welcome toast when user becomes Pro
  useEffect(() => {
    const subscriptionSuccess = new URLSearchParams(location.search).get("subscription") === "success";
    if (userProfile?.plan === "pro" && !showedProWelcome && (subscriptionSuccess || sessionStorage.getItem("new_pro_user") === "true")) {
      toast({
        title: "Parabéns! Assinatura ativada com sucesso!",
        description: "Você agora tem acesso a todos os recursos premium do Passei Fácil.",
        duration: 6000
      });
      setShowedProWelcome(true);
      sessionStorage.setItem("new_pro_user", "true");

      // Clean up the URL if it has subscription=success
      if (subscriptionSuccess) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("subscription");
        window.history.replaceState({}, document.title, newUrl.toString());
      }
    }
  }, [userProfile, toast, showedProWelcome, location]);

  // Verificar se o usuário acabou de assinar
  useEffect(() => {
    const isNewSubscriber = sessionStorage.getItem("new_subscriber");
    if (isNewSubscriber && userProfile?.has_access) {
      // Remove the flag
      sessionStorage.removeItem("new_subscriber");
      toast({
        title: "Parabéns! Assinatura ativada com sucesso!",
        description: "Agora você tem acesso a todas as funcionalidades da plataforma.",
        variant: "default",
        duration: 5000
      });
    }
  }, [userProfile, toast]);

  return (
    <nav className="bg-white border-b border-gray-100 fixed top-0 left-0 w-full z-50 shadow-sm">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/61906f4a-5d23-4a09-909e-921d27ec387b.png" 
              alt="Passei Fácil" 
              className={`h-${logoSize} max-h-[60px] w-auto object-contain`} 
            />
          </Link>
          
          {user && userProfile?.plan === "pro" && (
            <Popover open={showLogoEditor} onOpenChange={setShowLogoEditor}>
              <PopoverTrigger asChild>
                
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-medium">Ajustar tamanho do logo</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Menor</span>
                      <span>Maior</span>
                    </div>
                    <Slider defaultValue={[logoSize]} max={24} min={12} step={1} onValueChange={handleLogoSizeChange} />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveLogoSize} size="sm">
                      Salvar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Explore a plataforma e gerencie sua conta.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-2 mt-4">
                <Link 
                  to="/quizzes" 
                  className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Meus Quizzes
                </Link>
                <Link 
                  to="/explore" 
                  className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Explorar
                </Link>
                {user ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Perfil
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start" 
                      onClick={handleSignOut}
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/quizzes" className="py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Meus Quizzes
          </Link>
          <Link to="/explore" className="py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Explorar
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                <Avatar className="h-8 w-8">
                  {userProfile?.avatar_url ? (
                    <AvatarImage src={userProfile.avatar_url} alt={userProfile.name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden md:inline font-medium">
                  {userProfile?.name || "Perfil"}
                </span>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Sair
              </Button>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
