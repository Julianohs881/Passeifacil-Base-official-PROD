
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Quiz } from "../types";

interface DeleteQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quiz: Quiz) => Promise<void>;
  quiz: Quiz | null;
}

const DeleteQuizDialog = ({ isOpen, onClose, onConfirm, quiz }: DeleteQuizDialogProps) => {
  const handleConfirm = async () => {
    if (!quiz) return;
    await onConfirm(quiz);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Quiz</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este quiz?
            <br />
            <span className="font-medium text-primary">{quiz?.title}</span>
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteQuizDialog;
