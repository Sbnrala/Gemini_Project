
import React from 'react';
import { Professional, BroadcastRequest } from '../types';

interface ConnectionApprovalModalProps {
  expert: Professional;
  request: BroadcastRequest;
  onApprove: (req: BroadcastRequest, expert: Professional) => void;
  onDecline: (req: BroadcastRequest) => void;
}

export const ConnectionApprovalModal: React.FC<ConnectionApprovalModalProps> = ({ expert, request, onApprove, onDecline }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-emerald-600 p-8 text-white relative">
          <div className="flex items-center gap-6">
            <img src={expert.avatar} className="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-xl object-cover" alt={expert.name} />
            <div>
              <div className="bg-white/20 px-3 py-1 rounded-full inline-block text-[9px] font-black uppercase tracking-widest mb-2">Expert Offer Received</div>
              <h3 className="text-3xl font-black tracking-tight">{expert.name}</h3>
              <p className="text-emerald-100 font-bold">{expert.specialty} • {expert.experience} Experience</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Builder Profile</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 text-lg">★</span>
                  <span className="font-bold text-slate-700">{expert.rating} ({expert.reviewCount} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expert.skills.slice(0, 3).map(s => (
                    <span key={s} className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-bold text-slate-500 uppercase">{s}</span>
                  ))}
                </div>
              </div>
              <p className="mt-6 text-sm text-slate-500 leading-relaxed italic line-clamp-3">
                "{expert.bio}"
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recent Work</h4>
              <div className="grid grid-cols-2 gap-2">
                {expert.portfolio.slice(0, 2).map(item => (
                  <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h5 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest">BuildSync AI Protocol</h5>
            </div>
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">Accepting this offer opens a direct chat. You can then discuss project specifics before choosing to initiate a live audio or video support session.</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => onDecline(request)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
            >
              Pass for now
            </button>
            <button 
              onClick={() => onApprove(request, expert)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 transition-all"
            >
              Start Discussion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
