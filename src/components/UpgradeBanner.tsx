
import React from "react";
import { Crown } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

interface UpgradeBannerProps {
  onUpgradeClick: () => void;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ onUpgradeClick }) => {
  const { isPro } = useAuth();
  
  // Don't show banner for PRO users
  if (isPro()) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center mb-3 sm:mb-0">
        <Crown className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
        <p className="text-sm text-gray-700">
          No plano gratuito? Libere IA, explorar, importar/exportar e muito mais com o PRO!
        </p>
      </div>
      <Button 
        onClick={onUpgradeClick}
        size="sm"
        className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 whitespace-nowrap"
      >
        Fazer Upgrade
      </Button>
    </div>
  );
};

export default UpgradeBanner;
