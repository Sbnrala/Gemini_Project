import React, { useState, useEffect, useRef } from 'react';
import { AppView, Professional, Project, ChatMessage, DriveFile, BroadcastRequest, Collection, Invoice, WallPost, SavedCard, BankAccount, ProjectMedia, WallComment, Review } from './types';
import { MOCK_PROS, INITIAL_PROJECTS, MOCK_WALL_POSTS } from './constants';
import { Whiteboard } from './components/Whiteboard';
import { GoogleDrivePicker } from './components/GoogleDrivePicker';
import { CameraCapture } from './components/CameraCapture';
import { ExpertDashboard } from './components/ExpertDashboard';
import { BuildersWall } from './components/BuildersWall';
import { LocalExpertsList } from './components/LocalExpertsList';
import { ProfileView } from './components/ProfileView';
import { ProfileEditView } from './components/ProfileEditView';
import { ClientSettingsView } from './components/ClientSettingsView';
import { InvoiceModal } from './components/InvoiceModal';
import { MultiOfferModal } from './components/MultiOfferModal';
import { ReviewModal } from './components/ReviewModal';
import { ReloadCreditsModal } from './components/ReloadCreditsModal';
import { AuthView } from './components/AuthView';
import { geminiService } from './services/geminiService';
import { LiveCallSession } from './services/liveService';

interface AppNotification {
  id: string;
  message: string;
  type: 'offer' | 'info' | 'success';
}

const CREDIT_TO_USD_RATE = 0.5;

