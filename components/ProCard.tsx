
import React from 'react';
import { Professional } from '../types';

interface ProCardProps {
  pro: Professional;
  onCall: (pro: Professional) => void;
}

export const ProCard: React.FC<ProCardProps> = ({ pro, onCall }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex gap-4 items-start mb-6">
          <div className="relative">
            <img src={pro.avatar} alt={pro.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100" />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${pro.availability === 'Available Now' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          </div>
          <div className="flex-1">
            <h3 className="font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{pro.name}</h3>
            <p className="text-xs font-bold text-indigo-600 mt-0.5">{pro.specialty}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400 text-[10px]">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.floor(pro.rating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pro.rating} ({pro.reviewCount})</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-slate-50 p-2 rounded-xl text-center">
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Exp.</p>
            <p className="text-[11px] font-bold text-slate-700">{pro.experience}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl text-center">
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Rate</p>
            <p className="text-[11px] font-bold text-slate-700">{pro.hourlyRate}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6 h-14 overflow-hidden">
          {pro.skills.slice(0, 3).map(skill => (
            <span key={skill} className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase border border-slate-100">
              {skill}
            </span>
          ))}
          {pro.skills.length > 3 && (
             <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase border border-slate-100">
               +{pro.skills.length - 3} More
             </span>
          )}
        </div>

        <button 
          onClick={() => onCall(pro)}
          className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 group-hover:shadow-indigo-100 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          Connect Now
        </button>
      </div>
    </div>
  );
};
