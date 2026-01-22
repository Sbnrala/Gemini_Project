
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Professional, Project, ChatMessage, DriveFile, Review, BroadcastRequest } from './types';
import { MOCK_PROS, INITIAL_PROJECTS } from './constants';
import { Whiteboard } from './components/Whiteboard';
import { GoogleDrivePicker } from './components/GoogleDrivePicker';
import { CameraCapture } from './components/CameraCapture';
import { ExpertDashboard } from './components/ExpertDashboard';
import { ConnectionApprovalModal } from './components/ConnectionApprovalModal';
import { BuildersWall } from './components/BuildersWall';
import { LocalExpertsList } from './components/LocalExpertsList';
import { ProfileView } from './components/ProfileView';
import { geminiService } from './services/geminiService';
import { LiveCallSession } from './services/liveService';
import { MultiOfferModal } from './components/MultiOfferModal';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'client' | 'expert'>('client');
  const [currentView, setCurrentView] = useState<AppView>(AppView.WORKSPACE);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [pros, setPros] = useState<Professional[]>(MOCK_PROS);
  const [broadcasts, setBroadcasts] = useState<BroadcastRequest[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  const [selectedBroadcastForOffers, setSelectedBroadcastForOffers] = useState<BroadcastRequest | null>(null);

  // Tools & UI State
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<DriveFile[]>([]);
  const [pendingSnapshot, setPendingSnapshot] = useState<string | undefined>(undefined);
  const [imageToEdit, setImageToEdit] = useState<string | undefined>(undefined);
  
  const [activeProjectTab, setActiveProjectTab] = useState<'ai' | 'expert' | 'vault' | 'summaries'>('ai');

  const scrollRef = useRef<HTMLDivElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const liveSessionRef = useRef<LiveCallSession | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const currentExpert = pros[0]; 

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeProject, isTyping, activeProjectTab]);

  const handleStartLiveAI = async () => {
    if (!activeProject) return;

    setIsLiveActive(true);
    setLiveTranscription('Initializing neural vision link with project context...');
    
    // Construct dynamic context from project history
    const historySummary = activeProject.aiMessages
      .map(m => `${m.role.toUpperCase()}: ${m.text.slice(0, 100)}...`)
      .join('\n');
    
    const context = `
      CURRENT PROJECT: ${activeProject.title}
      GOAL: ${activeProject.summary}
      HISTORY SUMMARY:
      ${historySummary}
      STATUS: ${activeProject.status}
    `;

    const session = new LiveCallSession();
    liveSessionRef.current = session;
    
    try {
      await session.start({
        onMessage: (text) => setLiveTranscription(text),
        onClose: () => {
          setIsLiveActive(false);
          setLiveTranscription('');
        }
      }, liveVideoRef.current || undefined, context);
    } catch (err) {
      console.error("Failed to start live session:", err);
      setIsLiveActive(false);
    }
  };

  const handleStopLiveAI = () => {
    liveSessionRef.current?.stop();
    setIsLiveActive(false);
    setLiveTranscription('');
  };

  const handleSendMessage = async (text: string = inputText, imageBase64?: string, attachedFiles: DriveFile[] = pendingFiles) => {
    const finalImage = imageBase64 || pendingSnapshot;
    if (!text.trim() && !finalImage && attachedFiles.length === 0) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text, 
      canvasSnapshot: finalImage, 
      attachedFiles 
    };

    let targetProjectId = activeProjectId;

    if (!targetProjectId && userRole === 'client') {
      const newProjectId = `proj-${Date.now()}`;
      const newProject: Project = {
        id: newProjectId,
        title: text.length > 25 ? text.slice(0, 25) + '...' : text,
        status: 'planning',
        lastUpdated: 'Just now',
        summary: text,
        aiMessages: [userMsg],
        expertMessages: [],
        media: finalImage ? [{ id: 'm1', url: finalImage, type: 'photo', name: 'Initial Context', timestamp: 'Just now' }] : [],
        files: attachedFiles,
        summaries: []
      };
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProjectId);
      targetProjectId = newProjectId;
    } else if (targetProjectId) {
      setProjects(prev => prev.map(p => {
        if (p.id === targetProjectId) {
          const updatedMedia = finalImage ? [...p.media, { id: `m-${Date.now()}`, url: finalImage, type: 'photo' as const, name: 'Snapshot', timestamp: 'Just now' }] : p.media;
          const updatedFiles = [...p.files, ...attachedFiles];
          return { ...p, aiMessages: [...p.aiMessages, userMsg], media: updatedMedia, files: updatedFiles, lastUpdated: 'Just now' };
        }
        return p;
      }));
    }

    setInputText('');
    setPendingSnapshot(undefined);
    setPendingFiles([]);
    setImageToEdit(undefined);
    setIsTyping(true);

    try {
      // Build full history context for the AI
      const currentProj = projects.find(p => p.id === targetProjectId);
      const historyContext = currentProj ? 
        currentProj.aiMessages.map(m => `${m.role}: ${m.text}`).join('\n') : 
        '';

      const adviceResponse = await geminiService.getDIYAdvice(text, historyContext, finalImage, attachedFiles, pros);
      
      const aiMsg: ChatMessage = { 
        id: `ai-${Date.now()}`, 
        role: 'model', 
        text: adviceResponse.text,
        generatedImages: adviceResponse.images.length > 0 ? adviceResponse.images : undefined
      };

      setProjects(prev => prev.map(p => p.id === targetProjectId ? { ...p, aiMessages: [...p.aiMessages, aiMsg] } : p));
    } finally { setIsTyping(false); }
  };

  const handleExpertMessage = (text: string) => {
    if (!activeProjectId) return;
    const msg: ChatMessage = { 
      id: Date.now().toString(), 
      role: userRole === 'expert' ? 'expert' : 'user', 
      text, 
      expertName: userRole === 'expert' ? currentExpert.name : undefined 
    };
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, expertMessages: [...p.expertMessages, msg], lastUpdated: 'Just now' } : p));
    setInputText('');
  };

  const handleExpertOffer = (req: BroadcastRequest) => {
    setBroadcasts(prev => prev.map(r => {
      if (r.id === req.id) {
        const newOffers = r.offers.includes(currentExpert.id) ? r.offers : [...r.offers, currentExpert.id];
        return { ...r, status: 'offer_received', offers: newOffers };
      }
      return r;
    }));
    
    setTimeout(() => {
        setBroadcasts(prev => prev.map(r => {
            if (r.id === req.id) {
                const updatedOffers = [...r.offers];
                if (!updatedOffers.includes('2')) updatedOffers.push('2'); 
                if (!updatedOffers.includes('3')) updatedOffers.push('3'); 
                return { ...r, offers: updatedOffers };
            }
            return r;
        }));
    }, 1500);
  };

  const handleClientApproveOffer = (req: BroadcastRequest, expert: Professional) => {
    setBroadcasts(prev => prev.map(r => r.id === req.id ? { 
        ...r, 
        status: 'chatting', 
        assignedExpertId: expert.id,
        assignedExpertName: expert.name 
    } : r));
    
    setSelectedBroadcastForOffers(null);
    
    let targetId = activeProjectId;
    
    setProjects(prev => prev.map(p => {
      if (p.summary === req.problemSummary || p.id === activeProjectId) {
        targetId = p.id;
        return { 
          ...p, 
          assignedProId: expert.id, 
          assignedProName: expert.name, 
          status: 'in-progress' as const, 
          expertMessages: [
            ...p.expertMessages, 
            { id: 'e-init', role: 'expert', expertName: expert.name, text: `Signal received! I'm ${expert.name}. I've reviewed your project vault. How can we start building today?` }
          ] 
        };
      }
      return p;
    }));

    if (targetId) {
      setActiveProjectId(targetId);
      setCurrentView(AppView.WORKSPACE);
      setActiveProjectTab('expert'); 
    }
  };

  const handleBroadcast = () => {
    if (!activeProject) return;
    const newBroadcast: BroadcastRequest = {
      id: `b-${Date.now()}`,
      clientId: 'user-9912',
      clientName: 'Sarah Jenkins',
      category: 'General Build',
      problemSummary: activeProject.summary,
      urgency: 'high',
      timestamp: 'Just now',
      status: 'open',
      offers: [],
      snapshot: activeProject.media[0]?.url
    };
    setBroadcasts(prev => [newBroadcast, ...prev]);
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, aiMessages: [...p.aiMessages, { id: `sys-${Date.now()}`, role: 'model', text: "Signal broadcasted. Local builders are reviewing your project vault now." }] } : p));
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <nav className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col py-6 px-4 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">B</div>
          <h1 className="hidden md:block font-black text-xl text-indigo-900 tracking-tight">BuildSync</h1>
        </div>

        <div className="flex flex-col gap-1 flex-1 w-full">
          {userRole === 'client' ? (
            <>
              <button onClick={() => { setActiveProjectId(null); setCurrentView(AppView.WORKSPACE); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.WORKSPACE && !activeProjectId ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="hidden md:block text-sm font-bold">New Build</span>
              </button>
              <button onClick={() => setCurrentView(AppView.PROJECT_VAULT)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.PROJECT_VAULT || (activeProjectId && currentView === AppView.WORKSPACE) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span className="hidden md:block text-sm font-bold">Project Vault</span>
              </button>
              <button onClick={() => setCurrentView(AppView.LOCAL_EXPERTS)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.LOCAL_EXPERTS ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="hidden md:block text-sm font-bold">Local Experts</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentView(AppView.EXPERT_POOL)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.EXPERT_POOL ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span className="hidden md:block text-sm font-bold">Request Pool</span>
              </button>
              <button onClick={() => setCurrentView(AppView.EXPERT_PROJECTS)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.EXPERT_PROJECTS || (activeProjectId && userRole === 'expert') ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V20a2 2 0 002 2h14a2 2 0 002-2v-6.745zM3.17 6.745A23.96 23.96 0 0112 5c3.183 0 6.22.62 9 1.745V10a2 2 0 01-2 2H5a2 2 0 01-2-2V6.745z" /></svg>
                <span className="hidden md:block text-sm font-bold">Active Jobs</span>
              </button>
            </>
          )}
          <button onClick={() => setCurrentView(AppView.BUILDERS_WALL)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === AppView.BUILDERS_WALL ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15h.01" /></svg>
            <span className="hidden md:block text-sm font-bold">Builders Wall</span>
          </button>
        </div>

        <button 
          onClick={() => {
            const newRole = userRole === 'client' ? 'expert' : 'client';
            setUserRole(newRole);
            setCurrentView(newRole === 'client' ? AppView.WORKSPACE : AppView.EXPERT_POOL);
            setActiveProjectId(null);
          }}
          className="mt-auto bg-slate-900 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          {userRole === 'client' ? 'Expert Console' : 'Client Mode'}
        </button>
      </nav>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
            {activeProjectId ? activeProject?.title : (userRole === 'client' ? "Master Build Workspace" : "Expert Signals")}
          </h2>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{userRole} Identity</span>
             <img src={`https://picsum.photos/seed/${userRole}/100/100`} className="w-10 h-10 rounded-2xl border-2 border-slate-100" alt="Avatar" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {(currentView === AppView.WORKSPACE || (activeProjectId && (currentView === AppView.WORKSPACE || currentView === AppView.EXPERT_PROJECTS))) && (
            <div className="max-w-6xl mx-auto h-full flex flex-col">
              {activeProjectId ? (
                <div className="flex-1 flex flex-col bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-xl min-h-[600px]">
                  <div className="bg-slate-50 border-b border-slate-200 px-8 py-2 flex gap-8">
                    {(['ai', 'expert', 'vault', 'summaries'] as const).map(tab => (
                      <button 
                        key={tab} 
                        onClick={() => setActiveProjectTab(tab)}
                        className={`text-[10px] font-black uppercase tracking-widest py-4 border-b-2 transition-all relative ${activeProjectTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                      >
                        {tab === 'ai' ? 'Neural AI link' : tab === 'expert' ? (userRole === 'expert' ? 'Client Chat' : 'Expert Chat') : tab === 'vault' ? 'Directory / Assets' : 'Project Records'}
                        {tab === 'expert' && !activeProject.assignedProId && <span className="absolute -top-1 -right-2 bg-amber-500 w-2 h-2 rounded-full animate-ping"></span>}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
                    {activeProjectTab === 'ai' && (
                      <div className="flex-1 flex flex-col h-full">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 pb-4">
                          {activeProject?.aiMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'}`}>
                                <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-indigo-600'}`}>
                                  {msg.role === 'user' ? 'Client' : 'BuildSync AI'}
                                </div>
                                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                {msg.canvasSnapshot && <img src={msg.canvasSnapshot} className="mt-4 rounded-xl max-h-48 border border-white/20 shadow-sm" alt="Visual Context" />}
                                {msg.generatedImages && msg.generatedImages.map((img, idx) => (
                                  <div key={idx} className="mt-4 rounded-3xl overflow-hidden border-4 border-white shadow-xl animate-in zoom-in duration-500">
                                    <img src={img} className="w-full h-auto object-cover max-h-[400px]" alt="AI Visualization" />
                                    <div className="bg-white/90 backdrop-blur-sm p-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center justify-between">
                                      <span>Neural Representation</span>
                                      <a href={img} download={`visualization-${idx}.png`} className="hover:text-indigo-800 transition-colors">Download</a>
                                    </div>
                                  </div>
                                ))}
                                {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {msg.attachedFiles.map(f => (
                                      <div key={f.id} className="bg-white/10 px-3 py-1 rounded-lg text-[9px] font-bold uppercase border border-white/20 flex items-center gap-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        {f.name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {isTyping && <div className="flex gap-1 p-2"><div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-75"></div></div>}
                        </div>

                        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50">
                          {broadcasts.find(b => b.problemSummary === activeProject.summary && b.offers.length > 0 && !b.assignedExpertId) && (
                            <div className="mb-4 animate-bounce">
                                <button 
                                    onClick={() => setSelectedBroadcastForOffers(broadcasts.find(b => b.problemSummary === activeProject.summary) || null)}
                                    className="w-full bg-emerald-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-3"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    View Expert Offers ({broadcasts.find(b => b.problemSummary === activeProject.summary)?.offers.length})
                                </button>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mb-4">
                            <button onClick={() => setIsCameraOpen(true)} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 transition-all shadow-sm">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                              Snapshot
                            </button>
                            <button onClick={() => setIsDrivePickerOpen(true)} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 transition-all shadow-sm">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              Vault Access
                            </button>
                            <button onClick={() => { setImageToEdit(undefined); setIsWhiteboardOpen(true); }} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 transition-all shadow-sm">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Workbench
                            </button>
                            <button onClick={handleStartLiveAI} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              Visual Intelligence
                            </button>
                            <button onClick={handleBroadcast} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              Broadcast
                            </button>
                          </div>

                          <div className="flex gap-3 bg-white p-3 rounded-[2.5rem] shadow-xl border border-slate-200">
                             <input 
                               value={inputText} 
                               onChange={e => setInputText(e.target.value)} 
                               onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                               className="flex-1 px-6 py-3 text-sm focus:outline-none font-medium" 
                               placeholder="Consult AI link (Try: 'Show me a design for my deck')..." 
                             />
                             <button onClick={() => handleSendMessage()} className="bg-indigo-600 text-white px-8 py-3 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all">Consult</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Rest of component stays the same */}
                    {activeProjectTab === 'expert' && (
                      <div className="h-full flex flex-col">
                        {!activeProject.assignedProId ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-amber-50 p-6 rounded-full text-amber-600 mb-2">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-800">No Professional Attached</h3>
                            <button onClick={handleBroadcast} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">Broadcast Signal</button>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col h-full">
                             <div ref={scrollRef} className="flex-1 space-y-6 pb-20 overflow-y-auto p-8">
                                {activeProject?.expertMessages.map(msg => (
                                  <div key={msg.id} className={`flex ${msg.role === (userRole === 'client' ? 'user' : 'expert') ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm ${msg.role === (userRole === 'client' ? 'user' : 'expert') ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-emerald-50 text-slate-800 rounded-tl-none border border-emerald-100'}`}>
                                      <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${msg.role === (userRole === 'client' ? 'user' : 'expert') ? 'text-indigo-200' : 'text-emerald-600'}`}>
                                        {msg.role === 'user' ? 'Client' : msg.expertName}
                                      </div>
                                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                    </div>
                                  </div>
                                ))}
                             </div>
                             <div className="pt-4 border-t flex gap-3 mt-auto p-8 bg-slate-50/30">
                                <input 
                                  value={inputText} 
                                  onChange={e => setInputText(e.target.value)} 
                                  onKeyPress={e => e.key === 'Enter' && handleExpertMessage(inputText)}
                                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-3 text-sm focus:outline-none" 
                                  placeholder={userRole === 'expert' ? 'Message client...' : `Message ${activeProject.assignedProName}...`} 
                                />
                                <button onClick={() => handleExpertMessage(inputText)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Send</button>
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeProjectTab === 'vault' && (
                      <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto">
                        <div className="col-span-full mb-2 border-b pb-2"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Context Assets</h4></div>
                        {activeProject?.media.map(m => (
                          <div key={m.id} className="group bg-slate-50 rounded-3xl p-3 border border-slate-100 hover:shadow-xl transition-all cursor-zoom-in">
                            <img src={m.url} className="w-full h-32 object-cover rounded-2xl mb-3" alt={m.name} />
                            <p className="text-[10px] font-black text-slate-700 truncate px-1">{m.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
                  <div className="bg-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl">B</div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Initialize Project Vault</h3>
                  <div className="w-full flex gap-3 bg-white p-4 rounded-[3rem] shadow-2xl border border-slate-100 max-w-xl mx-auto">
                    <input 
                      autoFocus
                      value={inputText} 
                      onChange={e => setInputText(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-6 py-4 text-sm focus:outline-none font-medium" 
                      placeholder="e.g. 'I'm building a custom workbench...'" 
                    />
                    <button onClick={() => handleSendMessage()} className="bg-indigo-600 text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100">Start</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === AppView.PROJECT_VAULT && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => { setActiveProjectId(p.id); setCurrentView(AppView.WORKSPACE); setActiveProjectTab('ai'); }}
                  className="bg-white p-10 rounded-[3rem] border border-slate-200 text-left hover:border-indigo-400 hover:shadow-2xl transition-all group h-[320px] flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700`}>{p.status}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.lastUpdated}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 line-clamp-2">{p.title}</h3>
                  <p className="text-slate-500 text-sm italic line-clamp-2 mb-auto">"{p.summary}"</p>
                  <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8 pt-8 border-t border-slate-50">
                    <span>{p.aiMessages.length} AI Logs</span>
                    <span>{p.media.length} Assets</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentView === AppView.EXPERT_PROJECTS && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.filter(p => p.assignedProId === currentExpert.id).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => { setActiveProjectId(p.id); setCurrentView(AppView.WORKSPACE); setActiveProjectTab('expert'); }}
                  className="bg-white p-10 rounded-[3rem] border-2 border-emerald-100 text-left hover:border-emerald-400 hover:shadow-2xl transition-all group h-[320px] flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">Client Build</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.lastUpdated}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 line-clamp-2">{p.title}</h3>
                  <p className="text-slate-500 text-sm italic line-clamp-2 mb-auto">Client: Sarah Jenkins</p>
                  <div className="flex gap-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-8 pt-8 border-t border-emerald-50">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Open Chat</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentView === AppView.EXPERT_POOL && <ExpertDashboard requests={broadcasts} onOfferHelp={handleExpertOffer} />}
          {currentView === AppView.LOCAL_EXPERTS && <LocalExpertsList />}
          {currentView === AppView.BUILDERS_WALL && <BuildersWall />}
          {currentView === AppView.PORTFOLIO && <ProfileView pro={pros[0]} onEdit={() => {}} />}
        </div>
      </main>

      {isWhiteboardOpen && (
        <Whiteboard 
          onClose={() => { setIsWhiteboardOpen(false); setImageToEdit(undefined); }} 
          onSendToAI={(snap, p) => { setIsWhiteboardOpen(false); handleSendMessage(p, snap); }} 
          initialImage={imageToEdit}
        />
      )}
      {isDrivePickerOpen && <GoogleDrivePicker onClose={() => setIsDrivePickerOpen(false)} onSelect={(f) => { setPendingFiles(f); setIsDrivePickerOpen(false); }} />}
      {isCameraOpen && (
        <CameraCapture 
          onClose={() => setIsCameraOpen(false)} 
          onCapturePhoto={(snap) => { setIsCameraOpen(false); setPendingSnapshot(snap); }}
          onEditPhoto={(snap) => { setIsCameraOpen(false); setImageToEdit(snap); setIsWhiteboardOpen(true); }}
        />
      )}
      
      {isLiveActive && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in duration-500">
           <div className="relative flex-1">
              <video ref={liveVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
              
              <div className="absolute top-8 left-8 flex items-center gap-4">
                 <div className="bg-red-500 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Live AI Supervision
                 </div>
                 <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                    Context Aware Mode
                 </div>
              </div>

              <div className="absolute bottom-32 left-8 right-8 text-center">
                 <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 max-w-3xl mx-auto shadow-2xl">
                    <p className="text-white text-xl font-medium leading-relaxed italic animate-in slide-in-from-bottom-2 duration-700">
                       {liveTranscription || "Connecting neural link to project vault..."}
                    </p>
                 </div>
              </div>

              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
                 <button 
                  onClick={handleStopLiveAI}
                  className="bg-white/10 hover:bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center transition-all border border-white/20 group"
                 >
                    <svg className="w-8 h-8 group-hover:scale-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1.5 h-8 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {selectedBroadcastForOffers && (
        <MultiOfferModal 
            broadcast={selectedBroadcastForOffers}
            pros={pros.filter(p => selectedBroadcastForOffers.offers.includes(p.id))}
            onClose={() => setSelectedBroadcastForOffers(null)}
            onApprove={handleClientApproveOffer}
        />
      )}
    </div>
  );
};

export default App;
