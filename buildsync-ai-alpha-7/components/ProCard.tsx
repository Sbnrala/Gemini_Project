import React from 'react';
import { Professional } from '../types';

interface ProCardProps {
  pro: Professional;
  onCall: (pro: Professional) => void;
  onView: () => void;
}

export const ProCard: React.FC<ProCardProps> = ({ pro, onCall, onView }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden group hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 hover:-translate-y-2">
      <div className="p-8">
        <div className="flex gap-6 items-start mb-8">
          <button onClick={onView} className="relative transition-transform hover:scale-110 active:scale-95 group/avatar">
            <img src={pro.avatar} alt={pro.name} className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-xl" />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${pro.availability === 'Available Now' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          </button>
          <div className="flex-1 overflow-hidden pt-1">
            <button onClick={onView} className="text-left block group/name truncate">
              <h3 className="text-lg font-black text-slate-950 leading-none group-hover/name:text-emerald-800 transition-colors uppercase tracking-tight">{pro.name}</h3>
              <p className="text-xs font-bold text-emerald-800 mt-2 tracking-widest uppercase opacity-70">{pro.specialty}</p>
            </button>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-500 text-sm">★ {pro.rating}</div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 border-l border-slate-200">{pro.reviewCount} Reviews</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-rose-50 p-4 rounded-3xl text-center border border-rose-100 shadow-sm">
            <p className="text-[8px] text-rose-900 font-black uppercase tracking-widest opacity-60 mb-1">Experience</p>
            <p className="text-xs font-black text-rose-950">{pro.experience}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-3xl text-center border border-emerald-100 shadow-sm">
            <p className="text-[8px] text-emerald-900 font-black uppercase tracking-widest opacity-60 mb-1">Base Rate</p>
            <p className="text-xs font-black text-emerald-950">{pro.hourlyRate}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 h-12 overflow-hidden">
          {pro.skills.slice(0, 3).map(skill => (
            <span key={skill} className="bg-white/50 text-slate-900 px-4 py-2 rounded-2xl text-[9px] font-black uppercase border border-slate-100 tracking-tight shadow-sm">
              {skill}
            </span>
          ))}
        </div>

        <button 
          onClick={() => onCall(pro)}
          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          Initialize Signal
        </button>
      </div>
    </div>
  );
};