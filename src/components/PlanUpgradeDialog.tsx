
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
import { Check, Crown, X } from "lucide-react";

interface PlanUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlanUpgradeDialog: React.FC<PlanUpgradeDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg glassmorphism">
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

        {/* Comparison Table */}
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left border-b">Função</th>
                <th className="p-3 text-center border-b">Gratuito</th>
                <th className="p-3 text-center border-b">PRO</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3">Criar quiz manualmente</td>
                <td className="p-3 text-center">
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                </td>
                <td className="p-3 text-center">
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3">Criar questões com IA</td>
                <td className="p-3 text-center">
                  <X className="h-5 w-5 mx-auto text-red-500" />
                </td>
                <td className="p-3 text-center flex justify-center items-center">
                  <Check className="h-5 w-5 text-green-500 mr-1" />
                  <span>(50)</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3">Explorar quizzes públicos</td>
                <td className="p-3 text-center">
                  <X className="h-5 w-5 mx-auto text-red-500" />
                </td>
                <td className="p-3 text-center">
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3">Compartilhar/importar/exportar</td>
                <td className="p-3 text-center">
                  <X className="h-5 w-5 mx-auto text-red-500" />
                </td>
                <td className="p-3 text-center">
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3">Suporte prioritário</td>
                <td className="p-3 text-center">
                  <X className="h-5 w-5 mx-auto text-red-500" />
                </td>
                <td className="p-3 text-center">
                  <Check className="h-5 w-5 mx-auto text-green-500" />
                </td>
              </tr>
            </tbody>
          </table>
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
