
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ProfileIncompleteAlert() {
  const { userProfile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    // Check if profile is incomplete (missing name or avatar)
    if (userProfile && (!userProfile.name || !userProfile.avatar_url)) {
      // Check if the alert has been dismissed recently
      const dismissedUntil = localStorage.getItem("profileAlertDismissedUntil");
      if (!dismissedUntil || new Date(dismissedUntil) < new Date()) {
        setShouldShow(true);
      }
    } else {
      setShouldShow(false);
    }
  }, [userProfile]);
  
  const handleDismiss = () => {
    setDismissed(true);
    setShouldShow(false);
    
    // Dismiss for 3 days
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 3);
    localStorage.setItem("profileAlertDismissedUntil", dismissUntil.toISOString());
  };
  
  if (!shouldShow || dismissed) {
    return null;
  }
  
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <div className="flex-1">
        <AlertTitle className="text-blue-800">Complete seu perfil!</AlertTitle>
        <AlertDescription className="text-blue-700">
          {!userProfile?.name && !userProfile?.avatar_url ? (
            "Adicione seu nome e foto de perfil para uma melhor experiência."
          ) : !userProfile?.name ? (
            "Adicione seu nome para uma melhor experiência."
          ) : (
            "Adicione sua foto de perfil para uma melhor experiência."
          )}
        </AlertDescription>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Link to="/profile">
            Completar perfil
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Lembrar depois
        </Button>
      </div>
    </Alert>
  );
}

export default ProfileIncompleteAlert;
