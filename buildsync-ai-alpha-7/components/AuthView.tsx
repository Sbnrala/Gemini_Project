import React, { useState, useMemo } from 'react';

// Extensive location data for the Neural Registration Protocol v15.1
const LOCATION_DATABASE: Record<string, Record<string, string[]>> = {
  "United States": {
    "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville"],
    "Alaska": ["Anchorage", "Fairbanks", "Juneau"],
    "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"],
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Oakland"],
    "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale"],
    "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah"],
    "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet"],
    "Massachusetts": ["Boston", "Worcester", "Springfield", "Cambridge"],
    "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Albany", "Syracuse"],
    "Texas": ["Austin", "Houston", "Dallas", "San Antonio", "Fort Worth", "El Paso"],
    "Washington": ["Seattle", "Bellevue", "Redmond", "Tacoma", "Spokane", "Vancouver"],
  },
  "Canada": {
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Kelowna"],
    "Manitoba": ["Winnipeg", "Brandon"],
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "Brampton", "London", "Markham"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke"],
    "Saskatchewan": ["Saskatoon", "Regina"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", "Bristol"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Bangor"]
  },
  "India": {
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Maharashtra": ["Mumbai", "Pune", "Nashik", "Nagpur", "Thane"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur"]
  },
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
    "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville"],
    "Western Australia": ["Perth", "Fremantle", "Mandurah"],
    "South Australia": ["Adelaide"]
  }
};

interface AuthUser {
  name: string;
  identifier: string; // email or phone
  password: string;
  role: 'client' | 'expert';
}

interface AuthViewProps {
  onLogin: (
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
  ) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [regStep, setRegStep] = useState(1); 
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'identifier' | 'code' | 'reset'>('identifier');
  const [role, setRole] = useState<'client' | 'expert'>('client');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState({ country: '', region: '', city: '' });
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [subscription, setSubscription] = useState('');
  const [card, setCard] = useState({ 
    number: '', 
    expiry: '', 
    cvv: '', 
    nameOnCard: '', 
    zipCode: '' 
  });

  // Expert Profile Data
  const [proData, setProData] = useState({
    specialty: '',
    category: 'General',
    experience: '',
    hourlyRate: '',
    bio: '',
    skills: ''
  });
  
  // Reset Data
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const countries = useMemo(() => Object.keys(LOCATION_DATABASE).sort(), []);
  const regions = useMemo(() => (!isManualLocation && location.country && LOCATION_DATABASE[location.country]) ? Object.keys(LOCATION_DATABASE[location.country]).sort() : [], [location.country, isManualLocation]);
  const cities = useMemo(() => (!isManualLocation && location.country && location.region && LOCATION_DATABASE[location.country][location.region]) ? LOCATION_DATABASE[location.country][location.region].sort() : [], [location.country, location.region, isManualLocation]);

  const getStoredUsers = (): AuthUser[] => {
    const data = localStorage.getItem('buildsync_v15_registry');
    return data ? JSON.parse(data) : [];
  };

  const saveUser = (user: AuthUser) => {
    const users = getStoredUsers();
    users.push(user);
    localStorage.setItem('buildsync_v15_registry', JSON.stringify(users));
  };

