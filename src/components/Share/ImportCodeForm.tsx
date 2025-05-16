
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ImportCodeFormProps {
  onImport: (code: string) => Promise<void>;
  loading: boolean;
}

export function ImportCodeForm({ onImport, loading }: ImportCodeFormProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onImport(code);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <div className="grid flex-1 gap-2">
          <Input
            id="import-code"
            placeholder="Digite o código (ex: Q1234567 ou P1234567)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-center text-lg"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-2">
        <Button type="button" variant="outline" disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!code.trim() || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            "Importar"
          )}
        </Button>
      </div>
    </form>
  );
}
