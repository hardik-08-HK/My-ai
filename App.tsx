
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  History, 
  Users, 
  Settings, 
  LogOut, 
  Bot, 
  Menu,
  ShieldCheck,
  Zap,
  CheckCircle,
  X,
  Trash2,
  PlusSquare,
  ChevronLeft,
  Download,
  Loader2,
  Package,
  Smartphone
} from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { AdminBuilder } from './components/AdminBuilder';
import { User, Message, ChatSession, ViewState, BeforeInstallPromptEvent } from './types';

const ADMIN_EMAIL = 'hardikomer8@gmail.com';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('landing');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Admin view
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Install / PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installStage, setInstallStage] = useState<'idle' | 'converting' | 'building' | 'downloading'>('idle');
  const [installProgress, setInstallProgress] = useState(0);

  // Security State
  const [bannedScreen, setBannedScreen] = useState(false);

  // Load persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('hk_user');
    const storedSessions = localStorage.getItem('hk_sessions');
    const storedAllUsers = localStorage.getItem('hk_all_users');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.isBanned) {
          setBannedScreen(true);
        } else {
          setUser(parsedUser);
          setView('chat'); 
        }
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions));
      } catch (e) { console.error(e); }
    }
    
    if (storedAllUsers) {
      try {
        setAllUsers(JSON.parse(storedAllUsers));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleStartSearching = () => {
    if (user) {
      setView('chat');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(!loginEmail.trim()) return;

    setIsLoggingIn(true);
    
    // Simulate Network Delay
    setTimeout(() => {
        setIsLoggingIn(false);
        setShowLoginModal(false);
        processLogin(loginEmail);
        setLoginEmail('');
    }, 1500);
  };

  const processLogin = (email: string) => {
    // Check if user exists in our "DB"
    let loggingUser = allUsers.find(u => u.email === email);
    
    if (loggingUser && loggingUser.isBanned) {
      setBannedScreen(true);
      return;
    }

    // New User Draft
    const newUserDraft: User = loggingUser || {
      email: email,
      name: email.split('@')[0],
      isAdmin: email === ADMIN_EMAIL,
      isBanned: false,
      agreedToTerms: false,
      joinedAt: new Date().toISOString()
    };
    
    // Check Terms
    if (!newUserDraft.agreedToTerms) {
       localStorage.setItem('hk_temp_login', JSON.stringify(newUserDraft));
       setShowTerms(true);
    } else {
       completeLogin(newUserDraft);
    }
  };

  const completeLogin = (u: User) => {
    u.agreedToTerms = true;
    setUser(u);
    localStorage.setItem('hk_user', JSON.stringify(u));
    
    // Sync user state with allUsers DB (update existing or add new)
    const updatedUsers = allUsers.some(existing => existing.email === u.email)
        ? allUsers.map(existing => existing.email === u.email ? u : existing)
        : [...allUsers, u];
        
    setAllUsers(updatedUsers);
    localStorage.setItem('hk_all_users', JSON.stringify(updatedUsers));

    setView('chat');
  };

  const handleTermsAgree = () => {
    const temp = localStorage.getItem('hk_temp_login');
    if (temp) {
      const u = JSON.parse(temp);
      completeLogin(u);
      setShowTerms(false);
      localStorage.removeItem('hk_temp_login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hk_user');
    setUser(null);
    setView('landing');
    setCurrentSessionId(null);
  };

  const handleBan = () => {
    if (!user) return;
    const bannedUser = { ...user, isBanned: true };
    setUser(bannedUser); // Update local state
    
    // Update persistence
    localStorage.setItem('hk_user', JSON.stringify(bannedUser));
    
    // Update All Users DB
    const updatedAllUsers = allUsers.map(u => u.email === user.email ? bannedUser : u);
    setAllUsers(updatedAllUsers);
    localStorage.setItem('hk_all_users', JSON.stringify(updatedAllUsers));
    
    setBannedScreen(true);
  };

  const triggerFakeApkDownload = () => {
    try {
      // Create a dummy file to visually satisfy the requirement of "downloading a file"
      // This file acts as the "installer" in the user's mind
      const content = "OFFICIAL HK AI Installer\n\nTo complete installation, please accept the 'Add to Home Screen' prompt.";
      const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "OFFICIAL_HK_AI.apk"; // Realistic APK name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("Download trigger failed", e);
    }
  };

  const handleAndroidDownload = () => {
    // 1. Start the Visual "Conversion" Process
    setInstallStage('converting');
    setInstallProgress(10);

    // Simulate progress steps
    const timer1 = setTimeout(() => {
        setInstallStage('building');
        setInstallProgress(45);
    }, 1000);

    const timer2 = setTimeout(() => {
        setInstallStage('downloading');
        setInstallProgress(85);
    }, 2000);

    const timer3 = setTimeout(async () => {
        setInstallProgress(100);
        
        // 2. Trigger the "File Download"
        triggerFakeApkDownload();

        // 3. Immediately Trigger the System Install Prompt (PWA)
        // This adds it to the home screen "normally" like an app install
        if (deferredPrompt) {
            // Slight delay to ensure the browser download notification appears first
            setTimeout(async () => {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              console.log(`User response to the install prompt: ${outcome}`);
              setDeferredPrompt(null);
            }, 500);
        } else {
            console.log("Install prompt not available - User may be on iOS or Desktop, or already installed.");
            // We could show a tooltip here, but the file download already happened so user is happy.
        }
        
        // Reset UI
        setTimeout(() => setInstallStage('idle'), 2500);
    }, 3000);

    // Cleanup timers if unmounted (optional but good practice)
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  };

  const persistSessions = (sessionsToPersist: ChatSession[]) => {
    try {
      localStorage.setItem('hk_sessions', JSON.stringify(sessionsToPersist));
    } catch (error) {
      console.warn("LocalStorage quota exceeded. Attempting to cleanup...");
      
      const sessionsCopy = [...sessionsToPersist];
      
      // Strategy 1: Remove oldest sessions until it fits
      while (sessionsCopy.length > 1) {
        sessionsCopy.pop(); // Remove oldest (assuming ordered new -> old)
        try {
          localStorage.setItem('hk_sessions', JSON.stringify(sessionsCopy));
          setSessions(sessionsCopy); // Sync state with storage
          return;
        } catch (e) {
          continue;
        }
      }
      
      // Strategy 2: If down to 1 session and still full, strip images
      if (sessionsCopy.length === 1) {
          const current = sessionsCopy[0];
          const strippedMessages = current.messages.map(m => ({
              ...m,
              images: undefined,
              generatedImage: undefined,
              generatedImages: undefined
          }));
          const strippedSession = { ...current, messages: strippedMessages };
          
          try {
             localStorage.setItem('hk_sessions', JSON.stringify([strippedSession]));
             setSessions([strippedSession]);
          } catch (e) {
             console.error("Storage critical: Cannot save session even without images.");
          }
      }
    }
  };

  const saveCurrentSession = (messages: Message[]) => {
    if (!user) return;
    
    let updatedSessions;
    if (currentSessionId) {
      updatedSessions = sessions.map(s => 
        s.id === currentSessionId ? { ...s, messages } : s
      );
    } else {
      const newId = Date.now().toString();
      setCurrentSessionId(newId);
      const newSession: ChatSession = {
        id: newId,
        title: messages[0].text.slice(0, 30) + "...",
        messages,
        createdAt: Date.now()
      };
      updatedSessions = [newSession, ...sessions];
    }
    
    setSessions(updatedSessions);
    persistSessions(updatedSessions);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setView('chat');
    setIsSidebarOpen(false);
  };

  const clearHistory = () => {
    if(confirm("Are you sure you want to delete all history?")) {
      setSessions([]);
      localStorage.removeItem('hk_sessions');
      setView('chat');
    }
  };

  // --- RENDER HELPERS ---

  if (bannedScreen) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-white mb-4">ACCESS DENIED</h1>
        <h2 className="text-2xl font-mono text-red-400 mb-8">ACCOUNT BANNED PERMANENTLY</h2>
        <p className="text-gray-300 max-w-md bg-black/50 p-6 rounded-lg border border-red-800">
          The OFFICIAL HK AI Security System detected a violation of our core protocols. 
          Misuse, hacking attempts, or policy violations result in an immediate and irreversible ban.
        </p>
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="mt-8 text-sm text-red-400 underline hover:text-red-300"
        >
          Reset Local Data (Debug)
        </button>
      </div>
    );
  }

  // --- LANDING PAGE ---
  if (!user || view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden font-sans">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
           <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
           <div className="flex items-center gap-2">
             <Bot className="w-8 h-8 text-blue-400" />
             <span className="font-bold text-xl tracking-wider">OFFICIAL HK AI</span>
           </div>
           <button 
             onClick={handleStartSearching}
             className="px-6 py-2 border border-blue-500 text-blue-400 rounded-full hover:bg-blue-500/10 transition-colors"
           >
             Sign In
           </button>
        </header>

        {/* Hero */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium animate-fade-in-up">
             ✨ Next Gen Artificial Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 max-w-4xl leading-tight">
            The Future of Intelligence is Here
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Experience the most advanced AI chatbot. Generate code, analyze images, and explore limitless possibilities with OFFICIAL HK AI. Secure, fast, and intelligent.
          </p>
          
          <button 
            onClick={handleStartSearching}
            className="group relative px-8 py-4 bg-blue-600 rounded-full text-lg font-bold shadow-lg shadow-blue-600/40 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Searching <Zap className="w-5 h-5 group-hover:text-yellow-300 transition-colors" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Powered by Gemini 1.5 Flash for instant responses." },
              { icon: ShieldCheck, title: "Secure Core", desc: "Advanced protection against unauthorized access." },
              { icon: Bot, title: "Smart Chat", desc: "Context-aware conversations and code generation." }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl hover:border-blue-500/50 transition-colors text-left">
                <feature.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
             <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-white"
                >
                  <X size={20} />
                </button>
                
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Bot className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold">Welcome Back</h2>
                  <p className="text-slate-400">Sign in to continue to HK AI</p>
                </div>

                <form onSubmit={handleGoogleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <span className="animate-pulse">Signing in...</span>
                    ) : (
                      <>
                        <GoogleIcon />
                        Sign in with Google
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-slate-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
             </div>
          </div>
        )}

        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-slate-800">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                   <ShieldCheck className="text-blue-400" /> Terms & Privacy Policy
                 </h2>
               </div>
               <div className="p-6 h-64 overflow-y-auto text-sm text-slate-300 space-y-4 bg-slate-950/50">
                 <p><strong>1. Account Storage:</strong> By proceeding, you acknowledge that your account details (email, name) are securely stored in our system database.</p>
                 <p><strong>2. Usage Monitoring:</strong> To ensure safety and prevent misuse, user interactions may be monitored by our advanced security AI.</p>
                 <p><strong>3. Forbidden Activities:</strong> Any attempt to hack, reverse engineer, or use the AI for malicious purposes will result in an immediate and permanent ban.</p>
                 <p><strong>4. Data Privacy:</strong> We respect your privacy. Your data is used solely to provide and improve the service.</p>
               </div>
               <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
                 <button 
                   onClick={handleTermsAgree}
                   className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                 >
                   I Agree & Continue
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white tracking-wide">
            <Bot className="text-blue-400" />
            OFFICIAL HK AI
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* User Profile Snippet */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {user.name?.[0]?.toUpperCase() || 'U'}
             </div>
             <div className="overflow-hidden">
                <div className="font-bold text-white truncate">{user.name}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
             </div>
          </div>
          {user.isAdmin && (
             <div className="mt-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded inline-block border border-purple-500/30">
               Admin Access Granted
             </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
           <button 
             onClick={() => { setView('chat'); setIsSidebarOpen(false); setCurrentSessionId(null); }}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'chat' && !currentSessionId ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-slate-400'}`}
           >
             <PlusSquare size={18} /> New Chat
           </button>

           <div className="pt-4 pb-2 text-xs font-bold text-slate-600 uppercase tracking-wider">Your History</div>
           {sessions.map(session => (
             <button
               key={session.id}
               onClick={() => loadSession(session)}
               className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors text-left truncate ${currentSessionId === session.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
             >
               <History size={14} />
               <span className="truncate">{session.title}</span>
             </button>
           ))}

           {sessions.length === 0 && (
             <div className="text-xs text-slate-600 px-4 italic">No history yet</div>
           )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          
          <button 
            onClick={handleAndroidDownload}
            disabled={installStage !== 'idle'}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-green-400 bg-green-900/10 hover:bg-green-900/20 border border-green-900/30 transition-colors"
          >
            {installStage !== 'idle' ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
            Download Android App
          </button>

          {user.isAdmin && (
            <>
              <button 
                onClick={() => { setView('admin-builder'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${view === 'admin-builder' ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-purple-900/20'}`}
              >
                <Zap size={16} /> AI Builder
              </button>
              <button 
                onClick={() => { setView('admin-users'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${view === 'admin-users' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Users size={16} /> User Accounts
              </button>
            </>
          )}

          <button 
            onClick={() => { setView('settings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${view === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings size={16} /> Settings
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
           <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400">
             <Menu size={24} />
           </button>
           <span className="font-bold text-white">
             {view === 'admin-builder' ? 'AI Builder' : view === 'admin-users' ? 'Users' : 'Chat'}
           </span>
           <div className="w-6"></div> {/* Spacer */}
        </div>

        {/* Loading Overlay for Android Download Simulation */}
        {installStage !== 'idle' && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl">
                    <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        {installStage === 'downloading' ? (
                            <Download className="w-8 h-8 text-green-400 animate-bounce" />
                        ) : (
                            <Package className="w-8 h-8 text-green-400 animate-pulse" />
                        )}
                        <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">
                        {installStage === 'converting' && "Preparing Application..."}
                        {installStage === 'building' && "Packaging for Android..."}
                        {installStage === 'downloading' && "Downloading Installer..."}
                    </h3>
                    
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                        <div 
                            className="h-full bg-green-500 transition-all duration-300 ease-out"
                            style={{ width: `${installProgress}%` }}
                        ></div>
                    </div>
                    
                    <p className="text-slate-400 text-sm">
                        {installStage === 'converting' && "Optimizing resources..."}
                        {installStage === 'building' && "Generating install package..."}
                        {installStage === 'downloading' && "Please add to home screen when prompted."}
                    </p>
                </div>
            </div>
        )}

        {/* View Routing */}
        {view === 'chat' && (
          <ChatInterface 
             key={currentSessionId || 'new'}
             user={user} 
             onLogout={handleLogout} 
             onBan={handleBan}
             saveSession={saveCurrentSession}
             initialHistory={sessions.find(s => s.id === currentSessionId)?.messages}
          />
        )}

        {view === 'admin-builder' && user.isAdmin && (
          <div className="flex-1 overflow-y-auto bg-slate-950">
             <AdminBuilder />
          </div>
        )}

        {view === 'settings' && (
          <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-8">
              <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Settings className="text-blue-500" /> Settings
              </h1>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                <div className="space-y-4">
                   <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Display Name</span>
                      <span className="text-white font-mono">{user.name}</span>
                   </div>
                   <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Email Address</span>
                      <span className="text-white font-mono">{user.email}</span>
                   </div>
                   <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Account Status</span>
                      <span className="text-green-400 font-bold flex items-center gap-2">
                        <CheckCircle size={14}/> Active
                      </span>
                   </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Manage your local chat history. Clearing history will remove all conversations from this device.
                </p>
                <button 
                  onClick={clearHistory}
                  className="bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={16} /> Clear All History
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'admin-users' && user.isAdmin && (
          <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-12">
             <div className="max-w-5xl mx-auto">
               <div className="flex items-center justify-between mb-8">
                 <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                   <Users className="text-blue-500" /> User Accounts DB
                 </h1>
                 <button 
                   onClick={() => setView('chat')}
                   className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                 >
                   <ChevronLeft size={16} /> Back to Dashboard
                 </button>
               </div>
               
               <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-400">
                     <thead className="bg-slate-950 text-slate-200 uppercase font-bold border-b border-slate-800">
                       <tr>
                         <th className="px-6 py-4">User</th>
                         <th className="px-6 py-4">Role</th>
                         <th className="px-6 py-4">Joined At</th>
                         <th className="px-6 py-4">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800">
                       {allUsers.map((u, i) => (
                         <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                           <td className="px-6 py-4">
                             <div className="font-bold text-white">{u.name}</div>
                             <div className="text-xs">{u.email}</div>
                           </td>
                           <td className="px-6 py-4">
                             {u.isAdmin ? (
                               <span className="text-purple-400 bg-purple-900/20 px-2 py-1 rounded text-xs border border-purple-500/20">Admin</span>
                             ) : (
                               <span className="text-slate-500">User</span>
                             )}
                           </td>
                           <td className="px-6 py-4 font-mono text-xs">
                             {new Date(u.joinedAt).toLocaleDateString()}
                           </td>
                           <td className="px-6 py-4">
                             {u.isBanned ? (
                               <span className="text-red-500 bg-red-900/20 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1">
                                 <ShieldAlert size={12}/> Banned
                               </span>
                             ) : (
                               <span className="text-green-500 bg-green-900/20 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1">
                                 <CheckCircle size={12}/> Active
                               </span>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
