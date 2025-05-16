
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
    <header className="bg-white">
      <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10L80 25V75L50 90L20 75V25L50 10Z" fill="#0F172A" />
              <path d="M40 35L50 30L60 35V65L50 70L40 65V35Z" fill="#0F172A" stroke="white" strokeWidth="2" />
              <path d="M50 30V20M50 20L35 15V20M50 20L65 15V20" stroke="white" strokeWidth="2" />
              <path d="M65 80C65 80 55 85 50 85C45 85 35 80 35 80" stroke="white" strokeWidth="2" />
              <path d="M70 70L80 80" stroke="#0F172A" strokeWidth="3" />
              <path d="M80 65L90 50L75 35L60 50L70 60L80 65Z" fill="#22C55E" />
            </svg>
          </div>
          <span className="ml-3 text-2xl font-bold text-[#0F172A]">Passei Fácil</span>
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
                className="text-[#0F172A] hover:bg-gray-50"
              >
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-[#0F172A] text-[#0F172A] rounded-full px-6">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-[#0096FF] hover:bg-blue-600 rounded-full px-6">
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
