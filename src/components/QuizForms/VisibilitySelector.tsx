import { Eye, EyeOff } from "lucide-react";
import { VisibilityOption } from "@/types";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

interface VisibilitySelectorProps {
  visibility: VisibilityOption;
  setVisibility: (visibility: VisibilityOption) => void;
}

export const VisibilitySelector: React.FC<VisibilitySelectorProps> = ({
  visibility,
  setVisibility,
}) => {
  const { isPro } = useAuth();

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right">Visibilidade</Label>
      <div className="col-span-3 flex space-x-4">
        <div 
          className={`flex items-center p-3 border rounded-lg cursor-pointer ${
            visibility === 'private' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => setVisibility('private')}
        >
          <EyeOff className="h-5 w-5 mr-2 text-gray-600" />
          <div>
            <p className="font-medium">Privado</p>
            <p className="text-xs text-gray-500">Somente você pode ver</p>
          </div>
        </div>
        
        <div 
          className={`flex items-center p-3 border rounded-lg ${
            visibility === 'public' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200'
          } ${
            !isPro() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
          }`}
          onClick={() => {
            if (isPro()) {
              setVisibility('public');
            } else {
              console.log("Funcionalidade de quiz público apenas para usuários PRO");
            }
          }}
        >
          <Eye className="h-5 w-5 mr-2 text-gray-600" />
          <div>
            <p className="font-medium">Público</p>
            <p className="text-xs text-gray-500">Visível para todos</p>
          </div>
        </div>
      </div>
    </div>
  );
};
