
import React from 'react';
import { Professional, Review } from '../types';

interface ProfileViewProps {
  pro: Professional;
  onEdit: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ pro, onEdit }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Hero Header */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <div className="h-32 bg-indigo-600 relative">
          <button 
            onClick={onEdit} 
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Profile
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 items-start -mt-12 relative z-10">
          <img src={pro.avatar} className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl" alt={pro.name} />
          <div className="pt-12 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-slate-800">{pro.name}</h2>
                <p className="text-indigo-600 font-bold flex items-center gap-2">
                  {pro.specialty}
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                  <span className="text-slate-500">{pro.location}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-2xl font-black text-slate-800">★ {pro.rating}</span>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase">{pro.reviewCount} Reviews</p>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${pro.availability === 'Available Now' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {pro.availability}
              </span>
              <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold">
                {pro.experience} Experience
              </span>
              <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold">
                {pro.hourlyRate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">About Me</h3>
            <p className="text-slate-600 leading-relaxed">{pro.bio}</p>
            
            <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">Core Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {pro.skills.map(skill => (
                <span key={skill} className="bg-slate-50 border border-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Projects Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pro.portfolio.length > 0 ? pro.portfolio.map(item => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={item.imageUrl} className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-500" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-bold">{item.title}</p>
                    </div>
                  </div>
                  <h4 className="mt-3 font-bold text-slate-800">{item.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                </div>
              )) : (
                <div className="col-span-2 py-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
                  No portfolio items added yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Client Reviews</h3>
            </div>
            <div className="space-y-6">
              {pro.reviews.length > 0 ? pro.reviews.map(review => (
                <div key={review.id} className="border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={review.reviewerAvatar} className="w-8 h-8 rounded-full" alt={review.reviewerName} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{review.reviewerName}</p>
                      <div className="flex text-amber-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase">{review.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
                  
                  <div className="mt-4 grid grid-cols-3 gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    <div className="flex flex-col">
                      <span>Quality</span>
                      <span className="text-indigo-500">{review.aspects.quality}/5</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Comm.</span>
                      <span className="text-indigo-500">{review.aspects.communication}/5</span>
                    </div>
                    <div className="flex flex-col">
                      <span>Time</span>
                      <span className="text-indigo-500">{review.aspects.timeliness}/5</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 italic">No reviews yet.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
