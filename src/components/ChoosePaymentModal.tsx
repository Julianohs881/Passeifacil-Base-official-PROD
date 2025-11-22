import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { PixPaymentModal } from './PixPaymentModal';

interface ChoosePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

const ChoosePaymentModal: React.FC<ChoosePaymentModalProps> = ({ open, onOpenChange, userEmail }) => {
  const { createCheckoutSession, isLoading } = useStripeSubscription();
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  const handleCard = async () => {
    await createCheckoutSession();
  };

  const handlePix = () => {
    // Fecha o modal de escolha e abre o modal de Pix
    onOpenChange(false);
    setIsPixModalOpen(true);
  };

  const handlePixModalClose = () => {
    setIsPixModalOpen(false);
  };

  const handlePixSuccess = () => {
    // Quando o pagamento Pix for aprovado, fecha o modal
    setIsPixModalOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Escolha a forma de pagamento</DialogTitle>
          <DialogDescription>
            Selecione como deseja pagar sua assinatura PRO:
          </DialogDescription>
          <div className="flex flex-col gap-4 mt-4">
            <Button 
              onClick={handlePix} 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              Pagar com Pix
            </Button>
            <Button 
              onClick={handleCard} 
              className="w-full bg-violet-500 hover:bg-violet-600" 
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Pagar com Cartão de Crédito'}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PixPaymentModal 
        isOpen={isPixModalOpen} 
        onClose={handlePixModalClose}
        onSuccess={handlePixSuccess}
      />
    </>
  );
};

export default ChoosePaymentModal; 