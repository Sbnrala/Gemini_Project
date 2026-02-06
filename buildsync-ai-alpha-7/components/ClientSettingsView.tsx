import React, { useState, useRef } from 'react';
import { Collection, WallPost, SavedCard, BankAccount } from '../types';
import { WALLPAPER_PRESETS } from '../App';

interface ClientSettingsViewProps {
  onBack: () => void;
  onLogout: () => void;
  userRole: 'client' | 'expert';
  isLocked: boolean;
  setIsLocked: (v: boolean) => void;
  notificationPrefs: boolean[];
  setNotificationPrefs: (v: boolean[]) => void;
  collections?: Collection[];
  allPosts?: WallPost[];
  onCreateCollection?: (name: string) => void;
  savedCards: SavedCard[];
  setSavedCards: React.Dispatch<React.SetStateAction<SavedCard[]>>;
  bankAccount: BankAccount | null;
  setBankAccount: (acc: BankAccount | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  userLocation: { country: string, city: string, region: string };
  setUserLocation: (loc: { country: string, city: string, region: string }) => void;
  userCredits?: number;
  onReloadRequest?: () => void;
  wallpaperId?: string;
  onWallpaperChange?: (id: string) => void;
  onCustomWallpaperChange?: (url: string | null) => void;
  customWallpaper?: string | null;
}

export const ClientSettingsView: React.FC<ClientSettingsViewProps> = ({ 
  onBack, 
  onLogout,
  userRole,
  isLocked,
  setIsLocked,
  notificationPrefs,
  setNotificationPrefs,
  savedCards,
  setSavedCards,
  bankAccount,
  setBankAccount,
  userName,
  setUserName,
  userAvatar,
  setUserAvatar,
  userEmail,
  setUserEmail,
  userPhone,
  setUserPhone,
  userLocation,
  setUserLocation,
  userCredits = 0,
  onReloadRequest,
  wallpaperId,
  onWallpaperChange,
  onCustomWallpaperChange,
  customWallpaper
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [cardFormData, setCardFormData] = useState({ number: '', expiry: '', cvv: '', nickname: '' });
  const [bankFormData, setBankFormData] = useState({ bankName: '', holder: '', account: '', routing: '' });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  const handleTogglePref = (index: number) => {
    if (isLocked) return;
    const newPrefs = [...notificationPrefs];
    newPrefs[index] = !newPrefs[index];
    setNotificationPrefs(newPrefs);
  };

  const handleAddCard = () => {
    const newCard: SavedCard = {
      id: `c-${Date.now()}`,
      brand: 'visa',
      last4: cardFormData.number.slice(-4),
      expiry: cardFormData.expiry,
      isDefault: savedCards.length === 0,
      nickname: cardFormData.nickname || 'Personal Card'
    };
    setSavedCards([...savedCards, newCard]);
    setIsAddingCard(false);
    setCardFormData({ number: '', expiry: '', cvv: '', nickname: '' });
  };

  const handleAddBank = () => {
    const newBank: BankAccount = {
      bankName: bankFormData.bankName,
      accountHolder: bankFormData.holder,
      accountNumber: bankFormData.account,
      routingNumber: bankFormData.routing,
      status: 'verified'
    };
    setBankAccount(newBank);
    setIsAddingBank(false);
    setBankFormData({ bankName: '', holder: '', account: '', routing: '' });
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCustomWallpaperChange?.(reader.result as string);
        onWallpaperChange?.('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const notificationsList = [
    { label: 'Broadcast Responses', desc: 'Alert me when an expert responds to my build signal.' },
    { label: 'AI Progress Summaries', desc: 'Weekly digests of your project milestones.' },
    { label: 'Security Alerts', desc: 'Immediate notification of new login attempts.' },
    { label: 'Expert Chat Messages', desc: 'Real-time push notifications for active links.' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-white/20 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/50 hover:bg-white rounded-full transition-all text-slate-900 shadow-sm border border-white/40">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight uppercase leading-none">Account Hub</h2>
            <p className="text-slate-800 font-bold text-[10px] uppercase tracking-widest mt-1 opacity-60">Identity • Environment • Financials</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Visual Environment */}
        <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[3.5rem] shadow-xl border border-white space-y-8 md:col-span-2">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-rose-100 p-2.5 rounded-2xl text-rose-900 border border-rose-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Workspace Aura</h3>
              </div>
              <button 
                onClick={() => wallpaperInputRef.current?.click()}
                className="bg-emerald-800 text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-emerald-900 transition-all"
              >
                Upload Own Wallpaper
              </button>
              <input type="file" ref={wallpaperInputRef} className="hidden" accept="image/*" onChange={handleWallpaperUpload} />
           </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {WALLPAPER_PRESETS.map(preset => (
              <button 
                key={preset.id}
                onClick={() => onWallpaperChange?.(preset.id)}
                className={`relative aspect-[4/3] rounded-3xl overflow-hidden border-4 transition-all hover:scale-105 ${wallpaperId === preset.id ? 'border-emerald-800 ring-4 ring-emerald-100 shadow-lg shadow-emerald-200' : 'border-white'}`}
              >
                <div className={`absolute inset-0 ${preset.class}`}></div>
                <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors"></div>
                <p className="absolute bottom-2 left-2 right-2 text-[8px] font-black text-slate-950 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-xl truncate text-center shadow-sm uppercase tracking-tighter">{preset.name}</p>
              </button>
            ))}
            {customWallpaper && (
               <button 
                onClick={() => onWallpaperChange?.('custom')}
                className={`relative aspect-[4/3] rounded-3xl overflow-hidden border-4 transition-all hover:scale-105 ${wallpaperId === 'custom' ? 'border-emerald-800 ring-4 ring-emerald-100 shadow-lg shadow-emerald-200' : 'border-white'}`}
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${customWallpaper})` }}></div>
                <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors"></div>
                <p className="absolute bottom-2 left-2 right-2 text-[8px] font-black text-slate-950 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-xl truncate text-center shadow-sm uppercase tracking-tighter">My Upload</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCustomWallpaperChange?.(null); onWallpaperChange?.('mesh'); }}
                  className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full shadow-lg"
                >
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
                </button>
              </button>
            )}
          </div>
        </section>

        {/* Identity & Contact */}
        <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[3.5rem] shadow-xl border border-white space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-900 border border-emerald-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Neural Persona</h3>
          </div>
          
          <div className="flex items-center gap-6 mb-8 bg-white/50 p-5 rounded-[2rem] border border-white shadow-inner">
            <img src={userAvatar} className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xl" alt="Avatar" />
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-emerald-900 transition-all active:scale-95"
            >
              Update Image
            </button>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setUserAvatar(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </div>

          <div className="space-y-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Display Identity</label>
                <input value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-white/60 border border-white/80 rounded-2xl px-6 py-4 text-sm font-bold text-slate-950 shadow-sm focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Contact Terminal (Email)</label>
                <input value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full bg-white/60 border border-white/80 rounded-2xl px-6 py-4 text-sm font-bold text-slate-950 shadow-sm focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Mobile Identification</label>
                <input value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="+1 (000) 000-0000" className="w-full bg-white/60 border border-white/80 rounded-2xl px-6 py-4 text-sm font-bold text-slate-950 shadow-sm focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all outline-none" />
             </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[3.5rem] shadow-xl border border-white space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-sky-100 p-2.5 rounded-2xl text-sky-900 border border-sky-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Site Coordinates</h3>
          </div>
          
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Country</label>
                   <input value={userLocation.country} onChange={e => setUserLocation({...userLocation, country: e.target.value})} className="w-full bg-white/60 border border-white/80 rounded-2xl px-6 py-4 text-sm font-bold text-slate-950 shadow-sm focus:ring-2 focus:ring-sky-200 outline-none" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Region</label>
                   <input value={userLocation.region} onChange={e => setUserLocation({...userLocation, region: e.target.value})} className="w-full bg-white/60 border border-white/80 rounded-2xl px-6 py-4 text-sm font-bold text-slate-950 shadow-sm focus:ring-2 focus:ring-sky-200 outline-none" />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">City Hub</label>
                <input value={userLocation.city} onChange={e => setUserLocation({...userLocation, city: e.target.value})} className="w-full bg-white/60 border border-white/80 rounded-2xl px-6 py-4 text-sm font-bold text-slate-950 shadow-sm focus:ring-2 focus:ring-sky-200 outline-none" />
             </div>
          </div>
        </section>

        {/* Comprehensive Financial Hub */}
        <section className="bg-white/80 backdrop-blur-2xl p-10 rounded-[4rem] shadow-2xl border border-white md:col-span-2 space-y-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-800 p-3 rounded-2xl text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight leading-none">Financial Hub</h3>
                    <p className="text-emerald-800 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Manage Payment & Payout Streams</p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={() => setIsAddingCard(true)} className="flex-1 md:flex-none bg-slate-950 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95">+ Add Card</button>
                {userRole === 'expert' && !bankAccount && (
                   <button onClick={() => setIsAddingBank(true)} className="flex-1 md:flex-none bg-emerald-800 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-emerald-900 transition-all active:scale-95">Link Bank Payout</button>
                )}
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Express Options */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Express Integration</h4>
                 <div className="flex flex-col gap-3">
                    <button className="bg-black text-white h-14 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-md group">
                       <span className="font-bold text-lg"> Pay</span>
                    </button>
                    <button className="bg-white border border-slate-200 h-14 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-md">
                       <img src="https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" className="h-4" alt="Google" />
                       <span className="font-bold text-slate-700 text-lg">Pay</span>
                    </button>
                 </div>
              </div>

              {/* Standard Cards */}
              <div className="space-y-4 lg:col-span-2">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Saved Payment Protocol</h4>
                 {savedCards.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {savedCards.map(card => (
                       <div key={card.id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex justify-between items-center group hover:shadow-xl transition-all relative overflow-hidden">
                          <div className="flex items-center gap-4 relative z-10">
                             <div className="w-10 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-[8px] font-black text-white uppercase">{card.brand}</div>
                             <div>
                                <p className="text-xs font-black text-slate-950 uppercase tracking-tight">{card.nickname}</p>
                                <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-0.5">•••• {card.last4}</p>
                             </div>
                          </div>
                          <button onClick={() => setSavedCards(savedCards.filter(c => c.id !== card.id))} className="text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-all relative z-10">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="h-28 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No funding sources connected</div>
                 )}
              </div>

              {/* Bank Detail Section for Expert Only */}
              {userRole === 'expert' && (
                <div className="lg:col-span-3 pt-6 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-6">Settlement Terminal (Payouts)</h4>
                    {bankAccount ? (
                        <div className="bg-emerald-50/50 border border-emerald-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${bankAccount.status === 'verified' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                                    {bankAccount.status} Connection
                                </span>
                            </div>
                            <div className="flex gap-6 items-center">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-800 shadow-sm border border-emerald-100">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <h5 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-none">{bankAccount.bankName}</h5>
                                    <p className="text-emerald-800 text-[10px] font-bold tracking-[0.4em] mt-2">•••• •••• •••• {bankAccount.accountNumber.slice(-4)}</p>
                                    <p className="text-slate-400 text-[9px] font-black uppercase mt-1">Holder: {bankAccount.accountHolder}</p>
                                </div>
                            </div>
                            <button onClick={() => setBankAccount(null)} className="bg-white border border-rose-100 text-rose-600 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-rose-50 transition-all shadow-sm">
                                Disconnect Payout Terminal
                            </button>
                        </div>
                    ) : (
                        <div onClick={() => setIsAddingBank(true)} className="cursor-pointer bg-emerald-50/30 hover:bg-emerald-50/60 border-2 border-dashed border-emerald-200 p-12 rounded-[2.5rem] text-center transition-all group">
                             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-800 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                             </div>
                             <p className="text-emerald-900 font-black uppercase tracking-[0.3em] text-sm">Link Payout Channel</p>
                             <p className="text-emerald-700/60 text-xs mt-2 font-bold max-w-sm mx-auto">Authorize BuildSync to deposit session earnings directly into your professional account.</p>
                        </div>
                    )}
                </div>
              )}
           </div>
        </section>

        {/* Modal Forms */}
        {(isAddingCard || isAddingBank) && (
          <div className="fixed inset-0 z-[300] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
                <h3 className="text-2xl font-black text-slate-950 tracking-tight uppercase mb-8 leading-none">
                  {isAddingCard ? 'Enroll Card' : 'Configure Settlement'}
                </h3>
                
                {isAddingCard ? (
                  <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Label</label>
                        <input placeholder="Personal, Business..." value={cardFormData.nickname} onChange={e => setCardFormData({...cardFormData, nickname: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Card Sequence</label>
                        <input placeholder="0000 0000 0000 0000" value={cardFormData.number} onChange={e => setCardFormData({...cardFormData, number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Expiry</label>
                        <input placeholder="MM/YY" value={cardFormData.expiry} onChange={e => setCardFormData({...cardFormData, expiry: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-200 w-full" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">CVV</label>
                        <input placeholder="000" value={cardFormData.cvv} onChange={e => setCardFormData({...cardFormData, cvv: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-200 w-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Bank Name</label>
                        <input placeholder="Chase, Barclays..." value={bankFormData.bankName} onChange={e => setBankFormData({...bankFormData, bankName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-200 outline-none" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Account Holder</label>
                        <input placeholder="Full Legal Name" value={bankFormData.holder} onChange={e => setBankFormData({...bankFormData, holder: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-200 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Routing Sequence</label>
                            <input placeholder="9-digit Routing" value={bankFormData.routing} onChange={e => setBankFormData({...bankFormData, routing: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-200 outline-none" />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Account Number</label>
                            <input placeholder="Account Sequence" value={bankFormData.account} onChange={e => setBankFormData({...bankFormData, account: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-200 outline-none" />
                        </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-10">
                   <button onClick={() => { setIsAddingCard(false); setIsAddingBank(false); }} className="flex-1 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                   <button onClick={isAddingCard ? handleAddCard : handleAddBank} className="flex-1 bg-slate-950 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">Secure Hub</button>
                </div>
             </div>
          </div>
        )}

        {/* Notifications Preference */}
        <section className="bg-white/70 backdrop-blur-xl p-8 rounded-[3.5rem] shadow-xl border border-white md:col-span-2 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-violet-100 p-2.5 rounded-2xl text-violet-900 border border-violet-200">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Signal Preferences</h3>
            <button onClick={() => setIsLocked(!isLocked)} className={`text-[8px] font-black uppercase px-4 py-1.5 rounded-full border transition-all ${isLocked ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
               {isLocked ? 'Unlock Security' : 'Session Unlocked'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {notificationsList.map((pref, i) => (
              <div key={pref.label} className={`flex items-center justify-between py-4 border-b border-slate-100 last:border-0 transition-all ${isLocked ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex-1 pr-6">
                  <p className="text-xs font-black text-slate-950 uppercase tracking-tight">{pref.label}</p>
                  <p className="text-[10px] text-slate-600 font-bold opacity-70 leading-tight mt-1 uppercase tracking-tighter">{pref.desc}</p>
                </div>
                <button onClick={() => handleTogglePref(i)} className={`w-12 h-6 rounded-full transition-all relative ${notificationPrefs[i] ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPrefs[i] ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-col items-center gap-10 pt-10 pb-20 border-t border-white/20">
        <button 
          onClick={onLogout}
          className="w-full max-w-sm bg-rose-800 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-rose-900 active:scale-95 transition-all"
        >
          Terminate Neural Link (Sign Out)
        </button>
      </div>
    </div>
  );
};