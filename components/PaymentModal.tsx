
import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Download, FileText, ShieldCheck, Receipt, ArrowLeft } from 'lucide-react';
import { Music, Purchase } from '../types';
import { generateMusicLicense } from '../services/geminiService';

interface PaymentModalProps {
  track: Music;
  onClose: () => void;
  onSuccess: (purchase: Purchase) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ track, onClose, onSuccess }) => {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [licenseText, setLicenseText] = useState('');
  const [receiptData, setReceiptData] = useState<string | null>(null);
  
  const entity = "00342";
  const reference = Math.floor(100000000 + Math.random() * 900000000).toString();

  const triggerDownload = () => {
    const link = document.createElement('a');
    link.href = track.audioUrl;
    link.download = `${track.title} - ${track.artist}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerReceiptDownload = (purchase: Purchase) => {
    const content = `
=========================================
      MUVUKA MUSIC - COMPROVATIVO
=========================================
ID DA TRANSAÇÃO: ${purchase.id}
DATA: ${purchase.date}
ENTIDADE: ${entity}
REFERÊNCIA: ${purchase.reference}
-----------------------------------------
ITEM: ${track.title}
ARTISTA: ${track.artist}
VALOR: ${purchase.amount.toLocaleString('pt-AO')} AOA
STATUS: PAGO COM SUCESSO
-----------------------------------------
Obrigado por apoiar a música angolana!
Muvuka Digital S.A.
=========================================
    `.trim();
    
    setReceiptData(content);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comprovativo_Muvuka_${purchase.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSimulatePayment = () => {
    setLoading(true);
    // Simulate payment processing time
    setTimeout(async () => {
      const purchase: Purchase = {
        id: `PUR-${Date.now()}`,
        musicId: track.id,
        date: new Date().toLocaleString('pt-AO'),
        amount: track.price,
        reference: reference,
        buyerName: "Cliente Muvuka",
        status: 'completed'
      };
      
      const license = await generateMusicLicense(track.title, track.artist, "Cliente Muvuka");
      setLicenseText(license || '');
      
      setLoading(false);
      setStep('success');
      onSuccess(purchase);
      
      // AFTER payment, generate everything automatically
      triggerDownload();
      triggerReceiptDownload(purchase);
    }, 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#121212] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
        
        {/* Header with Close Icon */}
        <div className="px-6 pt-6 flex justify-between items-center mb-2">
          {step === 'payment' ? (
             <button onClick={() => setStep('info')} className="text-gray-400 hover:text-white transition-colors">
               <ArrowLeft size={20} />
             </button>
          ) : (
            <div></div>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8">
          {step === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-4 text-white">Confirmar Compra</h2>
              <div className="flex gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                <img src={track.coverUrl} alt={track.title} className="w-20 h-20 object-cover rounded-xl shadow-lg" />
                <div className="flex flex-col justify-center overflow-hidden">
                  <h3 className="font-bold text-lg text-white truncate">{track.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  <p className="text-yellow-500 font-bold text-base mt-1">{track.price.toLocaleString('pt-AO')} AOA</p>
                </div>
              </div>
              <button 
                onClick={() => setStep('payment')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3.5 rounded-full font-black transition-all text-sm uppercase tracking-widest shadow-xl shadow-yellow-500/10 active:scale-95"
              >
                Gerar Referência
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-6">
                <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/5">
                  <Receipt className="text-yellow-500" size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">Dados de Pagamento</h2>
                <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-tighter">Pague via ATM ou Multicaixa Express</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex justify-between items-center group">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Entidade</p>
                    <p className="text-xl font-mono font-bold text-white">{entity}</p>
                  </div>
                  <button onClick={() => copyToClipboard(entity)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <Copy size={16} className="text-yellow-500" />
                  </button>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex justify-between items-center group">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Referência</p>
                    <p className="text-xl font-mono font-bold tracking-widest text-white">{reference}</p>
                  </div>
                  <button onClick={() => copyToClipboard(reference)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <Copy size={16} className="text-yellow-500" />
                  </button>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Total</p>
                    <p className="text-xl font-mono font-bold text-yellow-500">{track.price.toLocaleString('pt-AO')} AOA</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl mb-6 flex gap-3 items-center">
                <ShieldCheck size={18} className="text-blue-500 shrink-0" />
                <p className="text-[9px] text-blue-200/70 leading-tight">
                  Ambiente de Teste: Clique abaixo para confirmar o recebimento fictício do valor.
                </p>
              </div>

              <button 
                onClick={handleSimulatePayment}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-black py-3.5 rounded-full font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-xl shadow-green-500/10"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  "Confirmar Pagamento"
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center animate-in fade-in zoom-in duration-700">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle2 size={40} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Pago com Sucesso!</h2>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed px-4">
                O pagamento foi confirmado. O seu instrumental e o comprovativo foram gerados automaticamente.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                   <div className="bg-yellow-500/10 p-2 rounded-xl">
                      <Download size={18} className="text-yellow-500" />
                   </div>
                   <div className="text-left flex-1">
                      <p className="font-bold text-xs text-white">Audio HQ</p>
                      <p className="text-[9px] text-gray-500">MP3 (320kbps)</p>
                   </div>
                   <button onClick={triggerDownload} className="text-[9px] font-bold hover:text-yellow-500 text-gray-400">Re-baixar</button>
                </div>

                <button 
                  onClick={() => {
                    const blob = new Blob([licenseText], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Licenca_Muvuka_${track.title}.txt`;
                    a.click();
                  }}
                  className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all border border-white/5 group"
                >
                  <FileText size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-xs text-white">Baixar Licença Digital</p>
                    <p className="text-[9px] text-gray-500 uppercase">Uso Comercial (IA)</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={onClose}
                className="text-xs font-bold text-yellow-500 hover:text-white transition-all uppercase tracking-widest border border-yellow-500/20 px-6 py-2 rounded-full"
              >
                Concluído
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
