
import React, { useState, useRef } from 'react';
import { Professional, PortfolioItem, Review, Certificate } from '../types';

interface ProfileEditViewProps {
  pro: Professional;
  onSave: (updatedPro: Professional) => void;
  onCancel: () => void;
}

export const ProfileEditView: React.FC<ProfileEditViewProps> = ({ pro, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Professional>({ 
    ...pro, 
    certificates: pro.certificates || [],
    pendingReviews: pro.pendingReviews || []
  });
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: '', description: '', imageUrl: '' });
  const [newReview, setNewReview] = useState({ reviewerName: '', comment: '', rating: 5 });
  const [newCert, setNewCert] = useState({ title: '', issuer: '', date: '', imageUrl: '', mimeType: '' });
  
  const portfolioFileRef = useRef<HTMLInputElement>(null);
  const certFileRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(s => s.trim());
    setFormData(prev => ({ ...prev, skills }));
  };

  const handlePortfolioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPortfolioItem(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCert(prev => ({ 
          ...prev, 
          imageUrl: reader.result as string,
          mimeType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addPortfolioItem = () => {
    if (!newPortfolioItem.title || !newPortfolioItem.imageUrl) return;
    const item: PortfolioItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newPortfolioItem
    };
    setFormData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, item]
    }));
    setNewPortfolioItem({ title: '', description: '', imageUrl: '' });
  };

  const removePortfolioItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(item => item.id !== id)
    }));
  };

  const addCertificate = () => {
    if (!newCert.title || !newCert.imageUrl) return;
    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      title: newCert.title,
      issuer: newCert.issuer,
      date: newCert.date,
      imageUrl: newCert.imageUrl,
      mimeType: newCert.mimeType
    };
    setFormData(prev => ({
      ...prev,
      certificates: [...(prev.certificates || []), cert]
    }));
    setNewCert({ title: '', issuer: '', date: '', imageUrl: '', mimeType: '' });
  };

  const removeCertificate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: (prev.certificates || []).filter(c => c.id !== id)
    }));
  };

  const addReview = () => {
    if (!newReview.reviewerName || !newReview.comment) return;
    const review: Review = {
      id: `rev-${Date.now()}`,
      reviewerName: newReview.reviewerName,
      reviewerAvatar: `https://picsum.photos/seed/${newReview.reviewerName}/100/100`,
      rating: newReview.rating,
      comment: newReview.comment,
      date: 'Just now',
      aspects: { quality: newReview.rating, communication: 5, timeliness: 5 }
    };
    setFormData(prev => ({
      ...prev,
      reviews: [review, ...prev.reviews],
      reviewCount: prev.reviewCount + 1,
      rating: parseFloat(((prev.rating * prev.reviewCount + review.rating) / (prev.reviewCount + 1)).toFixed(1))
    }));
    setNewReview({ reviewerName: '', comment: '', rating: 5 });
  };

  const removeReview = (id: string) => {
    setFormData(prev => ({
      ...prev,
      reviews: prev.reviews.filter(r => r.id !== id),
      reviewCount: Math.max(0, prev.reviewCount - 1)
    }));
  };

  const approvePendingReview = (reviewId: string) => {
    const reviewToApprove = formData.pendingReviews?.find(r => r.id === reviewId);
    if (!reviewToApprove) return;

    setFormData(prev => ({
      ...prev,
      reviews: [reviewToApprove, ...prev.reviews],
      pendingReviews: (prev.pendingReviews || []).filter(r => r.id !== reviewId),
      reviewCount: prev.reviewCount + 1,
      rating: parseFloat(((prev.rating * prev.reviewCount + reviewToApprove.rating) / (prev.reviewCount + 1)).toFixed(1))
    }));
  };

  const discardPendingReview = (reviewId: string) => {
    setFormData(prev => ({
      ...prev,
      pendingReviews: (prev.pendingReviews || []).filter(r => r.id !== reviewId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Edit Expert Profile</h2>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all">Cancel</button>
          <button onClick={() => onSave(formData)} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Changes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2 border-b border-slate-50 pb-2">Core Identity</h3>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expert Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Title / Specialty</label>
            <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option>Plumbing</option><option>Electrical</option><option>Gardening</option><option>Carpentry</option><option>General</option><option>Design</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
              <select name="availability" value={formData.availability} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option>Available Now</option><option>Available Next Week</option><option>Busy</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rate</label>
              <input type="text" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yrs Experience</label>
              <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Bio & Expertise */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2 border-b border-slate-50 pb-2">Expertise & Bio</h3>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expert Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skills (comma separated)</label>
            <input type="text" value={formData.skills.join(', ')} onChange={handleSkillsChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Pending Reviews Section */}
      {(formData.pendingReviews || []).length > 0 && (
        <div className="bg-amber-50 p-10 rounded-[2.5rem] shadow-sm border border-amber-200 ring-8 ring-amber-50/50">
          <h3 className="text-sm font-black text-amber-700 uppercase tracking-widest mb-8 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Pending Client Feedback
          </h3>
          <div className="space-y-6">
            {formData.pendingReviews?.map(review => (
              <div key={review.id} className="bg-white rounded-[1.5rem] p-6 border border-amber-200 flex gap-6 items-start shadow-sm">
                <img src={review.reviewerAvatar} className="w-12 h-12 rounded-2xl" alt={review.reviewerName} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-slate-800 text-xs uppercase">{review.reviewerName}</h4>
                    <span className="text-[10px] font-black text-amber-500">★ {review.rating}.0</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"{review.comment}"</p>
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => approvePendingReview(review.id)}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                    >
                      Approve & Add to Profile
                    </button>
                    <button 
                      onClick={() => discardPendingReview(review.id)}
                      className="bg-slate-100 text-slate-400 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Review Addition */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Client Feedback & Recommendations
        </h3>

        <div className="space-y-6 mb-10">
          {formData.reviews.map(review => (
            <div key={review.id} className="relative group bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 flex gap-5 items-start">
              <img src={review.reviewerAvatar} className="w-12 h-12 rounded-2xl shadow-sm" alt={review.reviewerName} />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-slate-800 text-xs uppercase">{review.reviewerName}</h4>
                  <span className="text-[10px] font-black text-amber-500">★ {review.rating}.0</span>
                </div>
                <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"{review.comment}"</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">{review.date}</p>
              </div>
              <button 
                onClick={() => removeReview(review.id)}
                className="opacity-0 group-hover:opacity-100 bg-rose-500 text-white p-1.5 rounded-full shadow-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Log External Client Testimonial</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Name</label>
              <input 
                type="text" 
                value={newReview.reviewerName}
                onChange={e => setNewReview(prev => ({...prev, reviewerName: e.target.value}))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="e.g., Jennifer Wu"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Star Rating</label>
              <select 
                value={newReview.rating}
                onChange={e => setNewReview(prev => ({...prev, rating: parseInt(e.target.value)}))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Quote</label>
            <textarea 
              value={newReview.comment}
              onChange={e => setNewReview(prev => ({...prev, comment: e.target.value}))}
              rows={3} 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
              placeholder="Paste the review or testimonial text here..."
            />
          </div>
          <button 
            disabled={!newReview.reviewerName || !newReview.comment}
            onClick={addReview}
            className="mt-8 w-full bg-slate-900 disabled:bg-slate-300 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
          >
            Archive Recommendation
          </button>
        </div>
      </div>

      {/* Certificates & Licenses */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Certifications & Professional Licenses
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {(formData.certificates || []).map(cert => (
            <div key={cert.id} className="relative group bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
              {cert.mimeType?.startsWith('image/') || !cert.mimeType ? (
                <img src={cert.imageUrl} className="w-16 h-16 rounded-xl object-cover border border-slate-200" alt={cert.title} />
              ) : (
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 00-2 2z" /></svg>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">{cert.title}</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5 truncate">{cert.issuer}</p>
                <p className="text-[9px] text-slate-400 font-medium">{cert.date}</p>
              </div>
              <button 
                onClick={() => removeCertificate(cert.id)}
                className="opacity-0 group-hover:opacity-100 bg-rose-500 text-white p-1.5 rounded-full shadow-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          {(formData.certificates || []).length === 0 && (
            <div className="md:col-span-2 py-8 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">No verification documents added</div>
          )}
        </div>

        <div className="bg-indigo-50/50 p-8 rounded-[2rem] border-2 border-dashed border-indigo-200">
          <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-6">Upload Professional Verification</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-indigo-900/40 uppercase mb-1">Certificate Title</label>
                <input 
                  type="text" 
                  value={newCert.title}
                  onChange={e => setNewCert(prev => ({...prev, title: e.target.value}))}
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                  placeholder="e.g., Master Electrician License"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-indigo-900/40 uppercase mb-1">Issuer</label>
                   <input 
                    type="text" 
                    value={newCert.issuer}
                    onChange={e => setNewCert(prev => ({...prev, issuer: e.target.value}))}
                    className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                    placeholder="e.g., State of WA"
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-indigo-900/40 uppercase mb-1">Issue Date</label>
                   <input 
                    type="text" 
                    value={newCert.date}
                    onChange={e => setNewCert(prev => ({...prev, date: e.target.value}))}
                    className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" 
                    placeholder="e.g., Oct 2022"
                   />
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => certFileRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-2xl bg-white p-6 relative overflow-hidden group cursor-pointer hover:border-indigo-400 transition-all shadow-sm h-full min-h-[160px]"
            >
              {newCert.imageUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {newCert.mimeType?.startsWith('image/') ? (
                    <img src={newCert.imageUrl} className="w-full h-full object-contain rounded-xl" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center">
                       <svg className="w-12 h-12 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">Document Selected</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-black text-[10px] uppercase">Change File</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-10 h-10 text-indigo-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Select Image or Document (PDF/Doc)</p>
                </div>
              )}
              <input ref={certFileRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleCertFileUpload} />
            </div>
          </div>
          <button 
            disabled={!newCert.title || !newCert.imageUrl}
            onClick={addCertificate}
            className="mt-8 w-full bg-indigo-600 disabled:bg-indigo-300 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all"
          >
            Add Verification
          </button>
        </div>
      </div>

      {/* Portfolio Showcase Management */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Build Portfolio Showcase
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {formData.portfolio.map(item => (
            <div key={item.id} className="relative group bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
              <img src={item.imageUrl} className="w-full h-40 object-cover" alt={item.title} />
              <div className="p-4">
                <p className="font-black text-[10px] text-slate-800 uppercase tracking-tight truncate">{item.title}</p>
              </div>
              <button 
                onClick={() => removePortfolioItem(item.id)}
                className="absolute top-3 right-3 bg-rose-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Add New Portfolio Project</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={newPortfolioItem.title}
                  onChange={e => setNewPortfolioItem(prev => ({...prev, title: e.target.value}))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g., Downtown Loft Rewiring"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Description</label>
                <textarea 
                  value={newPortfolioItem.description}
                  onChange={e => setNewPortfolioItem(prev => ({...prev, description: e.target.value}))}
                  rows={3} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                  placeholder="Technical details, challenges overcome, etc."
                />
              </div>
            </div>
            
            <div 
              onClick={() => portfolioFileRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6 relative overflow-hidden group cursor-pointer hover:border-indigo-400 transition-all shadow-sm"
            >
              {newPortfolioItem.imageUrl ? (
                <div className="relative w-full h-full">
                  <img src={newPortfolioItem.imageUrl} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                  <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-black text-[10px] uppercase">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Build Image</p>
                </div>
              )}
              <input ref={portfolioFileRef} type="file" accept="image/*" className="hidden" onChange={handlePortfolioFileUpload} />
            </div>
          </div>
          <button 
            disabled={!newPortfolioItem.title || !newPortfolioItem.imageUrl}
            onClick={addPortfolioItem}
            className="mt-8 w-full bg-indigo-600 disabled:bg-indigo-300 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all"
          >
            Showcase Project
          </button>
        </div>
      </div>
    </div>
  );
};
