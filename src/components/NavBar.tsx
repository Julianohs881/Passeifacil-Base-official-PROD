
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
      <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <svg width="40" height="40" viewBox="0 0 290 290" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M145 30L260 90V210L145 270L30 210V90L145 30Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2"/>
              <path d="M123 120L145 107.5L167 120V190L145 202.5L123 190V120Z" fill="#0F172A" stroke="white" strokeWidth="3"/>
              <path d="M145 107.5V77.5M145 77.5L110 63V77.5M145 77.5L180 63V77.5" stroke="white" strokeWidth="3"/>
              <path d="M180 225C180 225 165 235 145 235C125 235 110 225 110 225" stroke="white" strokeWidth="3"/>
              <path d="M198 204.5L230 230" stroke="#0F172A" strokeWidth="8"/>
              <path d="M230 190L270 150L225 105L175 155L205 185L230 190Z" fill="#22C55E"/>
            </svg>
          </div>
          <span className="ml-3 text-xl font-bold text-[#0F172A]">Passei Fácil</span>
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
                <Button variant="outline" size="sm" className="border-[#0F172A] text-[#0F172A] rounded-full">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-[#0096FF] hover:bg-blue-600 rounded-full">
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
