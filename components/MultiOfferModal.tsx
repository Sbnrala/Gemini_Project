
import React, { useState } from 'react';
import { Professional, BroadcastRequest } from '../types';

interface MultiOfferModalProps {
  broadcast: BroadcastRequest;
  pros: Professional[];
  onClose: () => void;
  onApprove: (req: BroadcastRequest, expert: Professional) => void;
}

export const MultiOfferModal: React.FC<MultiOfferModalProps> = ({ broadcast, pros, onClose, onApprove }) => {
  const [selectedPro, setSelectedPro] = useState<Professional | null>(pros[0] || null);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in duration-300 flex h-[85vh]">
        
        {/* Left Sidebar: List of Offers */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
            <div className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-800">Expert Offers</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{pros.length} Builders Responded</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {pros.map(pro => (
                    <button 
                        key={pro.id}
                        onClick={() => setSelectedPro(pro)}
                        className={`w-full p-4 rounded-3xl text-left transition-all flex items-center gap-4 ${selectedPro?.id === pro.id ? 'bg-white shadow-lg ring-1 ring-emerald-100' : 'hover:bg-white/60'}`}
                    >
                        <img src={pro.avatar} className="w-12 h-12 rounded-2xl object-cover" alt={pro.name} />
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{pro.name}</h4>
                            <p className="text-[10px] text-emerald-600 font-black uppercase truncate">{pro.specialty}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-amber-400 text-xs">★</span>
                                <span className="text-[10px] font-bold text-slate-500">{pro.rating}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="p-6">
                <button onClick={onClose} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-all">Close</button>
            </div>
        </div>

        {/* Right Area: Selected Pro Detail */}
        <div className="flex-1 flex flex-col bg-white">
            {selectedPro ? (
                <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
                    <div className="bg-emerald-600 p-10 text-white flex justify-between items-end">
                        <div className="flex gap-6 items-center">
                            <img src={selectedPro.avatar} className="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-xl object-cover" alt={selectedPro.name} />
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">{selectedPro.name}</h2>
                                <p className="text-emerald-100 font-bold">{selectedPro.specialty} • {selectedPro.experience} Exp</p>
                                <div className="flex gap-2 mt-4">
                                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPro.hourlyRate}</span>
                                    <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPro.availability}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onApprove(broadcast, selectedPro)}
                            className="bg-white text-emerald-600 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-emerald-50 transition-all transform hover:scale-105 active:scale-95"
                        >
                            Select this Builder
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 space-y-12">
                        <section>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Builder Biography</h4>
                            <p className="text-slate-600 leading-relaxed font-medium">{selectedPro.bio}</p>
                        </section>

                        <section>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Portfolio Showcase</h4>
                            <div className="grid grid-cols-2 gap-6">
                                {selectedPro.portfolio.map(item => (
                                    <div key={item.id} className="group cursor-pointer">
                                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-100">
                                            <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={item.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end">
                                                <p className="text-white text-sm font-bold">{item.title}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {selectedPro.portfolio.length === 0 && (
                                    <div className="col-span-2 py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase text-[10px]">No portfolio items shared</div>
                                )}
                            </div>
                        </section>

                        <section className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Signal Relevance
                            </h4>
                            <p className="text-indigo-800 text-sm font-medium leading-relaxed italic">
                                "{selectedPro.name} is a high-match for your '{broadcast.category}' signal based on their expertise in {selectedPro.skills.slice(0, 3).join(', ')}."
                            </p>
                        </section>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <p className="font-black uppercase text-[10px] tracking-widest">Select an expert to view their offer</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
