
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportCodeForm } from "./ImportCodeForm";
import { useImportQuestionCode } from "@/hooks/useImportQuestionCode";
import PremiumFeatureGate from "../PremiumFeatureGate";
import { useAuth } from "@/context/AuthContext";

interface ImportQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  onSuccess?: () => void;
}

export function ImportQuestionDialog({
  isOpen,
  onClose,
  quizId,
  onSuccess,
}: ImportQuestionDialogProps) {
  const { loading, handleImport } = useImportQuestionCode(quizId, onClose, onSuccess);
  const { isPro } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[90%] w-full bg-white border-0 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-800">Importar questão por código</DialogTitle>
          <DialogDescription className="text-gray-600">
            Insira um código de compartilhamento de questão (formato P1234567) para adicioná-la ao quiz atual.
          </DialogDescription>
        </DialogHeader>
        
        {isPro() ? (
          <ImportCodeForm onImport={handleImport} loading={loading} />
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <PremiumFeatureGate feature="import" className="w-full">
              <ImportCodeForm onImport={handleImport} loading={loading} />
            </PremiumFeatureGate>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
