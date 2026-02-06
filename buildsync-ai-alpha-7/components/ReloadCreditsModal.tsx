import React, { useState } from 'react';
import { SavedCard } from '../types';

interface ReloadCreditsModalProps {
  onClose: () => void;
  onSuccess: (credits: number, cost: number) => void;
  savedCards: SavedCard[];
}

export const ReloadCreditsModal: React.FC<ReloadCreditsModalProps> = ({ onClose, onSuccess, savedCards }) => {
  const [amount, setAmount] = useState<number>(50);
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [selectedCardId, setSelectedCardId] = useState<string>(savedCards[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const cost = amount * 0.5; // $1 = 2 credits -> $0.50 per credit

  const handleProceed = () => {
    if (step === 'amount') setStep('payment');
    else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(amount, cost);
      }, 1500);
    }
  };

  const selectedCard = savedCards.find(c => c.id === selectedCardId);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
        <header className="bg-amber-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-700 opacity-90"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10 p-2 hover:bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="relative z-10 flex items-center gap-5 mb-3">
            <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-md">
              <span className="text-3xl">🪙</span>
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Hub Credits</h3>
              <p className="text-amber-100 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-90">Protocol Reload v15.4</p>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-10 bg-white">
          {step === 'amount' ? (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 text-center">Select BuildSync Units</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[50, 100, 250, 500].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setAmount(val)}
                      className={`py-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-1.5 ${amount === val ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-lg shadow-amber-100 scale-105' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                    >
                      <span className="text-2xl font-black tracking-tighter">{val}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Units</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-inner relative overflow-hidden group">
                 <div className="absolute inset-y-0 left-0 w-1 bg-amber-500 group-hover:w-2 transition-all"></div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Calculated Cost</p>
                    <p className="text-4xl font-black text-slate-950 tracking-tighter">${cost.toFixed(2)} <span className="text-sm text-slate-400 uppercase font-black ml-1">USD</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Yield</p>
                    <p className="text-xl font-black text-violet-700 tracking-tight">+{amount} <span className="text-xs">Credits</span></p>
                 </div>
              </div>
              
              <div className="bg-violet-50/50 p-4 rounded-2xl flex gap-3 items-center border border-violet-100/50">
                 <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <p className="text-[10px] font-bold text-violet-800 leading-tight">Rate: $1.00 USD yields 2 Neural Hub Credits. Credits are used for AI Supervision and live expert calls.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 text-center">Authorization Protocol</h4>
                  <div className="space-y-3">
                    {savedCards.map(card => (
                      <button 
                        key={card.id}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${selectedCardId === card.id ? 'border-violet-700 bg-violet-50/50 shadow-lg' : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                      >
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[9px] font-black uppercase text-slate-700 shadow-sm">{card.brand}</div>
                           <div className="text-left overflow-hidden">
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{card.nickname || 'Authenticated Source'}</p>
                              <p className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">•••• •••• •••• {card.last4}</p>
                           </div>
                        </div>
                        {selectedCardId === card.id && (
                          <div className="w-6 h-6 bg-violet-700 rounded-full flex items-center justify-center shadow-lg shadow-violet-200 animate-in zoom-in">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-transparent"></div>
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-300">Transaction Profile</p>
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Encrypted</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-4xl font-black tracking-tighter leading-none">${cost.toFixed(2)}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">To be charged to Card</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-amber-500 tracking-tight leading-none">{amount}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Final Neural Yield</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

          <div className="flex gap-4">
            {step === 'payment' && (
              <button onClick={() => setStep('amount')} className="px-8 py-5 rounded-3xl text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">Back</button>
            )}
            <button 
              onClick={handleProceed}
              disabled={isProcessing || !amount || (step === 'payment' && !selectedCardId)}
              className="flex-1 bg-violet-700 hover:bg-violet-800 disabled:bg-slate-300 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-violet-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Verifying Link...
                </>
              ) : step === 'amount' ? 'Review & Initialize' : `Approve Transaction • $${cost.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};