
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const {
    user,
    signOut,
    userProfile
  } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoSize, setLogoSize] = useState(20); // Default size value
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const { toast } = useToast();
  
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
  useState(() => {
    const savedSize = localStorage.getItem("logo-size");
    if (savedSize) {
      setLogoSize(parseInt(savedSize));
    }
  });

  return <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/61906f4a-5d23-4a09-909e-921d27ec387b.png" 
              alt="Passei Fácil" 
              className={`h-${logoSize} max-h-[48px] w-auto object-contain`} 
            />
          </Link>
          
          {user && userProfile?.plan === "pro" && (
            <Popover open={showLogoEditor} onOpenChange={setShowLogoEditor}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-gray-500 hover:text-violet-600"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h3 className="font-medium">Ajustar tamanho do logo</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Menor</span>
                      <span>Maior</span>
                    </div>
                    <Slider 
                      defaultValue={[logoSize]} 
                      max={24} 
                      min={12} 
                      step={1}
                      onValueChange={handleLogoSizeChange}
                    />
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
                  Explore the platform and manage your account.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-2 mt-4">
                <Link to="/quizzes" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                  Meus Quizzes
                </Link>
                <Link to="/explore" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                  Explorar
                </Link>
                {user ? <>
                    <Link to="/profile" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                      Perfil
                    </Link>
                    <Button variant="ghost" size="sm" className="justify-start" onClick={handleSignOut}>
                      Sair
                    </Button>
                  </> : <>
                    <Link to="/login" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                      Login
                    </Link>
                    <Link to="/register" className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                      Register
                    </Link>
                  </>}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/quizzes" className="py-2 text-gray-700 hover:text-violet-600 transition-colors">
            Meus Quizzes
          </Link>
          <Link to="/explore" className="py-2 text-gray-700 hover:text-violet-600 transition-colors">
            Explorar
          </Link>

          {user && <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 hover:text-violet-600 transition-colors">
                <Avatar className="h-8 w-8">
                  {userProfile?.avatar_url ? <AvatarImage src={userProfile.avatar_url} alt={userProfile.name || "User"} /> : <AvatarFallback className="bg-violet-100 text-violet-600">
                      {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
                    </AvatarFallback>}
                </Avatar>
                <span className="hidden md:inline">
                  {userProfile?.name || "Perfil"}
                </span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sair
              </Button>
            </div>}

          {!user && <div>
              <Link to="/login" className="py-2 text-gray-700 hover:text-violet-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="py-2 text-gray-700 hover:text-violet-600 transition-colors">
                Register
              </Link>
            </div>}
        </div>
      </div>
    </nav>;
};
export default NavBar;
