
import React, { useState, useMemo } from 'react';
import { Professional } from '../types';
import { MOCK_PROS } from '../constants';
import { ProCard } from './ProCard';

interface LocalExpertsListProps {
  onCall: (pro: Professional) => void;
  onViewProfile: (pro: Professional) => void;
  userLocation: { country: string, city: string, region: string };
}

export const LocalExpertsList: React.FC<LocalExpertsListProps> = ({ onCall, onViewProfile, userLocation }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Plumbing', 'Electrical', 'Gardening', 'Carpentry', 'General', 'Design'];

  const filteredPros = useMemo(() => {
    return MOCK_PROS.filter(p => {
      // 1. Location Matching
      const proLoc = p.location.toLowerCase();
      const city = userLocation.city?.toLowerCase() || '';
      const region = userLocation.region?.toLowerCase() || '';
      const country = userLocation.country?.toLowerCase() || '';
      
      // Expert is considered local if their location string contains the client's city, region, or country
      const matchesLocation = 
        (city && proLoc.includes(city)) || 
        (region && proLoc.includes(region)) || 
        (country && proLoc.includes(country));

      // 2. Category Matching
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;

      return matchesLocation && matchesCategory;
    });
  }, [userLocation, activeCategory]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Local Build Experts</h2>
          <p className="text-slate-500 font-medium">
            Showing experts near <span className="text-indigo-600 font-bold">{userLocation.city}, {userLocation.region}</span>
          </p>
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

      {filteredPros.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPros.map(pro => (
            <ProCard key={pro.id} pro={pro} onCall={onCall} onView={() => onViewProfile(pro)} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
           </div>
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Scanning your sector...</h3>
           <p className="text-slate-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
             We couldn't find any {activeCategory !== 'All' ? activeCategory : ''} experts in <span className="font-bold text-slate-600">{userLocation.city}</span> yet.
           </p>
           <div className="mt-8 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 max-w-sm">
             <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">BuildSync Protocol</p>
             <p className="text-xs text-indigo-800 font-medium">Use the <span className="font-bold uppercase">Broadcast</span> feature to signal experts all over the world who can help you remotely.</p>
           </div>
        </div>
      )}
    </div>
  );
};
