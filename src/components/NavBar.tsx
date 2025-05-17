import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavBar = () => {
  const { user, signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-gray-800">
          Quiz Platform
        </Link>

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
                <Link
                  to="/quizzes"
                  className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                >
                  Meus Quizzes
                </Link>
                <Link
                  to="/explore"
                  className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                >
                  Explorar
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
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
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block py-2 px-4 rounded hover:bg-gray-100 transition-colors"
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
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/quizzes"
            className="py-2 text-gray-700 hover:text-violet-600 transition-colors"
          >
            Meus Quizzes
          </Link>
          <Link
            to="/explore"
            className="py-2 text-gray-700 hover:text-violet-600 transition-colors"
          >
            Explorar
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:text-violet-600 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  {userProfile?.avatar_url ? (
                    <AvatarImage
                      src={userProfile.avatar_url}
                      alt={userProfile.name || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-violet-100 text-violet-600">
                      {userProfile?.name
                        ? userProfile.name[0].toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden md:inline">
                  {userProfile?.name || "Perfil"}
                </span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          )}

          {!user && (
            <div>
              <Link
                to="/login"
                className="py-2 text-gray-700 hover:text-violet-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="py-2 text-gray-700 hover:text-violet-600 transition-colors"
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
