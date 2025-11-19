import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

interface ChoosePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

const ChoosePaymentModal: React.FC<ChoosePaymentModalProps> = ({ open, onOpenChange, userEmail }) => {
  const { createCheckoutSession, isLoading } = useStripeSubscription();

  const handleCard = async () => {
    await createCheckoutSession();
  };

  const handlePix = async () => {
    try {
      const res = await fetch('https://hrpchhrykumcdeolvtfs.supabase.co/functions/v1/create-pix-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await res.json();
      if (data && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Erro ao iniciar pagamento com Pix.');
      }
    } catch (e) {
      alert('Erro ao iniciar pagamento com Pix.');
    }
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
            <Button onClick={handlePix} variant="outline" className="w-full">Pagar com Pix</Button>
            <Button onClick={handleCard} className="w-full bg-violet-500 hover:bg-violet-600" disabled={isLoading}>
              {isLoading ? 'Processando...' : 'Pagar com Cartão de Crédito'}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChoosePaymentModal; 