
import React, { useState } from 'react';
import { Project, Professional } from '../types';

interface ReviewModalProps {
  project: Project;
  pro: Professional;
  onClose: () => void;
  onSubmit: (reviewData: any) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ project, pro, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState({ quality: 5, communication: 5, timeliness: 5 });

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`text-xl transition-colors ${star <= value ? 'text-amber-400' : 'text-slate-200'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Review Experience</h3>
            <p className="text-xs text-slate-500">Project: {project.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl">
            <img src={pro.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt={pro.name} />
            <div>
              <p className="font-bold text-slate-800">{pro.name}</p>
              <p className="text-xs text-indigo-600 font-semibold">{pro.specialty}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Overall Rating</label>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all ${star <= rating ? 'text-amber-400 scale-110' : 'text-slate-100'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 bg-slate-50 p-4 rounded-2xl">
            <StarRating label="Work Quality" value={aspects.quality} onChange={(v) => setAspects(prev => ({...prev, quality: v}))} />
            <StarRating label="Communication" value={aspects.communication} onChange={(v) => setAspects(prev => ({...prev, communication: v}))} />
            <StarRating label="Timeliness" value={aspects.timeliness} onChange={(v) => setAspects(prev => ({...prev, timeliness: v}))} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Written Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your experience working with this builder?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 font-bold text-sm">Cancel</button>
          <button 
            onClick={() => onSubmit({ rating, comment, aspects })}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};
