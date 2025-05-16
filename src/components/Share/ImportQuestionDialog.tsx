
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportCodeForm } from "./ImportCodeForm";
import { useImportQuestionCode } from "@/hooks/useImportQuestionCode";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[90%] w-full">
        <DialogHeader>
          <DialogTitle>Importar questão por código</DialogTitle>
          <DialogDescription>
            Insira um código de compartilhamento de questão (formato P1234567) para adicioná-la ao quiz atual.
          </DialogDescription>
        </DialogHeader>
        <ImportCodeForm onImport={handleImport} loading={loading} />
      </DialogContent>
    </Dialog>
  );
}
