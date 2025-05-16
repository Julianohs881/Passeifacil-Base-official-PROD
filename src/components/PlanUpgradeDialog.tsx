
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Check, Crown } from "lucide-react";

interface PlanUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlanUpgradeDialog: React.FC<PlanUpgradeDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glassmorphism">
        <DialogHeader>
          <DialogTitle className="text-center flex flex-col items-center">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-3 rounded-full mb-2">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <span>Upgrade para Plano PRO</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Desfrute de todas as funcionalidades premium do Passei Fácil.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Plano Gratuito</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">Criar quizzes e questões manualmente</span>
              </li>
              <li className="flex items-start opacity-50">
                <span className="h-4 w-4 mr-2 mt-1 flex-shrink-0">✗</span>
                <span className="text-sm">Criar questões com IA</span>
              </li>
              <li className="flex items-start opacity-50">
                <span className="h-4 w-4 mr-2 mt-1 flex-shrink-0">✗</span>
                <span className="text-sm">Explorar quizzes públicos</span>
              </li>
              <li className="flex items-start opacity-50">
                <span className="h-4 w-4 mr-2 mt-1 flex-shrink-0">✗</span>
                <span className="text-sm">Compartilhar quizzes/questões</span>
              </li>
              <li className="flex items-start opacity-50">
                <span className="h-4 w-4 mr-2 mt-1 flex-shrink-0">✗</span>
                <span className="text-sm">Importar/exportar conteúdo</span>
              </li>
            </ul>
          </div>
          <div className="border border-amber-300 rounded-lg p-4 bg-amber-50">
            <h3 className="font-medium flex items-center mb-3">
              Plano PRO
              <Crown className="h-4 w-4 ml-2 text-amber-500" />
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">Criar quizzes e questões manualmente</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">Criar até 50 questões com IA</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">Explorar quizzes públicos</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">Compartilhar quizzes/questões</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">Importar/exportar conteúdo</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 sm:w-full"
          >
            <Crown className="h-4 w-4 mr-2" />
            Fazer Upgrade para PRO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeDialog;
