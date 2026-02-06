import React from 'react';
import { Professional, Review } from '../types';

interface ProfileViewProps {
  pro: Professional;
  onEdit?: () => void;
  onBack?: () => void;
  backLabel?: string;
  onConnect?: () => void;
  isClientViewing?: boolean;
  onApproveReview?: (reviewId: string) => void;
  onDiscardReview?: (reviewId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  pro, 
  onEdit, 
  onBack, 
  backLabel = "Back to Experts", 
  onConnect, 
  isClientViewing,
  onApproveReview,
  onDiscardReview
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Navigation */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-violet-700 transition-colors font-black uppercase text-[10px] tracking-[0.3em] group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          {backLabel}
        </button>
      )}

      {/* Pending Feedback Alert for Expert Owner */}
      {!isClientViewing && pro.pendingReviews && pro.pendingReviews.length > 0 && (
        <section className="bg-amber-50 p-8 md:p-10 rounded-[3.5rem] border border-amber-200 shadow-sm ring-8 ring-amber-50/50 animate-in zoom-in duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-amber-600 text-white p-3 rounded-2xl shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">New Platform Feedback</h3>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mt-2">Clients have submitted reviews for your recent work</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pro.pendingReviews.map(review => (
              <div key={review.id} className="bg-white rounded-[2rem] p-6 border border-amber-100 shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img src={review.reviewerAvatar} className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" alt={review.reviewerName} />
                    <div>
                      <p className="text-[10px] font-black text-slate-950 uppercase">{review.reviewerName}</p>
                      <div className="flex text-amber-500 text-[10px] mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 italic font-medium leading-relaxed mb-6">"{review.comment}"</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onApproveReview?.(review.id)}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all"
                  >
                    Approve & Publish
                  </button>
                  <button 
                    onClick={() => onDiscardReview?.(review.id)}
                    className="px-4 py-3 rounded-xl text-slate-500 font-black uppercase text-[10px] hover:bg-slate-100 transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Profile Hero Card */}
      <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_8px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200">
        <div className="h-44 bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-slate-950 to-slate-950"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-violet-700/10 rounded-full blur-[80px]"></div>
          
          {!isClientViewing && onEdit && (
            <button 
              onClick={onEdit} 
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all flex items-center gap-3 border border-white/20 shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Adjust Identity
            </button>
          )}
          {isClientViewing && onConnect && (
            <button 
              onClick={onConnect} 
              className="absolute top-6 right-6 bg-violet-700 text-white hover:bg-violet-800 px-8 py-3.5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 active:scale-95 border border-violet-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Initiate Signal
            </button>
          )}
        </div>
        <div className="px-12 pb-12 flex flex-col md:flex-row gap-10 items-start -mt-20 relative z-10">
          <div className="relative">
            <img src={pro.avatar} className="w-44 h-44 rounded-[2.5rem] object-cover border-[8px] border-white shadow-2xl" alt={pro.name} />
            <div className={`absolute -bottom-1 -right-1 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border-4 border-white ${pro.availability === 'Available Now' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
              {pro.availability}
            </div>
          </div>
          <div className="pt-24 flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-950 tracking-tighter leading-none uppercase">{pro.name}</h2>
                <div className="flex items-center gap-4 mt-3">
                  <p className="text-violet-700 font-black uppercase text-xs tracking-wider">{pro.specialty}</p>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{pro.location}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="text-4xl font-black text-slate-950 tracking-tighter">★ {pro.rating}</span>
                </div>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">{pro.reviewCount} Verified Testimonials</p>
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <span className="bg-slate-50 text-slate-800 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
                {pro.experience} Site Experience
              </span>
              <span className="bg-violet-50 text-violet-900 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-violet-200 shadow-sm">
                {pro.hourlyRate} Service Rate
              </span>
              <span className="bg-emerald-50 text-emerald-900 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                Neural-Linked
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Biography & Skills */}
          <section className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Expert Dossier</h3>
            <p className="text-slate-800 text-xl leading-relaxed font-medium mb-12 italic border-l-4 border-violet-100 pl-8">"{pro.bio}"</p>
            
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Operational Skillset</h3>
            <div className="flex flex-wrap gap-4">
              {pro.skills.map(skill => (
                <span key={skill} className="bg-slate-50 border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-violet-50 hover:border-violet-300 transition-all cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Verification Vault */}
          <section className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
             </div>
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Verification & Credentials</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pro.certificates && pro.certificates.length > 0 ? pro.certificates.map(cert => (
                  <div key={cert.id} className="flex gap-6 items-center bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 group hover:shadow-xl transition-all duration-500 hover:bg-white hover:border-violet-200">
                    {cert.mimeType?.startsWith('image/') || !cert.mimeType ? (
                      <img src={cert.imageUrl} className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg group-hover:scale-110 transition-transform" alt={cert.title} />
                    ) : (
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-slate-200 shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 00-2 2z" /></svg>
                      </div>
                    )}
                    <div className="overflow-hidden">
                       <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-tight mb-1 truncate">{cert.title}</h4>
                       <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest truncate">{cert.issuer}</p>
                       <p className="text-[9px] font-black text-slate-500 mt-1.5 uppercase tracking-tighter">Issue Date: {cert.date}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-16 text-center text-slate-400 font-black uppercase text-[11px] tracking-[0.3em] border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50">
                    Neural authentication pending
                  </div>
                )}
             </div>
          </section>

          {/* Portfolio */}
          <section className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Project Showcase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pro.portfolio.length > 0 ? pro.portfolio.map(item => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-[2.5rem] aspect-video border border-slate-100 shadow-md">
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end p-8">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white text-xs font-black uppercase tracking-widest mb-2">{item.title}</p>
                        <p className="text-white/70 text-[10px] font-bold leading-relaxed line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <h4 className="mt-5 font-black text-slate-950 uppercase text-[11px] tracking-widest group-hover:text-violet-700 transition-colors pl-2">{item.title}</h4>
                </div>
              )) : (
                <div className="col-span-2 py-24 text-center text-slate-400 font-black uppercase text-[11px] tracking-[0.3em] border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50">
                  Initial visual index loading
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Feedback Sidebar */}
        <div className="space-y-8">
          <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-200 sticky top-10">
            <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Testimonials</h3>
              <div className="w-11 h-11 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-700 shadow-inner">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
            </div>
            <div className="space-y-10">
              {pro.reviews.length > 0 ? pro.reviews.map(review => (
                <div key={review.id} className="border-b border-slate-100 pb-10 last:border-0 last:pb-0 animate-in fade-in duration-1000">
                  <div className="flex items-center gap-4 mb-5">
                    <img src={review.reviewerAvatar} className="w-10 h-10 rounded-2xl shadow-md border border-slate-100" alt={review.reviewerName} />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-950 uppercase tracking-tight">{review.reviewerName}</p>
                      <div className="flex text-amber-500 text-[10px] mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{review.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 italic font-bold leading-relaxed bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                    "{review.comment}"
                  </p>
                  
                  <div className="mt-6 grid grid-cols-3 gap-3 text-[9px] text-slate-500 font-black uppercase tracking-tighter">
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
                      <span className="block mb-1 text-slate-400">Craft</span>
                      <span className="text-violet-700 text-xs font-black">v{review.aspects.quality}.0</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
                      <span className="block mb-1 text-slate-400">Comms</span>
                      <span className="text-violet-700 text-xs font-black">v{review.aspects.communication}.0</span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
                      <span className="block mb-1 text-slate-400">Pace</span>
                      <span className="text-violet-700 text-xs font-black">v{review.aspects.timeliness}.0</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">No logs indexed</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};