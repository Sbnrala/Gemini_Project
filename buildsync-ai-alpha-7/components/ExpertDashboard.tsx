
import React from 'react';
import { BroadcastRequest } from '../types';

interface ExpertDashboardProps {
  requests: BroadcastRequest[];
  onOfferHelp: (req: BroadcastRequest) => void;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({ requests, onOfferHelp }) => {
  const getStatusStyle = (status: BroadcastRequest['status']) => {
    switch (status) {
      case 'open': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'offer_received': return 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse';
      case 'chatting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'active': return 'bg-indigo-600 text-white border-indigo-400';
      case 'resolved': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusText = (status: BroadcastRequest['status']) => {
    switch (status) {
      case 'open': return 'Signal Open';
      case 'offer_received': return 'Offer Sent';
      case 'chatting': return 'Discussing with Client';
      case 'active': return 'Live Link Active';
      case 'resolved': return 'Closed';
      default: return status;
    }
  };

  // Only display signals that are still 'open' to professionals
  const openRequests = requests.filter(r => r.status === 'open');
  const categories = Array.from(new Set(openRequests.map(r => r.category)));

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Expert Dispatch</h2>
          <p className="text-slate-500 font-medium">Respond to help signals across the network.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Requests:</span>
            <span className="text-lg font-black text-indigo-600">{openRequests.length}</span>
          </div>
        </div>
      </div>

      {openRequests.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">No Active Signals Detected.</p>
          <p className="text-slate-300 text-xs mt-2 font-medium">Listening for builder help signals across the network...</p>
        </div>
      ) : (
        categories.map(category => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4">
               <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em] whitespace-nowrap">{category}</h3>
               <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openRequests.filter(r => r.category === category).map(req => (
                <div key={req.id} className="bg-white rounded-[2.5rem] border-2 border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(req.status)}`}>
                        {getStatusText(req.status)}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                        {req.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 leading-none">{req.clientName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Ticket #{req.id.slice(-4)}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 min-h-[80px]">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Client Request</p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic line-clamp-3">
                        "{req.problemSummary}"
                      </p>
                    </div>

                    {req.snapshot && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 h-32 relative">
                        <img src={req.snapshot} className="w-full h-full object-cover" alt="Snapshot" />
                        <div className="absolute inset-0 bg-indigo-900/10"></div>
                      </div>
                    )}
                  </div>

                  <div className="p-8 pt-0 mt-auto">
                    <button 
                      onClick={() => onOfferHelp(req)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 group-hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      I can help
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
