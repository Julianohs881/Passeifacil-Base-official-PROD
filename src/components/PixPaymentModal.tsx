import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMercadoPagoPix } from "@/hooks/useMercadoPagoPix";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, CheckCircle, XCircle } from "lucide-react";
import QRCode from "qrcode.react";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PixPaymentModal = ({ isOpen, onClose, onSuccess }: PixPaymentModalProps) => {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'failed'>('pending');
  
  const { createPixPayment, loading, error } = useMercadoPagoPix();
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !paymentData) {
      handleCreatePayment();
    }
  }, [isOpen]);

  const handleCreatePayment = async () => {
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
        onSuccess?.();
        setTimeout(() => onClose(), 2000);
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setPaymentStatus('pending');
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento PIX - Plano Premium</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p>Criando pagamento PIX...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleCreatePayment} variant="outline">
                Tentar novamente
              </Button>
            </div>
          )}

          {paymentData && !loading && (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Escaneie o QR Code ou copie o código PIX para pagar R$ 14,90
                </p>
                
                <div className="bg-white p-4 rounded-lg border inline-block mb-4">
                  <QRCode value={paymentData.qr_code} size={200} />
                </div>

                <div className="space-y-2">
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
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={checkPaymentStatus}
                  className="flex-1"
                  variant="outline"
                >
                  Verificar Pagamento
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>

              {paymentStatus === 'approved' && (
                <div className="text-center py-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Pagamento aprovado!</p>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="text-center py-4 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">Pagamento não aprovado</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 