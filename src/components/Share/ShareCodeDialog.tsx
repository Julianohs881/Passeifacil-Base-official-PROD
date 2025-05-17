
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-mobile";

interface ShareCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  code: string | null;
  type: "quiz" | "question";
}

export function ShareCodeDialog({
  isOpen,
  onClose,
  title,
  code,
  type,
}: ShareCodeDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para a área de transferência.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Mobile users - show a sheet instead of dialog
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Compartilhar {type === "quiz" ? "Quiz" : "Questão"}</SheetTitle>
            <SheetDescription>
              Compartilhe este código com outros usuários para que eles possam importar 
              {type === "quiz" ? " este quiz" : " esta questão"}.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 py-8">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex flex-col space-y-2">
              <Input
                id="share-code-mobile"
                value={code || ""}
                readOnly
                className="font-mono text-center text-lg"
              />
              <Button 
                type="button" 
                onClick={handleCopy} 
                variant="outline"
                className="w-full"
              >
                {copied ? 
                  <Check className="h-4 w-4 mr-2 text-green-600" /> : 
                  <Copy className="h-4 w-4 mr-2" />
                }
                {copied ? "Copiado!" : "Copiar código"}
              </Button>
            </div>
          </div>

          <SheetFooter className="flex justify-center pt-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop users - show dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar {type === "quiz" ? "Quiz" : "Questão"}</DialogTitle>
          <DialogDescription>
            Compartilhe este código com outros usuários para que eles possam importar 
            {type === "quiz" ? " este quiz" : " esta questão"}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="share-code"
                value={code || ""}
                readOnly
                className="font-mono text-center text-lg"
              />
            </div>
            <Button 
              type="button" 
              size="icon" 
              onClick={handleCopy} 
              variant="outline"
              className={copied ? "bg-green-50" : ""}
            >
              {copied ? 
                <Check className="h-4 w-4 text-green-600" /> : 
                <Copy className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
