
import React, { useState } from 'react';
import { Professional } from '../types';
import { MOCK_PROS } from '../constants';
import { ProCard } from './ProCard';

export const LocalExpertsList: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Plumbing', 'Electrical', 'Gardening', 'Carpentry', 'General', 'Design'];

  const filteredPros = activeCategory === 'All' 
    ? MOCK_PROS 
    : MOCK_PROS.filter(p => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Local Build Experts</h2>
          <p className="text-slate-500 font-medium">Verified professionals available in your area.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPros.map(pro => (
          <ProCard key={pro.id} pro={pro} onCall={() => {}} />
        ))}
      </div>
    </div>
  );
};
