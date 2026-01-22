
import React, { useState, useRef } from 'react';
import { Professional, PortfolioItem } from '../types';

interface ProfileEditViewProps {
  pro: Professional;
  onSave: (updatedPro: Professional) => void;
  onCancel: () => void;
}

export const ProfileEditView: React.FC<ProfileEditViewProps> = ({ pro, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Professional>({ ...pro });
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: '', description: '', imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(s => s.trim());
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPortfolioItem(prev => ({ ...prev, imageUrl: reader.result as string }));
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">Edit Professional Profile</h2>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all">Cancel</button>
          <button onClick={() => onSave(formData)} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Profile</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-50 pb-2">Basic Information</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Professional Specialty</label>
            <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option>Plumbing</option><option>Electrical</option><option>Gardening</option><option>Carpentry</option><option>General</option><option>Design</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Availability</label>
              <select name="availability" value={formData.availability} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option>Available Now</option><option>Available Next Week</option><option>Busy</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hourly Rate</label>
              <input type="text" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Experience</label>
              <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-50 pb-2">Bio & Expertise</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">About Me</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Skills (comma separated)</label>
            <input type="text" value={formData.skills.join(', ')} onChange={handleSkillsChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g., Tiling, Plumbing, Grouting" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Portfolio Management */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Manage Portfolio Items
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {formData.portfolio.map(item => (
            <div key={item.id} className="relative group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
              <img src={item.imageUrl} className="w-full h-32 object-cover" alt={item.title} />
              <div className="p-3">
                <p className="font-bold text-xs text-slate-800 truncate">{item.title}</p>
              </div>
              <button 
                onClick={() => removePortfolioItem(item.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-indigo-50/50 p-6 rounded-3xl border-2 border-dashed border-indigo-100">
          <h4 className="text-sm font-bold text-indigo-900 mb-4 uppercase tracking-wider">Add New Project</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-indigo-900/40 uppercase mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={newPortfolioItem.title}
                  onChange={e => setNewPortfolioItem(prev => ({...prev, title: e.target.value}))}
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  placeholder="e.g., Luxury Bathroom Renovation"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-indigo-900/40 uppercase mb-1">Project Description</label>
                <textarea 
                  value={newPortfolioItem.description}
                  onChange={e => setNewPortfolioItem(prev => ({...prev, description: e.target.value}))}
                  rows={3} 
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" 
                  placeholder="Details about the scope, materials used, etc."
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-2xl bg-white p-4 relative overflow-hidden group">
              {newPortfolioItem.imageUrl ? (
                <div className="relative w-full h-full">
                  <img src={newPortfolioItem.imageUrl} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                  <button onClick={() => setNewPortfolioItem(prev => ({...prev, imageUrl: ''}))} className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="w-10 h-10 text-indigo-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-xs font-bold text-indigo-400">Upload Project Image</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-black uppercase hover:bg-indigo-200 transition-all"
                  >
                    Browse Files
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>
          <button 
            disabled={!newPortfolioItem.title || !newPortfolioItem.imageUrl}
            onClick={addPortfolioItem}
            className="mt-6 w-full bg-indigo-600 disabled:bg-indigo-300 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all"
          >
            Add to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
