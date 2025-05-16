
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportCodeForm } from "./ImportCodeForm";
import { useImportCode } from "@/hooks/useImportCode";

interface ImportCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportCodeDialog({
  isOpen,
  onClose,
  onSuccess,
}: ImportCodeDialogProps) {
  const { loading, handleImport } = useImportCode(onClose, onSuccess);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar por código</DialogTitle>
          <DialogDescription>
            Insira um código de compartilhamento para importar um quiz ou questão.
          </DialogDescription>
        </DialogHeader>
        <ImportCodeForm onImport={handleImport} loading={loading} />
      </DialogContent>
    </Dialog>
  );
}