export const WALLPAPER_PRESETS = [
  { id: 'none', name: 'Clean Slate', class: 'bg-slate-50' },
  { id: 'mint', name: 'Mint Morning', class: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white' },
  { id: 'peach', name: 'Peach Sunset', class: 'bg-gradient-to-br from-orange-50 via-rose-50 to-white' },
  { id: 'lavender', name: 'Lavender Mist', class: 'bg-gradient-to-br from-violet-50 via-indigo-50 to-white' },
  { id: 'sky', name: 'Daydream Blue', class: 'bg-gradient-to-br from-sky-50 via-blue-50 to-white' },
  { id: 'mesh', name: 'Neural Pastel', class: 'bg-[radial-gradient(circle_at_50%_50%,rgba(254,244,255,1)_0%,rgba(240,249,255,1)_100%)]' },
  { id: 'grid', name: 'Architect Grid', class: 'bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]' },
  { id: 'dots', name: 'Draft Dots', class: 'bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]' },
  { id: 'herringbone', name: 'Tiled Slate', class: 'bg-slate-50 opacity-80 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#f1f5f9_20px,#f1f5f9_40px)]' }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('buildsync_v15_auth') === 'true';
  });
  const [userRole, setUserRole] = useState<'client' | 'expert'>(() => {
    return (localStorage.getItem('buildsync_v15_role') as any) || 'client';
  });
  const [currentView, setCurrentView] = useState<AppView>(AppView.WORKSPACE);
  
  // Base states for wallpaper. Will be synchronized per user in useEffect.
  const [wallpaperId, setWallpaperId] = useState<string>('mesh');
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);
  
  // Identity States
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('buildsync_v15_username') || 'Sarah Jenkins';
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('buildsync_v15_avatar') || 'https://picsum.photos/seed/sarah/100/100';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    const saved = localStorage.getItem('buildsync_v15_email');
    return saved !== null ? saved : 'sarah.jenkins@buildsync.com';
  });

  const [userPhone, setUserPhone] = useState<string>(() => {
    const saved = localStorage.getItem('buildsync_v15_phone');
    return saved !== null ? saved : '';
  });

  // Unique key identifier for the current account to isolate settings
  const userAccountKey = userEmail || userPhone || 'default';

  // PERSISTENCE ENGINE v15
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('buildsync_v15_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [broadcasts, setBroadcasts] = useState<BroadcastRequest[]>(() => {
    const saved = localStorage.getItem('buildsync_v15_broadcasts');
    return saved ? JSON.parse(saved) : []; 
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('buildsync_v15_collections');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'General Builds', postIds: [] }];
  });

  const [savedCards, setSavedCards] = useState<SavedCard[]>(() => {
    const saved = localStorage.getItem('buildsync_v15_cards');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', brand: 'visa', last4: '4242', expiry: '12/25', isDefault: true, nickname: 'Main Workspace Card' },
      { id: 'c2', brand: 'mastercard', last4: '8812', expiry: '08/24', isDefault: false, nickname: 'Supplies Card' }
    ];
  });

  const [bankAccount, setBankAccount] = useState<BankAccount | null>(() => {
    const saved = localStorage.getItem('buildsync_v15_bank');
    return saved ? JSON.parse(saved) : null;
  });

  const [wallPosts, setWallPosts] = useState<WallPost[]>(() => {
    const saved = localStorage.getItem('buildsync_v15_wallposts');
    return saved ? JSON.parse(saved) : MOCK_WALL_POSTS;
  });

  const [myExpertProfile, setMyExpertProfile] = useState<Professional>(() => {
    const saved = localStorage.getItem('buildsync_v15_expert_profile');
    return saved ? JSON.parse(saved) : MOCK_PROS[0]; 
  });

  const [userLocation, setUserLocation] = useState<{country: string, city: string, region: string}>(() => {
    const saved = localStorage.getItem('buildsync_v15_location');
    return saved ? JSON.parse(saved) : { country: 'United States', city: 'Seattle', region: 'Washington' };
  });

  const [userCredits, setUserCredits] = useState<number>(() => {
    return Number(localStorage.getItem('buildsync_v15_credits')) || 0;
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Professional | null>(null);
  
  // Settings State
  const [isLocked, setIsLocked] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState([true, false, true, true]);

  // UI States
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeProjectTab, setActiveProjectTab] = useState<'ai' | 'expert' | 'vault' | 'summaries'>('ai');
  const [isEditingMyProfile, setIsEditingMyProfile] = useState(false);
  
  // Tool States
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [livePersona, setLivePersona] = useState<'ai' | 'expert'>('ai');
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReloadModalOpen, setIsReloadModalOpen] = useState(false);
  const [offerBroadcastId, setOfferBroadcastId] = useState<string | null>(null);
  const [pendingSnapshot, setPendingSnapshot] = useState<string | undefined>(undefined);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const liveSessionRef = useRef<LiveCallSession | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Load account-specific wallpaper when user identity changes
  useEffect(() => {
    if (isAuthenticated) {
      const savedWpId = localStorage.getItem(`buildsync_v15_${userAccountKey}_wallpaper`);
      setWallpaperId(savedWpId || 'mesh');
      const savedCustom = localStorage.getItem(`buildsync_v15_${userAccountKey}_custom_wallpaper`);
      setCustomWallpaper(savedCustom);
    }
  }, [isAuthenticated, userAccountKey]);

  // Save account-specific wallpaper when it changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(`buildsync_v15_${userAccountKey}_wallpaper`, wallpaperId);
    }
  }, [wallpaperId, isAuthenticated, userAccountKey]);

  useEffect(() => {
    if (isAuthenticated) {
      if (customWallpaper) {
        localStorage.setItem(`buildsync_v15_${userAccountKey}_custom_wallpaper`, customWallpaper);
      } else {
        localStorage.removeItem(`buildsync_v15_${userAccountKey}_custom_wallpaper`);
      }
    }
  }, [customWallpaper, isAuthenticated, userAccountKey]);

  // Mandatory Persistence Sync (Global settings that are non-user specific for this demo shell)
  useEffect(() => { localStorage.setItem('buildsync_v15_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('buildsync_v15_broadcasts', JSON.stringify(broadcasts)); }, [broadcasts]);
  useEffect(() => { localStorage.setItem('buildsync_v15_collections', JSON.stringify(collections)); }, [collections]);
  useEffect(() => { localStorage.setItem('buildsync_v15_cards', JSON.stringify(savedCards)); }, [savedCards]);
  useEffect(() => { localStorage.setItem('buildsync_v15_bank', JSON.stringify(bankAccount)); }, [bankAccount]);
  useEffect(() => { localStorage.setItem('buildsync_v15_wallposts', JSON.stringify(wallPosts)); }, [wallPosts]);
  useEffect(() => { localStorage.setItem('buildsync_v15_expert_profile', JSON.stringify(myExpertProfile)); }, [myExpertProfile]);
  useEffect(() => { localStorage.setItem('buildsync_v15_username', userName); }, [userName]);
  useEffect(() => { localStorage.setItem('buildsync_v15_avatar', userAvatar); }, [userAvatar]);
  useEffect(() => { localStorage.setItem('buildsync_v15_email', userEmail); }, [userEmail]);
  useEffect(() => { localStorage.setItem('buildsync_v15_phone', userPhone); }, [userPhone]);
  useEffect(() => { localStorage.setItem('buildsync_v15_location', JSON.stringify(userLocation)); }, [userLocation]);
  useEffect(() => { localStorage.setItem('buildsync_v15_credits', userCredits.toString()); }, [userCredits]);
  useEffect(() => { localStorage.setItem('buildsync_v15_auth', isAuthenticated.toString()); }, [isAuthenticated]);
  useEffect(() => { localStorage.setItem('buildsync_v15_role', userRole); }, [userRole]);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } catch (e) { setHasApiKey(false); }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  const handleLogin = (
    name: string, 
    role: 'client' | 'expert', 
    isRegistering?: boolean,
    regData?: {
      identifier: string;
      location?: { country: string; region: string; city: string };
      card?: { number: string; expiry: string; cvv: string; nameOnCard: string; zipCode: string };
      proData?: {
        specialty: string;
        category: any;
        experience: string;
        hourlyRate: string;
        bio: string;
        skills: string[];
      };
      subscription?: string;
    }
  ) => {
    setUserName(name);
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentView(role === 'client' ? AppView.WORKSPACE : AppView.EXPERT_POOL);

    if (role === 'expert') {
       if (isRegistering && regData?.proData) {
         const newExpertProfile: Professional = {
           id: `expert-${Date.now()}`, 
           name: name,
           specialty: regData.proData.specialty,
           category: regData.proData.category,
           rating: 0,
           reviewCount: 0,
           experience: regData.proData.experience,
           location: regData.location ? `${regData.location.city}, ${regData.location.country}` : 'Unknown',
           avatar: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/200/200`,
           bio: regData.proData.bio,
           skills: regData.proData.skills,
           portfolio: [],
           hourlyRate: regData.proData.hourlyRate,
           availability: 'Available Now',
           reviews: []
         };
         setMyExpertProfile(newExpertProfile);
       } else {
         setMyExpertProfile(prev => ({ ...prev, name: name }));
       }
    }

    if (regData) {
      const iden = regData.identifier;
      if (iden.includes('@')) {
        setUserEmail(iden);
        setUserPhone(''); 
      } else {
        setUserPhone(iden);
        setUserEmail(''); 
      }

      if (regData.location) {
        setUserLocation(regData.location);
      }
    }
    
    if (isRegistering && regData && regData.card) {
      const newCard: SavedCard = {
        id: `c-reg-${Date.now()}`,
        brand: 'visa',
        last4: regData.card.number.replace(/\s/g, '').slice(-4),
        expiry: regData.card.expiry,
        isDefault: true,
        nickname: role === 'expert' ? 'Professional Payout Card' : 'Default Build Card'
      };
      setSavedCards([newCard]);
      if (role === 'client') {
        setUserCredits(50);
        addNotification("Welcome bonus! 50 BuildSync credits added.", "success");
      }
      addNotification("Registration finalized. Secure payment link established.", "success");
    } else {
      addNotification(`Welcome back, ${name}. Link established.`, "success");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveProjectId(null);
    setCurrentView(AppView.WORKSPACE);
    addNotification("Neural Link terminated.", "info");
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeProject, isTyping, activeProjectTab]);

  const addNotification = (message: string, type: AppNotification['type']) => {
    const note = { id: Date.now().toString(), message, type };
    setNotifications(prev => [...prev, note]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== note.id)), 5000);
  };

  const handleSendMessage = async (text: string = inputText, imageBase64?: string) => {
    if (!hasApiKey) {
      handleSelectKey();
      return;
    }

    const finalImage = imageBase64 || pendingSnapshot;
    if (!text.trim() && !finalImage) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: userRole === 'client' ? 'user' : 'expert', 
      text, 
      canvasSnapshot: finalImage 
    };

    let targetId = activeProjectId;
    if (!targetId) {
      targetId = `proj-${Date.now()}`;
      const newProject: Project = {
        id: targetId, title: text.slice(0, 25) + '...', status: 'planning', lastUpdated: 'Just now', summary: text,
        aiMessages: [userMsg], expertMessages: [], media: [], files: [], summaries: []
      };
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(targetId);
      setCurrentView(AppView.WORKSPACE);
    } else {
      setProjects(prev => prev.map(p => p.id === targetId ? {
        ...p,
        aiMessages: activeProjectTab === 'ai' ? [...p.aiMessages, userMsg] : p.aiMessages,
        expertMessages: activeProjectTab === 'expert' ? [...p.expertMessages, userMsg] : p.expertMessages,
      } : p));
    }

    if (activeProjectTab === 'ai' || !activeProjectId) {
      setIsTyping(true);
      try {
        const response = await geminiService.getDIYAdvice(text, activeProject?.summary, finalImage);
        const aiMsg: ChatMessage = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: response.text,
          generatedImages: response.images,
          groundingSources: response.groundingSources
        };
        setProjects(prev => prev.map(p => p.id === targetId ? { ...p, aiMessages: [...p.aiMessages, aiMsg] } : p));
      } catch (e) { 
        if (e instanceof Error && e.message.includes("Requested entity was not found")) {
          setHasApiKey(false);
          addNotification("Neural bridge session lost. Please re-connect.", "info");
        } else {
          addNotification("AI Bridge communication error.", "info"); 
        }
      } finally { setIsTyping(false); }
    }

    setInputText('');
    setPendingSnapshot(undefined);
  };

  const handleReconnectExpert = () => {
    if (activeProject && activeProject.status === 'completed' && activeProject.assignedProId) {
      setProjects(prev => prev.map(p => p.id === activeProjectId ? {
        ...p,
        status: 'in-progress',
        assignedProId: p.assignedProId,
        assignedProName: p.assignedProName,
        expertMessages: [...p.expertMessages, {
          id: `sys-${Date.now()}`,
          role: 'system_summary',
          text: `Signal re-established with ${p.assignedProName}. Project reactivated for ongoing collaboration.`
        }]
      } : p));
      addNotification(`Reconnected with ${activeProject.assignedProName}`, "success");
      setActiveProjectTab('expert');
    }
  };

  const handleCreateBroadcast = () => {
    if (activeProject && activeProject.status === 'completed' && activeProject.assignedProId) {
      handleReconnectExpert();
      return;
    }
    const summary = inputText || activeProject?.summary || "General Build Inquiry";
    const newBroadcast: BroadcastRequest = {
      id: `br-${Date.now()}`,
      clientId: 'sarah-123',
      clientName: userName,
      problemSummary: summary,
      category: 'General',
      timestamp: 'Just now',
      status: 'open',
      offers: [],
      urgency: 'medium'
    };
    setBroadcasts(prev => [newBroadcast, ...prev]);
    setActiveProjectTab('expert');
    setInputText('');
    addNotification("Help signal broadcasted to Expert Network. Network listening...", "success");
  };

  const handleExpertOffer = (req: BroadcastRequest) => {
    setBroadcasts(prev => prev.map(r => r.id === req.id ? {
      ...r, 
      status: 'offer_received',
      offers: [...r.offers, 'expert-1'] 
    } : r));
    addNotification(`Offer sent to ${req.clientName}`, "success");
  };

  const handleApproveExpert = (req: BroadcastRequest | null, expert: Professional) => {
    const targetProjId = activeProjectId || `proj-${Date.now()}`;
    const projectExists = projects.some(p => p.id === targetProjId);
    
    if (projectExists) {
      setProjects(prev => prev.map(p => p.id === targetProjId ? {
        ...p,
        status: 'in-progress',
        assignedProId: expert.id,
        assignedProName: expert.name,
        expertMessages: [...p.expertMessages, {
          id: `sys-${Date.now()}`,
          role: 'system_summary',
          text: `Expert ${expert.name} has joined the link. Initial project context transmitted.`
        }]
      } : p));
    } else {
      const summary = req?.problemSummary || "Direct Expert Collaboration";
      const newProj: Project = {
        id: targetProjId,
        title: summary.slice(0, 20) + "...",
        status: 'in-progress',
        lastUpdated: 'Just now',
        summary: summary,
        aiMessages: [],
        expertMessages: [{
          id: `sys-${Date.now()}`,
          role: 'system_summary',
          text: `Expert ${expert.name} has joined the link. Match finalized.`
        }],
        media: [],
        files: [],
        summaries: [],
        assignedProId: expert.id,
        assignedProName: expert.name
      };
      setProjects(prev => [newProj, ...prev]);
      setActiveProjectId(targetProjId);
    }
    
    if (req) {
      setBroadcasts(prev => prev.filter(b => b.id !== req.id));
    }
    setOfferBroadcastId(null);
    setCurrentView(AppView.WORKSPACE);
    setActiveProjectTab('expert');
    addNotification(`Linked with ${expert.name}. Expert Signal established.`, "success");
  };

  const handleSendInvoice = (inv: Omit<Invoice, 'id' | 'status' | 'createdAt'>) => {
    const newInvoice: Invoice = { ...inv, id: `inv-${Date.now()}`, status: 'pending', createdAt: new Date().toLocaleDateString() };
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, invoice: newInvoice } : p));
    addNotification("Invoice transmitted to client.", "success");
    setIsInvoiceModalOpen(false);
  };

  const handlePayInvoice = () => {
    if (!activeProject?.invoice) return;
    const invoiceAmount = activeProject.invoice.amount;
    const creditDollarValue = userCredits * 0.5;
    let creditsUsed = 0;
    let finalChargeToCard = 0;

    if (creditDollarValue >= invoiceAmount) {
      creditsUsed = Math.ceil(invoiceAmount / 0.5);
      finalChargeToCard = 0;
    } else {
      creditsUsed = userCredits;
      finalChargeToCard = invoiceAmount - creditDollarValue;
    }

    setUserCredits(prev => prev - creditsUsed);
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { 
      ...p, 
      invoice: p.invoice ? { ...p.invoice, status: 'paid' } : undefined,
      expertMessages: [...p.expertMessages, {
        id: `sys-pay-${Date.now()}`,
        role: 'system_summary',
        text: `Invoice Paid. Breakdown: $${(creditsUsed * 0.5).toFixed(2)} applied from BuildSync credits (${creditsUsed} credits), and $${finalChargeToCard.toFixed(2)} charged to your default card.`
      }]
    } : p));

    addNotification(
      finalChargeToCard > 0 
        ? `Paid with ${creditsUsed} credits + $${finalChargeToCard.toFixed(2)} on card.`
        : `Full payment covered by ${creditsUsed} BuildSync credits.`, 
      "success"
    );
  };

  const handleReloadCredits = (credits: number, cost: number) => {
    setUserCredits(prev => prev + credits);
    setIsReloadModalOpen(false);
    addNotification(`Payment Approved. ${credits} credits added to your Neural Hub.`, "success");
  };

  const handleResolveProject = () => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, status: 'completed' } : p));
    if (userRole === 'client' && activeProject?.assignedProId) {
      setIsReviewModalOpen(true);
    } else {
      setActiveProjectTab('summaries');
      addNotification("Project marked as done and archived.", "success");
    }
  };

  const handleReviewSubmit = (reviewData: any) => {
    const newReview: Review = {
      id: `rev-plt-${Date.now()}`,
      reviewerName: userName,
      reviewerAvatar: userAvatar,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: 'Just now',
      aspects: reviewData.aspects
    };

    if (activeProject?.assignedProId === 'expert-1') {
      setMyExpertProfile(prev => ({
        ...prev,
        pendingReviews: [...(prev.pendingReviews || []), newReview]
      }));
    }
    setIsReviewModalOpen(false);
    setActiveProjectTab('summaries');
    addNotification("Feedback transmitted. Thank you for building with us!", "success");
  };

  const handleApproveReview = (reviewId: string) => {
    setMyExpertProfile(prev => {
      const review = prev.pendingReviews?.find(r => r.id === reviewId);
      if (!review) return prev;
      const newReviewCount = prev.reviewCount + 1;
      const newRating = parseFloat(((prev.rating * prev.reviewCount + review.rating) / newReviewCount).toFixed(1));
      return {
        ...prev,
        reviews: [review, ...prev.reviews],
        pendingReviews: prev.pendingReviews?.filter(r => r.id !== reviewId),
        reviewCount: newReviewCount,
        rating: newRating
      };
    });
    addNotification("Review approved and added to your public profile.", "success");
  };

  const handleDiscardReview = (reviewId: string) => {
    setMyExpertProfile(prev => ({
      ...prev,
      pendingReviews: prev.pendingReviews?.filter(r => r.id !== reviewId)
    }));
    addNotification("Review discarded.", "info");
  };

  const handleSavePost = (postId: string, collectionId: string) => {
    setCollections(prev => prev.map(c => {
      if (c.id === collectionId) {
        if (c.postIds.includes(postId)) return c;
        return { ...c, postIds: [...c.postIds, postId] };
      }
      return c;
    }));
    addNotification("Achievement saved to Hub.", "success");
  };

  const handleCreateCollection = (name: string, autoSavePostId?: string) => {
    const newId = `coll-${Date.now()}`;
    const newColl: Collection = { id: newId, name, postIds: autoSavePostId ? [autoSavePostId] : [] };
    setCollections(prev => [...prev, newColl]);
    addNotification(`Archive '${name}' created.`, "success");
    return newId;
  };

  const handleAddWallPost = (content: string, image?: string, video?: string) => {
    const newPost: WallPost = {
      id: `wall-${Date.now()}`,
      authorName: userName,
      authorAvatar: userAvatar,
      content,
      image,
      video,
      likes: 0,
      timestamp: 'Just now',
      tags: ['#new-build', '#neural-update'],
      comments: []
    };
    setWallPosts(prev => [newPost, ...prev]);
    addNotification("Neural post shared to Builders Wall.", "success");
  };

  const handleLikePost = (postId: string) => {
    setWallPosts(prev => prev.map(p => {
      if (p.id === postId) {
        if (userRole === 'client') {
            const isLiked = !!p.likedByClient;
            return { ...p, likedByClient: !isLiked, likes: isLiked ? p.likes - 1 : p.likes + 1 };
        } else {
            const isLiked = !!p.likedByExpert;
            return { ...p, likedByExpert: !isLiked, likes: isLiked ? p.likes - 1 : p.likes + 1 };
        }
      }
      return p;
    }));
  };

  const handleAddWallComment = (postId: string, commentText: string) => {
    const newComment: WallComment = {
      id: `comm-${Date.now()}`,
      authorName: userName,
      authorAvatar: userAvatar,
      content: commentText,
      timestamp: 'Just now'
    };
    setWallPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
  };

  const handleViewWallProfile = (authorName: string) => {
    const expert = MOCK_PROS.find(p => p.name === authorName);
    if (expert) {
      setSelectedExpert(expert);
      setActiveProjectId(null);
      addNotification(`Viewing ${expert.name}'s profile.`, "info");
    } else if (authorName === userName || (userRole === 'expert' && authorName === myExpertProfile.name)) {
      setCurrentView(userRole === 'client' ? AppView.SETTINGS : AppView.EXPERT_PROFILE);
      setActiveProjectId(null);
    } else {
      addNotification(`Public profile for ${authorName} coming soon.`, "info");
    }
  };

  const startLiveSession = async (audioOnly: boolean = false, isScreen: boolean = false, persona: 'ai' | 'expert' = 'ai') => {
    if (isLiveActive) return;
    let finalStream: MediaStream | undefined;
    if (isScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        finalStream = new MediaStream([...screenStream.getVideoTracks(), ...voiceStream.getAudioTracks()]);
        addNotification("Neural Screen Link established.", "success");
      } catch (e) { addNotification("Screen capture authorization denied.", "info"); return; }
    }
    setIsLiveActive(true);
    setLivePersona(persona);
    setIsAudioOnly(audioOnly);
    setLiveTranscription('');
    const session = new LiveCallSession();
    liveSessionRef.current = session;
    setTimeout(async () => {
      await session.start(
        { onMessage: (msg) => setLiveTranscription(prev => prev + ' ' + msg), onClose: () => setIsLiveActive(false) }, 
        liveVideoRef.current || undefined, 
        activeProject?.summary, 
        finalStream, 
        audioOnly,
        persona
      );
    }, 150);
  };

  const stopLiveSession = () => {
    liveSessionRef.current?.stop();
    setIsLiveActive(false);
    liveSessionRef.current = null;
  };

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const type = file.type.startsWith('video') ? 'video' : 'photo';
      const newMedia: ProjectMedia = {
        id: Date.now().toString(),
        url,
        type: type as any,
        name: file.name,
        timestamp: 'Just now'
      };
      if (activeProjectId) {
        setProjects(prev => prev.map(p => p.id === activeProjectId ? {
          ...p,
          media: [...p.media, newMedia]
        } : p));
        addNotification(`${type === 'video' ? 'Video' : 'Photo'} saved to Site Data.`, "success");
      } else {
        const newId = `proj-${Date.now()}`;
        const newProj: Project = {
          id: newId, title: `Upload: ${file.name.slice(0, 15)}...`, status: 'planning', lastUpdated: 'Just now', summary: `Project initiated via ${type} upload. Material analysis pending.`,
          aiMessages: [{ id: `msg-${Date.now()}`, role: 'user', text: `Analyzing uploaded ${type}: ${file.name}`, canvasSnapshot: type === 'photo' ? url : undefined }],
          expertMessages: [], media: [newMedia], files: [], summaries: []
        };
        setProjects(prev => [newProj, ...prev]);
        setActiveProjectId(newId);
        setCurrentView(AppView.WORKSPACE);
        addNotification(`New build initiated from ${type} upload.`, "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const SPECIAL_LABS = [
    { id: 'videos', label: 'Video Masterclass', desc: 'Find top-rated YouTube guides for assembly, building, or repairs.', prompt: 'Find the most watched YouTube videos for: ', color: 'text-rose-900', bg: 'bg-rose-100', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> },
    { id: 'wiring', label: 'Fix a Light or Switch', desc: 'Step-by-step help with light switches, outlets, and basic household wiring.', prompt: 'Help me repair specific wiring. Analyze for safety protocols and circuit logic.', color: 'text-amber-900', bg: 'bg-amber-100', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
    { id: 'leaks', label: 'Stop a Water Leak', desc: 'Quick steps to shut off water and fix leaky pipes, faucets, or common plumbing.', prompt: 'Hydraulic support needed for leak mitigation. Provide immediate shut-off and repair steps.', color: 'text-sky-900', bg: 'bg-sky-100', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.908a2 2 0 00-1.96 1.414H7.931a2 2 0 01-1.96-1.414l-.727-2.908a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547L1 17v4h22v-4l-3.572-1.572z"/></svg> },
    { id: 'assembly', label: 'Build Furniture', desc: 'Upload a photo of the parts or manual, and I will walk you through the build.', prompt: 'Analyze product manual for assembly. I will upload images of the parts and instructions.', color: 'text-emerald-900', bg: 'bg-emerald-100', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg> },
    { id: 'sourcing', label: 'Find Best Prices', desc: 'Found a price that is too high? I will find better deals for you locally.', prompt: 'Find this product at better prices. Help me source materials with high-efficiency logistics.', color: 'text-violet-900', bg: 'bg-violet-100', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg> },
    { id: 'mounting', label: 'Mount a TV or Shelf', desc: 'Expert tips for safely hanging heavy things on any type of wall.', prompt: 'Structural guidance for mounting. Analyze wall material and weight distribution.', color: 'text-blue-900', bg: 'bg-blue-100', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg> }
  ];

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  const activePreset = WALLPAPER_PRESETS.find(p => p.id === wallpaperId);
  const wallpaperClass = activePreset?.class || 'bg-slate-50';
  const customBgStyle = (wallpaperId === 'custom' && customWallpaper) 
    ? { backgroundImage: `url(${customWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  return (
    <div 
      className={`flex h-screen overflow-hidden font-sans transition-all duration-1000 ${wallpaperId !== 'custom' ? wallpaperClass : ''}`}
      style={customBgStyle}
    >
      <input type="file" ref={mediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleMediaFileChange} />
      
      {!hasApiKey && (
        <div className="fixed inset-0 z-[2000] bg-white/40 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-12 max-w-xl text-center shadow-2xl border border-slate-100 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-800 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mx-auto mb-8 shadow-xl">B</div>
            <h2 className="text-3xl font-black text-slate-950 mb-4 tracking-tight">Neural Bridge Required</h2>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed">Connect a Gemini API key from a paid GCP project to deploy BuildSync specialized visual analysis models.</p>
            <button onClick={handleSelectKey} className="w-full bg-emerald-800 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-emerald-900 transition-all hover:scale-105 active:scale-95">Connect Neural Bridge</button>
          </div>
        </div>
      )}

      {/* Navigation Sidebar */}
      <nav className="w-20 md:w-64 bg-white/70 backdrop-blur-md border-r border-slate-200 flex flex-col py-8 px-4 gap-10 shadow-sm relative z-20">
        <div onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.WORKSPACE); }} className="flex items-center gap-3 px-2 cursor-pointer group">
          <div className="bg-emerald-800 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:rotate-12 transition-all">B</div>
          <h1 className="hidden md:block font-black text-xl text-slate-950 leading-none tracking-tight">BuildSync</h1>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {userRole === 'client' ? (
            <>
              <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.WORKSPACE); }} className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${currentView === AppView.WORKSPACE && !activeProjectId ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                <span className="hidden md:block font-bold text-sm">New Build</span>
              </button>
              <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.PROJECT_VAULT); }} className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${currentView === AppView.PROJECT_VAULT ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <span className="hidden md:block font-bold text-sm">Project Vault</span>
              </button>
              <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.LOCAL_EXPERTS); }} className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${currentView === AppView.LOCAL_EXPERTS ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="hidden md:block font-bold text-sm">Expert Lab</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.EXPERT_POOL); }} className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${currentView === AppView.EXPERT_POOL ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span className="hidden md:block font-bold text-sm">Expert Pool</span>
              </button>
              <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.EXPERT_PROJECTS); }} className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${currentView === AppView.EXPERT_PROJECTS ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span className="hidden md:block font-bold text-sm">Active Jobs</span>
              </button>
              <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.EXPERT_PROFILE); setIsEditingMyProfile(false); }} className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${currentView === AppView.EXPERT_PROFILE ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="hidden md:block font-bold text-sm">My Profile</span>
              </button>
            </>
          )}
          <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.BUILDERS_WALL); }} className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${currentView === AppView.BUILDERS_WALL ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="hidden md:block font-bold text-sm">Builders Wall</span>
          </button>
        </div>

        <div className="mt-auto space-y-4">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-rose-800 hover:bg-rose-50 transition-all group">
             <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             <span className="hidden md:block font-bold text-sm">Sign Out</span>
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="bg-white/60 backdrop-blur-md border-b border-white/50 py-5 px-10 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
             {activeProjectId && (
               <button 
                  onClick={() => { setActiveProjectId(null); setCurrentView(userRole === 'client' ? AppView.PROJECT_VAULT : AppView.EXPERT_PROJECTS); }}
                  className="p-2 bg-white/80 hover:bg-white rounded-xl transition-all text-slate-800 shadow-sm mr-2 border border-slate-200"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
               </button>
             )}
             <div className="flex flex-col">
               <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase leading-none">
                 {activeProjectId ? activeProject?.title : (currentView === AppView.WORKSPACE ? "Welcome back" : currentView.replace('_', ' '))}
               </h2>
               <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mt-1">
                 {userRole === 'client' ? 'Builder Console' : 'Expert Dispatch'}
               </p>
             </div>
             {userRole === 'client' && (
               <div onClick={() => setIsReloadModalOpen(true)} className="flex items-center gap-2 bg-rose-100/80 px-4 py-1.5 rounded-full border border-rose-200 shadow-sm ml-4 cursor-pointer hover:bg-rose-200 transition-colors group">
                 <span className="text-lg">🪙</span>
                 <span className="text-xs font-black text-rose-900 uppercase tracking-widest">{userCredits} Credits</span>
                 <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest ml-1 border-l border-rose-300 pl-2">+ Reload</span>
               </div>
             )}
          </div>
          <button onClick={() => { setActiveProjectId(null); setSelectedExpert(null); setCurrentView(AppView.SETTINGS); }} className="flex items-center gap-3 hover:bg-white/80 p-2 rounded-2xl transition-all border border-transparent hover:border-slate-200">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-950">{userName}</p>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">{userRole === 'client' ? 'Community Builder' : 'Verified Expert'}</p>
             </div>
             <img src={userRole === 'client' ? userAvatar : myExpertProfile.avatar} className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm object-cover" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {currentView === AppView.SETTINGS ? (
            <ClientSettingsView 
              onBack={() => setCurrentView(userRole === 'client' ? AppView.WORKSPACE : AppView.EXPERT_POOL)} 
              onLogout={handleLogout}
              userRole={userRole} 
              isLocked={isLocked} 
              setIsLocked={setIsLocked} 
              notificationPrefs={notificationPrefs} 
              setNotificationPrefs={setNotificationPrefs} 
              collections={collections} 
              allPosts={wallPosts} 
              onCreateCollection={handleCreateCollection} 
              savedCards={savedCards} 
              setSavedCards={setSavedCards} 
              bankAccount={bankAccount} 
              setBankAccount={setBankAccount}
              userName={userName}
              setUserName={setUserName}
              userAvatar={userAvatar}
              setUserAvatar={setUserAvatar}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              userPhone={userPhone}
              setUserPhone={setUserPhone}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
              userCredits={userCredits}
              onReloadRequest={() => setIsReloadModalOpen(true)}
              wallpaperId={wallpaperId}
              onWallpaperChange={setWallpaperId}
              onCustomWallpaperChange={setCustomWallpaper}
              customWallpaper={customWallpaper}
            />
          ) : currentView === AppView.WORKSPACE ? (
            <div className="max-w-6xl mx-auto min-h-full flex flex-col items-center justify-start text-center space-y-16 animate-in fade-in duration-1000 pb-32 pt-16">
               <div className="space-y-8 max-w-5xl px-4 text-center">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter leading-tight">Dream. Build. Connect.</h2>
                  <p className="text-slate-800 text-lg md:text-xl font-medium leading-relaxed max-w-4xl mx-auto italic opacity-80">Ask for instant DIY advice, or call a pro for live help through your camera.</p>
               </div>
               <div className="w-full max-w-3xl bg-white/90 backdrop-blur-xl p-5 rounded-[4rem] shadow-2xl border border-white flex items-center gap-4 ring-[12px] ring-emerald-100/30 mb-4 mx-4">
                  <input ref={mainInputRef} value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 px-8 py-5 text-xl focus:outline-none font-medium placeholder:text-slate-400 bg-transparent text-slate-950" placeholder="What are we building today?" />
                  <div className="flex items-center gap-3">
                    <button onClick={() => mediaInputRef.current?.click()} className="p-4 rounded-full bg-slate-100 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all flex items-center justify-center group" title="Upload Photo or Video">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                    <button onClick={() => handleSendMessage()} className="bg-emerald-800 text-white px-12 py-5 rounded-[4rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-900 hover:scale-105 transition-all">Go</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl px-4">
                  {SPECIAL_LABS.map(lab => (
                    <button key={lab.id} onClick={() => { setInputText(lab.prompt); mainInputRef.current?.focus(); }} className="bg-white/80 backdrop-blur-sm border border-white p-8 rounded-[3rem] flex flex-col items-start text-left group hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${lab.bg} ${lab.color}`}>{lab.icon}</div>
                       <h4 className={`text-base font-black uppercase tracking-widest mb-2 group-hover:text-emerald-800 ${lab.color}`}>{lab.label}</h4>
                       <p className="text-xs text-slate-800 font-bold leading-relaxed opacity-60">{lab.desc}</p>
                    </button>
                  ))}
               </div>
            </div>
          ) : currentView === AppView.LOCAL_EXPERTS ? (
            selectedExpert ? (
              <ProfileView pro={selectedExpert} onBack={() => setSelectedExpert(null)} isClientViewing={true} onConnect={() => { handleApproveExpert(null, selectedExpert); setSelectedExpert(null); }} />
            ) : (
              <LocalExpertsList onCall={(pro) => handleApproveExpert(null, pro)} onViewProfile={(pro) => setSelectedExpert(pro)} userLocation={userLocation} />
            )
          ) : activeProjectId && activeProject ? (
            // Workspace Project View
            <div className="max-w-6xl mx-auto h-full flex flex-col bg-white/80 backdrop-blur-xl rounded-[4rem] border border-white overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
               <div className="bg-white/40 border-b border-white px-10 py-2 flex gap-10">
                  {(['ai', 'expert', 'vault', 'summaries'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveProjectTab(tab)} className={`text-[10px] font-black uppercase tracking-widest py-5 border-b-2 transition-all relative ${activeProjectTab === tab ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{tab === 'ai' ? 'Neural Link' : tab === 'expert' ? 'Expert Signal' : tab === 'vault' ? 'Site Data' : 'Milestones'}</button>
                  ))}
               </div>
               <div className="flex-1 flex flex-col relative overflow-hidden">
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-10">
                    {activeProjectTab === 'ai' || activeProjectTab === 'expert' ? (
                      <div className="space-y-12">
                        {(activeProjectTab === 'ai' ? activeProject.aiMessages : activeProject.expertMessages).map(msg => {
                          const isMe = msg.role === (userRole === 'client' ? 'user' : 'expert');
                          if (msg.role === 'system_summary') return (
                            <div key={msg.id} className="max-w-2xl mx-auto bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl text-center shadow-sm">
                              <p className="text-xs text-emerald-950 font-bold leading-relaxed">{msg.text}</p>
                            </div>
                          );
                          return (
                            <div key={msg.id} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                               <img src={isMe ? (userRole === 'client' ? userAvatar : myExpertProfile.avatar) : (activeProjectTab === 'ai' ? 'https://picsum.photos/seed/ai/100/100' : 'https://picsum.photos/seed/marcus/100/100')} className="w-10 h-10 rounded-2xl border-2 border-white shadow-md flex-shrink-0 mt-1 object-cover" />
                               <div className={`max-w-[75%] p-8 rounded-[3rem] shadow-sm ${isMe ? 'bg-emerald-800 text-white rounded-tr-none' : 'bg-white text-slate-950 rounded-tl-none border border-slate-100'}`}>
                                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                  {msg.canvasSnapshot && <img src={msg.canvasSnapshot} className="mt-6 rounded-3xl max-h-72 border border-white/20 shadow-lg" />}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  {(activeProjectTab === 'ai' || activeProjectTab === 'expert') && (
                    <div className="p-8 border-t border-white/50 bg-white/30 backdrop-blur-md space-y-4">
                      <div className="flex gap-4 bg-white p-4 rounded-[4rem] shadow-2xl border border-slate-100">
                         <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 px-8 py-4 text-base focus:outline-none font-medium text-slate-950 bg-transparent placeholder:text-slate-400" placeholder="Send message..." />
                         <button onClick={() => handleSendMessage()} className="bg-emerald-800 text-white px-10 py-4 rounded-[4rem] font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-emerald-900 transition-all">Transmit</button>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          ) : currentView === AppView.BUILDERS_WALL ? (
            <BuildersWall userRole={userRole} wallPosts={wallPosts} onAddPost={handleAddWallPost} collections={collections} onSavePost={handleSavePost} onCreateCollection={handleCreateCollection} onLikePost={handleLikePost} onAddComment={handleAddWallComment} onViewProfile={handleViewWallProfile} />
          ) : currentView === AppView.PROJECT_VAULT ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {projects.map(p => (<div key={p.id} onClick={() => { setActiveProjectId(p.id); setCurrentView(AppView.WORKSPACE); }} className="bg-white/80 backdrop-blur-sm p-12 rounded-[4rem] border border-white shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-3 duration-500"><span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 inline-block shadow-sm ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>{p.status}</span><h3 className="text-3xl font-black text-slate-950 mb-6 tracking-tighter group-hover:text-emerald-800">{p.title}</h3><p className="text-base text-slate-800 line-clamp-2 leading-relaxed font-medium opacity-60">{p.summary}</p></div>))}
            </div>
          ) : currentView === AppView.EXPERT_POOL ? (
            <ExpertDashboard requests={broadcasts} onOfferHelp={handleExpertOffer} />
          ) : currentView === AppView.EXPERT_PROFILE ? (
             isEditingMyProfile ? (
              <ProfileEditView pro={myExpertProfile} onSave={(updated) => { setMyExpertProfile(updated); setIsEditingMyProfile(false); addNotification("Profile updated.", "success"); }} onCancel={() => setIsEditingMyProfile(false)} />
            ) : (
              <ProfileView pro={myExpertProfile} onEdit={() => setIsEditingMyProfile(true)} isClientViewing={false} onApproveReview={handleApproveReview} onDiscardReview={handleDiscardReview} />
            )
          ) : null}
        </div>
      </main>

      {/* Modals & Overlays */}
      {isReloadModalOpen && <ReloadCreditsModal onClose={() => setIsReloadModalOpen(false)} savedCards={savedCards} onSuccess={handleReloadCredits} />}
      {offerBroadcastId && <MultiOfferModal broadcast={broadcasts.find(b => b.id === offerBroadcastId)!} pros={MOCK_PROS.filter(p => broadcasts.find(b => b.id === offerBroadcastId)?.offers.includes(p.id))} onClose={() => setOfferBroadcastId(null)} onApprove={handleApproveExpert} />}
      {isReviewModalOpen && activeProject && <ReviewModal project={activeProject} pro={MOCK_PROS.find(p => p.id === activeProject.assignedProId) || MOCK_PROS[0]} onClose={() => setIsReviewModalOpen(false)} onSubmit={handleReviewSubmit} />}
      {isWhiteboardOpen && <Whiteboard onClose={() => setIsWhiteboardOpen(false)} onSendToAI={(snap, prompt) => { handleSendMessage(prompt, snap); setIsWhiteboardOpen(false); }} />}
      {isCameraOpen && <CameraCapture onCapturePhoto={(snap) => { if (activeProjectId) { setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, media: [...p.media, { id: Date.now().toString(), url: snap, type: 'photo', name: 'Site Photo', timestamp: 'Just now' }] } : p)); addNotification("Photo saved.", "success"); } else { handleSendMessage("Analyze snapshot:", snap); } setIsCameraOpen(false); }} onEditPhoto={() => setIsCameraOpen(false)} onClose={() => setIsCameraOpen(false)} />}
      
      <div className="fixed top-10 right-10 z-[1000] flex flex-col gap-4 pointer-events-none">{notifications.map(n => (<div key={n.id} className="pointer-events-auto bg-white/95 backdrop-blur-2xl border border-slate-200 p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 max-w-sm"><div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>🚀</div><p className="text-sm font-bold text-slate-950">{n.message}</p></div>))}</div>
    </div>
  );
};
export default App;