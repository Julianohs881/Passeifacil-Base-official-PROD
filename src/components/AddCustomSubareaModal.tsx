import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/utils/supabase';
import { useInterestAreas } from '@/hooks/useInterestAreas';

interface AddCustomSubareaModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentAreaId: string;
  parentAreaName: string;
  onSubareaAdded?: (subarea: any) => void;
}

export const AddCustomSubareaModal: React.FC<AddCustomSubareaModalProps> = ({
  isOpen,
  onClose,
  parentAreaId,
  parentAreaName,
  onSubareaAdded
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createCustomSubarea } = useInterestAreas();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      // Criar nova temática usando o hook
      const data = await createCustomSubarea(parentAreaId, name, description);

      // Chamar callback se fornecido
      if (onSubareaAdded) {
        onSubareaAdded(data);
      }

      // Limpar formulário e fechar modal
      setName('');
      setDescription('');
      onClose();

    } catch (err) {
      console.error('Erro ao criar temática:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar temática');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Adicionar Temática
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent-area" className="text-sm font-medium text-gray-700">
              Área Principal
            </Label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
              {parentAreaName}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome da Temática *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nutrição Funcional"
              maxLength={100}
              className="w-full"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              {name.length}/100 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente esta temática..."
              rows={3}
              maxLength={500}
              className="w-full resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              {description.length}/500 caracteres
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Temática
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