  const normalizeIdentifier = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.includes('@')) {
      return trimmed.toLowerCase();
    }
    // Canonical phone format for sign-in matching
    return trimmed.replace(/\D/g, '');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0, len = v.length; i < len; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    return v;
  };

  const validateIdentifier = (idStr: string) => {
    const normalized = normalizeIdentifier(idStr);
    return normalized.length >= 5;
  };

  const validatePasswordComplexity = (pass: string) => {
    const trimmedPass = pass.trim();
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(trimmedPass);
  };

  const validateCard = () => {
    const cleanNum = card.number.replace(/\s/g, '');
    if (cleanNum.length < 16) return "Card Number must be 16 digits.";
    
    const expiryMatch = card.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) return "Expiry must be MM/YY.";
    
    const month = parseInt(expiryMatch[1], 10);
    const year = parseInt(expiryMatch[2], 10) + 2000;

    if (month < 1 || month > 12) return "Invalid month (01-12).";

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "The card has expired. Please use a valid card.";
    }

    if (card.cvv.length < 3) return "CVV must be 3 or 4 digits.";
    if (card.nameOnCard.trim().length < 3) return "Please enter the full Name on Card.";
    if (card.zipCode.length < 3 || card.zipCode.length > 10) return "Zip Code must be between 3 and 10 digits.";
    return null;
  };

  const handleRoleChange = (newRole: 'client' | 'expert') => {
    if (newRole !== role && isRegistering && regStep === 1) {
      setRole(newRole);
      setName('');
      setEmail('');
      setPassword('');
      setLocation({ country: '', region: '', city: '' });
      setIsManualLocation(false);
      setSubscription('');
      setCard({ number: '', expiry: '', cvv: '', nameOnCard: '', zipCode: '' });
      setProData({
        specialty: '',
        category: 'General',
        experience: '',
        hourlyRate: '',
        bio: '',
        skills: ''
      });
      setError(null);
    } else {
      setRole(newRole);
    }
  };

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRegistering) {
      if (regStep === 1) {
        if (!validateIdentifier(email)) { 
          setError("Neural Error: Please provide a valid identifier sequence (Email or Phone)."); 
          return; 
        }
        
        // GLOBAL UNIQUENESS CHECK - BLOCK EARLY
        const normalizedId = normalizeIdentifier(email);
        const users = getStoredUsers();
        if (users.find(u => u.identifier === normalizedId)) {
          setError("Neural Link Conflict: This email or phone number is already registered to a BuildSync profile.");
          return;
        }

        if (!validatePasswordComplexity(password)) { 
          setError("Neural Error: Password does not meet security protocols (8+ chars, Uppercase, Lowercase, Number, Special)."); 
          return; 
        }
        setRegStep(2);
      } else if (regStep === 2) {
        if (!location.country.trim() || !location.region.trim() || !location.city.trim()) { 
          setError("Neural Error: Complete site location mapping required. Please provide Country, Region, and City."); 
          return; 
        }
        setRegStep(3); 
      } else if (role === 'expert' && regStep === 3) {
        if (!subscription) { setError("Neural Error: Subscription plan selection is mandatory to proceed."); return; }
        setRegStep(4); 
      } else if ((role === 'client' && regStep === 3) || (role === 'expert' && regStep === 4)) {
        const cardErr = validateCard();
        if (cardErr) { setError(`Neural Error: ${cardErr}`); return; }
        if (role === 'expert') {
          setRegStep(5); 
        } else {
          handleRegistration();
        }
      } else {
        handleRegistration();
      }
    } else {
      handleSignIn();
    }
  };

  const handleRegistration = () => {
    const normalizedId = normalizeIdentifier(email);
    const users = getStoredUsers();
    
    // Safety check again at final step
    if (users.find(u => u.identifier === normalizedId)) {
      setError("Registration Failed: Identifier already linked to a profile.");
      setRegStep(1);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newUser: AuthUser = { name: name.trim() || (role === 'expert' ? "New Expert" : "New Builder"), identifier: normalizedId, password: password.trim(), role };
      saveUser(newUser);

      const finalProData = role === 'expert' ? {
        specialty: proData.specialty,
        category: proData.category,
        experience: proData.experience,
        hourlyRate: proData.hourlyRate,
        bio: proData.bio,
        skills: proData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      } : undefined;

      onLogin(newUser.name, newUser.role, true, {
        identifier: normalizedId,
        location: location,
        card: card,
        proData: finalProData,
        subscription: role === 'expert' ? subscription : undefined
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleSignIn = () => {
    const normalizedId = normalizeIdentifier(email);
    const trimmedPass = password.trim();
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const users = getStoredUsers();
      // Search logic for Expert & Builder is unified via normalized identifiers
      const user = users.find(u => u.identifier === normalizedId);
      if (!user || user.password !== trimmedPass) {
        setError("Verification Failed: Invalid credentials sequence.");
        setIsLoading(false);
        return;
      }
      onLogin(user.name, user.role, false, { identifier: user.identifier });
      setIsLoading(false);
    }, 1200);
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetStep === 'identifier') {
      if (!validateIdentifier(resetEmail)) { setError("Neural Error: Invalid identifier."); return; }
      setIsLoading(true);
      setTimeout(() => {
        setResetStep('code');
        setIsLoading(false);
        setSuccessMsg("Temporal sequence sent to identifier.");
      }, 1000);
    } else if (resetStep === 'code') {
      if (verificationCode.length < 4) { setError("Neural Error: Invalid code."); return; }
      setResetStep('reset');
      setSuccessMsg(null);
    } else {
      if (!validatePasswordComplexity(newPassword)) { setError("Neural Error: Complexity protocol failed."); return; }
      if (newPassword !== confirmPassword) { setError("Neural Error: Sequence mismatch."); return; }
      setIsLoading(true);
      setTimeout(() => {
        const normalizedResetId = normalizeIdentifier(resetEmail);
        const users = getStoredUsers();
        const updated = users.map(u => u.identifier === normalizedResetId ? { ...u, password: newPassword } : u);
        localStorage.setItem('buildsync_v15_registry', JSON.stringify(updated));
        setSuccessMsg("Neural link credentials updated. Please Sign In.");
        setIsForgotPassword(false);
        setIsLoading(false);
      }, 1200);
    }
  };

  const switchToSignIn = () => {
    setIsRegistering(false);
    setIsForgotPassword(false);
    setShowPassword(false);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  const switchToRegister = () => {
    setIsRegistering(true);
    setIsForgotPassword(false);
    setShowPassword(false);
    setRegStep(1);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  const getExpertStepLabel = (step: number) => {
    switch (step) {
      case 1: return "Identity";
      case 2: return "Location";
      case 3: return "Subscription";
      case 4: return "Verification";
      case 5: return "Pro Profile";
      default: return "";
    }
  };

  const passwordRequirements = [
    { label: '8+ Characters', met: password.length >= 8 },
    { label: 'Uppercase Letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase Letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special Character (@$!%*?&)', met: /[@$!%*?&]/.test(password) }
  ];

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className={`w-full ${regStep === 3 && role === 'expert' && isRegistering ? 'max-w-4xl' : 'max-w-md'} bg-white rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500`}>
        <div className="bg-slate-950 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-transparent"></div>
          <div className="w-16 h-16 bg-violet-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-violet-500/40 relative z-10">B</div>
          <h1 className="text-2xl font-black text-white tracking-tight relative z-10 uppercase">BuildSync Neural</h1>
          <p className="text-violet-300 font-bold text-xs uppercase tracking-widest mt-2 relative z-10">
            {isForgotPassword ? 'Credential Recovery' : isRegistering ? (
              role === 'expert' ? `Expert Enrollment: ${getExpertStepLabel(regStep)}` : `Registration Step ${regStep}/3`
            ) : 'Neural Construction OS v15.0'}
          </p>
          {isRegistering && !isForgotPassword && (
             <div className="flex gap-2 justify-center mt-4 relative z-10">
                {[1,2,3, ...(role === 'expert' ? [4, 5] : [])].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${regStep >= i ? 'w-8 bg-violet-500' : 'w-2 bg-slate-800'}`}></div>
                ))}
             </div>
          )}
        </div>

        <div className="p-10 bg-white">
          {!isRegistering && !isForgotPassword && (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
              <button onClick={switchToSignIn} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRegistering ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500'}`}>Sign In</button>
              <button onClick={switchToRegister} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRegistering ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500'}`}>Register</button>
            </div>
          )}

          {error && <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider mb-6 leading-tight">{error}</div>}
          {successMsg && <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider mb-6">{successMsg}</div>}

          {isForgotPassword ? (
            <form onSubmit={handleResetRequest} className="space-y-5">
              {resetStep === 'identifier' && (
                <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Identifier</label><input type="text" required value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="Email or phone" /></div>
              )}
              {resetStep === 'code' && (
                <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Recovery Code</label><input type="text" required value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="0000" /></div>
              )}
              {resetStep === 'reset' && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">New Neural Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 pr-12 focus:bg-white outline-none transition-all" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-700 transition-colors">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Confirm Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 pr-12 focus:bg-white outline-none transition-all" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-700 transition-colors">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </>
              )}
              <button type="submit" disabled={isLoading} className="w-full bg-violet-700 hover:bg-violet-800 text-white py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl shadow-violet-100 transition-all disabled:bg-slate-300">
                {isLoading ? 'Verifying...' : resetStep === 'reset' ? 'Update Credentials' : 'Send Recovery Protocol'}
              </button>
              <button type="button" onClick={switchToSignIn} className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-violet-700 transition-colors mt-4">Back to Sign In</button>
            </form>
          ) : isRegistering ? (
            <form onSubmit={handleAuthAction} className="space-y-5">
              {regStep === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Select Identity Link</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button type="button" onClick={() => handleRoleChange('client')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'client' ? 'border-violet-700 bg-violet-50 text-violet-900' : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-[9px] font-black uppercase">Builder</span>
                    </button>
                    <button type="button" onClick={() => handleRoleChange('expert')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'expert' ? 'border-violet-700 bg-violet-50 text-violet-900' : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <span className="text-[9px] font-black uppercase">Expert</span>
                    </button>
                  </div>
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Full Name</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="John Doe" /></div>
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Email / Phone</label><input type="text" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="architect@buildsync.ai" /></div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required maxLength={32} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 pr-12 focus:bg-white outline-none transition-all" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-700 transition-colors">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Security Protocol Requirements</p>
                       <div className="grid grid-cols-1 gap-1.5">
                         {passwordRequirements.map((req, i) => (
                           <div key={i} className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                               {req.met && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                             </div>
                             <span className={`text-[9px] font-bold uppercase tracking-tight transition-colors ${req.met ? 'text-emerald-700' : 'text-slate-500'}`}>{req.label}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}
              {regStep === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">Site Mapping</p>
                    <button 
                      type="button" 
                      onClick={() => setIsManualLocation(!isManualLocation)} 
                      className="text-[9px] font-black text-slate-500 hover:text-violet-700 uppercase tracking-widest underline decoration-violet-500/30 underline-offset-4 transition-colors"
                    >
                      {isManualLocation ? 'Switch to Selection' : "Can't find your location?"}
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Country</label>
                    {isManualLocation ? (
                      <input 
                        type="text" 
                        required 
                        value={location.country} 
                        onChange={e => setLocation({ ...location, country: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" 
                        placeholder="e.g., Germany" 
                      />
                    ) : (
                      <select required value={location.country} onChange={e => setLocation({ country: e.target.value, region: '', city: '' })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all">
                        <option value="">Select Country</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">State / Region</label>
                    {isManualLocation ? (
                      <input 
                        type="text" 
                        required 
                        value={location.region} 
                        onChange={e => setLocation({ ...location, region: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" 
                        placeholder="e.g., Bavaria" 
                      />
                    ) : (
                      <select required disabled={!location.country} value={location.region} onChange={e => setLocation({ ...location, region: e.target.value, city: '' })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all disabled:opacity-50">
                        <option value="">Select State / Region</option>
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">City</label>
                    {isManualLocation ? (
                      <input 
                        type="text" 
                        required 
                        value={location.city} 
                        onChange={e => setLocation({ ...location, city: e.target.value })} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" 
                        placeholder="e.g., Munich" 
                      />
                    ) : (
                      <select required disabled={!location.region} value={location.city} onChange={e => setLocation({ ...location, city: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all disabled:opacity-50">
                        <option value="">Select City</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}
              {regStep === 3 && role === 'expert' && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <p className="text-[10px] font-black text-violet-700 uppercase tracking-[0.3em] text-center mb-4">Choose Your Pro Hub Plan (Selection Required)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button type="button" onClick={() => { setSubscription('essential'); setError(null); }} className={`p-6 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between h-full ${subscription === 'essential' ? 'border-violet-700 bg-violet-50 ring-4 ring-violet-50 shadow-lg' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Essential</p>
                        <p className="text-2xl font-black text-slate-900">$10</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">Free Starter</p>
                        <ul className="mt-4 space-y-2">
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>Basic Profile</li>
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>Limited Signals</li>
                        </ul>
                      </div>
                      {subscription === 'essential' && <div className="mt-4 bg-violet-700 text-white p-2 rounded-xl text-center text-[8px] font-black uppercase tracking-widest">Selected</div>}
                    </button>

                    <button type="button" onClick={() => { setSubscription('pro'); setError(null); }} className={`p-6 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between h-full relative ${subscription === 'pro' ? 'border-violet-700 bg-violet-50 ring-4 ring-violet-50 shadow-lg' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-700 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Most Popular</div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-violet-700 mb-1">Pro Builder</p>
                        <p className="text-2xl font-black text-slate-900">$30<span className="text-xs text-slate-500">/mo</span></p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">Unlimited Access</p>
                        <ul className="mt-4 space-y-2">
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-violet-600 rounded-full"></div>Verified Expert Badge</li>
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-violet-600 rounded-full"></div>Priority Lead Signal</li>
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-violet-600 rounded-full"></div>Unlimited Broadcasts</li>
                        </ul>
                      </div>
                      {subscription === 'pro' && <div className="mt-4 bg-violet-700 text-white p-2 rounded-xl text-center text-[8px] font-black uppercase tracking-widest">Selected</div>}
                    </button>

                    <button type="button" onClick={() => { setSubscription('elite'); setError(null); }} className={`p-6 rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between h-full ${subscription === 'elite' ? 'border-amber-600 bg-amber-50 ring-4 ring-amber-50 shadow-lg' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                      <div>
                        <p className="text-[9px] font-black uppercase text-amber-700 mb-1">Elite Master</p>
                        <p className="text-2xl font-black text-slate-900">$60<span className="text-xs text-slate-500">/mo</span></p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">Premium Leads</p>
                        <ul className="mt-4 space-y-2">
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>Neural Matchmaking</li>
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>Direct Referrals</li>
                           <li className="text-[9px] font-bold text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>Analytics Suite</li>
                        </ul>
                      </div>
                      {subscription === 'elite' && <div className="mt-4 bg-amber-600 text-white p-2 rounded-xl text-center text-[8px] font-black uppercase tracking-widest">Selected</div>}
                    </button>
                  </div>
                </div>
              )}
              {((regStep === 3 && role === 'client') || (regStep === 4 && role === 'expert')) && (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Name on Card</label><input type="text" required value={card.nameOnCard} onChange={e => setCard({...card, nameOnCard: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="NAME AS SHOWN" /></div>
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Card Number</label><input type="text" required maxLength={19} value={card.number} onChange={e => setCard({...card, number: formatCardNumber(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="0000 0000 0000 0000" /></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Expiry</label><input type="text" required maxLength={5} value={card.expiry} onChange={e => setCard({...card, expiry: formatExpiry(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="MM/YY" /></div>
                      <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">CVV</label><input type="text" required maxLength={4} value={card.cvv} onChange={e => setCard({...card, cvv: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="000" /></div>
                  </div>
                  <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Zip Code</label><input type="text" required maxLength={10} value={card.zipCode} onChange={e => setCard({...card, zipCode: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" placeholder="3-10 digits" /></div>
                </div>
              )}
              {regStep === 5 && role === 'expert' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                  <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest text-center mb-2">Professional Profile (Optional)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[9px] font-black text-slate-600 uppercase mb-1">Specialty</label><input type="text" value={proData.specialty} onChange={e => setProData({...proData, specialty: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none" placeholder="Master Plumber" /></div>
                    <div><label className="block text-[9px] font-black text-slate-600 uppercase mb-1">Category</label><select value={proData.category} onChange={e => setProData({...proData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-600 outline-none transition-all"><option>General</option><option>Plumbing</option><option>Electrical</option><option>Gardening</option><option>Carpentry</option><option>Design</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[9px] font-black text-slate-600 uppercase mb-1">Experience</label><input type="text" value={proData.experience} onChange={e => setProData({...proData, experience: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none" placeholder="10 Years" /></div>
                    <div><label className="block text-[9px] font-black text-slate-600 uppercase mb-1">Hourly Rate</label><input type="text" value={proData.hourlyRate} onChange={e => setProData({...proData, hourlyRate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none" placeholder="$85/hr" /></div>
                  </div>
                  <div><label className="block text-[9px] font-black text-slate-600 uppercase mb-1">Expert Bio</label><textarea value={proData.bio} onChange={e => setProData({...proData, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium resize-none focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all" rows={2} placeholder="Describe your background..." /></div>
                  <div><label className="block text-[9px] font-black text-slate-600 uppercase mb-1">Skills (comma separated)</label><input type="text" value={proData.skills} onChange={e => setProData({...proData, skills: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none" placeholder="Piping, Drainage" /></div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                {regStep > 1 && (
                  <button type="button" onClick={() => setRegStep(regStep - 1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-5 rounded-[2rem] font-black uppercase text-xs transition-all shadow-sm">Back</button>
                )}
                <button type="submit" disabled={isLoading} className={`${regStep > 1 ? 'flex-[2]' : 'w-full'} bg-violet-700 hover:bg-violet-800 text-white py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl shadow-violet-100 transition-all disabled:bg-slate-300`}>
                  {isLoading ? 'Processing...' : (
                    (role === 'client' && regStep < 3) || (role === 'expert' && regStep < 5) ? 'Proceed with protocol' : 'Initialize neural link'
                  )}
                </button>
              </div>
              <button type="button" onClick={switchToSignIn} className="w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-violet-700 transition-colors mt-6">Already have an account? Sign In</button>
            </form>
          ) : (
            <form onSubmit={handleAuthAction} className="space-y-5">
              <div><label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Identifier</label><input type="text" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 focus:bg-white outline-none transition-all shadow-sm" placeholder="Email or phone" /></div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 px-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-600 pr-12 focus:bg-white outline-none transition-all shadow-sm" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-700 transition-colors">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => { setIsForgotPassword(true); setResetStep('identifier'); }} className="text-[9px] font-black text-violet-700 uppercase tracking-widest hover:underline transition-all">Forgot Password?</button>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-violet-700 hover:bg-violet-800 text-white py-5 rounded-[2rem] font-black uppercase text-xs shadow-xl shadow-violet-200 transition-all disabled:bg-slate-300">{isLoading ? 'Establishing...' : 'Establish Link'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};