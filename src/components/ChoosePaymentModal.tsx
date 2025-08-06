import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { useMercadoPagoPix } from '@/hooks/useMercadoPagoPix';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, CheckCircle, XCircle } from 'lucide-react';
import QRCode from 'qrcode.react';

interface ChoosePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

const ChoosePaymentModal: React.FC<ChoosePaymentModalProps> = ({ open, onOpenChange, userEmail }) => {
  const { createCheckoutSession, isLoading } = useStripeSubscription();
  const { createPixPayment, loading: pixLoading, error: pixError } = useMercadoPagoPix();
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();

  const [paymentData, setPaymentData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'failed'>('pending');

  const handleCard = async () => {
    await createCheckoutSession();
  };

  const handlePix = async () => {
    const data = await createPixPayment();
    if (data) {
      setPaymentData(data);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!paymentData?.qr_code_base64) return;
    
    const link = document.createElement('a');
    link.download = 'pix-qrcode.png';
    link.href = `data:image/png;base64,${paymentData.qr_code_base64}`;
    link.click();
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.payment_id) return;

    try {
      // Verificar status no MercadoPago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentData.payment_id}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN}`
        }
      });
      
      const payment = await response.json();
      
      if (payment.status === 'approved') {
        setPaymentStatus('approved');
        
        // Aguardar um pouco para o webhook processar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Força a atualização do perfil imediatamente após pagamento aprovado
        await updateUserProfile(true);
        
        toast({
          title: "Pagamento aprovado!",
          description: "Seu plano Premium foi ativado com sucesso!",
        });
        setTimeout(() => onOpenChange(false), 2000);
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  const handleBack = () => {
    setPaymentData(null);
    setPaymentStatus('pending');
    setCopied(false);
  };

  const handleClose = () => {
    setPaymentData(null);
    setPaymentStatus('pending');
    setCopied(false);
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
            {!paymentData && (
              <>
                <Button onClick={handlePix} variant="outline" className="w-full" disabled={pixLoading}>
                  {pixLoading ? 'Gerando PIX...' : 'Pagar com Pix'}
                </Button>
                <Button onClick={handleCard} className="w-full bg-violet-500 hover:bg-violet-600" disabled={isLoading}>
                  {isLoading ? 'Processando...' : 'Pagar com Cartão de Crédito'}
                </Button>
              </>
            )}
          </div>
          
          {pixError && <p className="text-red-500 mt-2">{pixError}</p>}
          
          {paymentData && (
            <div className="flex flex-col items-center mt-6 gap-2">
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR Code ou copie o código PIX para pagar R$ 14,90
              </p>
              
              <div className="bg-white p-4 rounded-lg border inline-block mb-4">
                <QRCode value={paymentData.qr_code} size={180} />
              </div>

              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="text-sm font-medium">Código PIX:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentData.qr_code)}
                    className="ml-2"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQRCode}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR Code
                </Button>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                >
                  Voltar
                </Button>
                <Button
                  onClick={checkPaymentStatus}
                  className="flex-1"
                  variant="outline"
                >
                  Verificar Pagamento
                </Button>
              </div>

              {paymentStatus === 'approved' && (
                <div className="text-center py-4 bg-green-50 rounded-lg w-full">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Pagamento aprovado!</p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="text-center py-4 bg-red-50 rounded-lg w-full">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">Pagamento não aprovado</p>
                </div>
              )}

              <p className="text-xs text-center mt-2 text-gray-600">
                Escaneie o QR Code acima com seu app de banco ou copie o código para pagar via PIX.<br/>
                Após o pagamento, clique em "Verificar Pagamento" para confirmar.<br/>
                <b>Não feche esta janela até a confirmação!</b>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChoosePaymentModal; 