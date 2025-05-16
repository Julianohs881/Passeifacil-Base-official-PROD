
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-900 transform rotate-45 absolute top-0"></div>
            <div className="w-8 h-8 flex items-center justify-center relative">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4l-8 4v12l8-4 8 4v-12l-8-4z" fill="#0f172a"/>
                <path d="M12 4v12" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8l8 4 8-4" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="ml-1 flex items-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500 ml-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17l-4.17-4.17 1.42-1.41 2.75 2.75 5.59-5.59 1.41 1.41-7 7z" />
            </svg>
            <span className="text-lg font-bold text-blue-900 ml-1">Passei Fácil</span>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline-block">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-sm"
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-blue-100 text-blue-900">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  Criar conta
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
