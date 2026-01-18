
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MediaItem, ViewType, CloudProvider, CloudFile } from './types';
import { MEDIA_LIBRARY as INITIAL_LIBRARY } from './constants';
import { gemini } from './services/geminiService';
import { storageClient } from './services/cloudStorageService';
import { AppleStylePlayer } from './components/AppleStylePlayer';
import { 
  Home, Download, Play, Pause, Info, 
  ChevronLeft, MoreVertical, SkipBack, SkipForward,
  Volume2, Settings as SettingsIcon, List, Sparkles, X, Search as SearchIcon,
  Clock, Tv, Calendar, PlayCircle, FastForward, Rewind, Clapperboard, Users, Layers,
  Star, Scan, FileVideo, CheckCircle2, AlertCircle, Cloud, Github, LogOut,
  HardDrive, Monitor, Folder, File, Share2, ExternalLink, RefreshCw, WifiOff,
  Maximize2, Subtitles, Activity, Check
} from 'lucide-react';

// --- Global UI Components (Optimized with React.memo) ---
const Toast = React.memo(({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const content = useMemo(() => {
    const icons = {
      error: <AlertCircle className="text-red-400" size={20} />,
      success: <CheckCircle2 className="text-lime-400" size={20} />,
      info: <Sparkles className="text-sky-400" size={20} />
    };
    const bgColors = {
      error: 'bg-red-500/10 border-red-500/30 backdrop-blur-md',
      success: 'bg-lime-500/10 border-lime-500/30 backdrop-blur-md',
      info: 'bg-sky-500/10 border-sky-500/30 backdrop-blur-md'
    };
    return { icon: icons[type], style: bgColors[type] };
  }, [type]);

  return (
    <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[2000] px-8 py-4 fluid-geom-md vibrant-glass border ${content.style} flex items-center gap-4 animate-apple-open shadow-2xl`}>
      {content.icon}
      <span className="text-xs font-black tracking-widest uppercase">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-40 hover:opacity-100 transition-opacity"><X size={16} /></button>
    </div>
  );
});

const GlobalBackgroundVideo = React.memo(({ isAuth }: { isAuth?: boolean }) => (
  <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-black">
    <video 
      autoPlay muted loop playsInline 
      className={`w-full h-full object-cover scale-110 blur-[1px] ${isAuth ? 'animate-background-pulse opacity-50' : 'opacity-40 brightness-[0.6]'}`}
    >
      <source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-loop-9710-large.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
    {isAuth && (
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-none">
        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, rgba(190,242,100,0.05), transparent 70%)" />
      </div>
    )}
  </div>
));

// --- Bottom Navigation Component ---
// Fix for Error: Cannot find name 'BottomNav'
const BottomNav = React.memo(({ active, onNavigate }: { active: ViewType; onNavigate: (v: ViewType) => void }) => {
  const items = [
    { id: 'home', icon: <Home size={24} />, label: 'Home' },
    { id: 'search', icon: <SearchIcon size={24} />, label: 'Search' },
    { id: 'downloads', icon: <Download size={24} />, label: 'Sync' },
    { id: 'cloud', icon: <Cloud size={24} />, label: 'Cloud' },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 vibrant-glass border border-white/10 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-3xl animate-apple-open">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as ViewType)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500 relative overflow-hidden group ${
            active === item.id ? 'bg-white text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          {item.icon}
          {active === item.id && (
            <span className="text-[10px] font-black uppercase tracking-widest animate-pop">{item.label}</span>
          )}
          {active === item.id && (
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
          )}
        </button>
      ))}
    </nav>
  );
});

// --- Main App Logic ---
export default function App() {
  const [library, setLibrary] = useState<MediaItem[]>(INITIAL_LIBRARY);
  const [view, setView] = useState<ViewType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success' | 'info'} | null>(null);

  // Snappy State Handlers
  const handleAuth = useCallback(() => {
    setIsAuthenticated(true);
    setView('home');
    setToast({ message: 'Core session initialized.', type: 'success' });
  }, []);

  const handleMediaClick = useCallback((item: MediaItem) => {
    setSelectedMedia(item);
    setView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const startPlayer = useCallback((item?: MediaItem) => {
    if (item) setSelectedMedia(item);
    setIsPlayerOpen(true);
  }, []);

  // Library Filters
  const movies = useMemo(() => library.filter(m => !m.isTVShow), [library]);
  const tvShows = useMemo(() => library.filter(m => m.isTVShow), [library]);
  const featuredItem = library[1] || library[0];

  const renderHome = () => (
    <div className={`pb-44 transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) ${isSearchOpen ? 'scale-90 blur-[80px] opacity-0 pointer-events-none' : ''}`}>
      <header className="fixed top-0 left-0 right-0 z-40 p-12 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto"><span className="text-4xl font-black tracking-tighter italic text-white text-vibrant">LUMINA</span></div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={() => setIsSearchOpen(true)} className="ios-reflective w-16 h-16 flex items-center justify-center fluid-geom-md border-white/20">
            <SearchIcon size={28} className="text-white" />
          </button>
        </div>
      </header>
      <HeroSection item={featuredItem} onInfo={() => handleMediaClick(featuredItem)} onPlay={() => startPlayer(featuredItem)} />
      <div className="relative -mt-28 z-10 space-y-24 px-12">
        <section>
          <h3 className="text-3xl font-[900] tracking-tighter flex items-center gap-4 mb-10 text-vibrant">Movies <div className="w-2 h-2 rounded-full bg-white opacity-20" /></h3>
          <div className="flex gap-8 overflow-x-auto pb-6 -mx-12 px-12 no-scrollbar">
            {movies.map(item => <MediaCard key={item.id} item={item} onClick={() => handleMediaClick(item)} isHome />)}
          </div>
        </section>
        <section>
          <h3 className="text-3xl font-[900] tracking-tighter flex items-center gap-4 mb-10 text-vibrant">TV Shows <div className="w-2 h-2 rounded-full bg-white opacity-20" /></h3>
          <div className="flex gap-8 overflow-x-auto pb-6 -mx-12 px-12 no-scrollbar">
            {tvShows.map(item => <MediaCard key={item.id} item={item} onClick={() => handleMediaClick(item)} isHome />)}
          </div>
        </section>
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedMedia) return null;
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-y-auto pb-52 animate-apple-open no-scrollbar">
        {/* Immersive Backdrop Header */}
        <div className="relative h-[65vh] w-full">
          <img src={selectedMedia.backdrop} className="w-full h-full object-cover opacity-60 scale-105" alt="Backdrop" />
          <div className="absolute inset-0 hbo-gradient" />
          <button onClick={() => { setView('home'); setSelectedMedia(null); }} className="fixed top-12 left-8 z-[60] ios-reflective p-5 fluid-geom-md liquid-tap border-white/20"><ChevronLeft size={32} /></button>
        </div>
        
        <div className="px-8 md:px-12 -mt-56 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-end mb-12">
            <div className="w-48 md:w-72 flex-shrink-0 aspect-[2/3] fluid-geom-lg overflow-hidden ios-reflective poster-border shadow-2xl animate-pop">
              <img src={selectedMedia.poster} className="w-full h-full object-cover" alt="Poster" />
            </div>
            
            <div className="flex-1 space-y-5 md:pb-6 animate-pop" style={{ animationDelay: '100ms' }}>
              <div className="flex flex-wrap gap-2">
                 <span className="format-badge ios-reflective px-3 py-1 fluid-geom-sm text-[9px] font-black tracking-widest text-white/80 border-white/10">{selectedMedia.format}</span>
                 {selectedMedia.category && <span className="format-badge ios-reflective px-3 py-1 fluid-geom-sm text-[9px] font-black tracking-widest text-lime-400 border-white/10 uppercase">{selectedMedia.category}</span>}
              </div>
              <h2 className="text-5xl md:text-8xl font-[900] tracking-tighter text-white text-vibrant leading-[0.9]">{selectedMedia.title}</h2>
              <div className="flex items-center flex-wrap gap-5 text-[11px] text-white/50 font-black uppercase tracking-[0.25em] text-vibrant">
                <span>{selectedMedia.year}</span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span>{selectedMedia.rating}</span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span>{selectedMedia.duration}</span>
              </div>
            </div>
          </div>

          <div className="space-y-14 animate-pop" style={{ animationDelay: '200ms' }}>
            <div className="space-y-8">
              <div className="flex gap-4 items-center">
                <button onClick={() => startPlayer()} className="ios-reflective text-white h-20 flex-1 fluid-geom-md flex items-center justify-center transition-all border-white/20 gap-4 text-xs font-black uppercase tracking-[0.25em] liquid-tap hover:bg-white hover:text-black">
                  <Play size={24} fill="currentColor" /> WATCH NOW
                </button>
                <button className="ios-reflective h-20 w-20 fluid-geom-md flex items-center justify-center transition-all border-white/20 liquid-tap"><Download size={24} /></button>
                <button className="ios-reflective h-20 w-20 fluid-geom-md flex items-center justify-center transition-all border-white/20 liquid-tap"><Share2 size={24} /></button>
              </div>
              
              {/* Infuse Style Progress Component */}
              {selectedMedia.progress !== undefined && (
                <div className="space-y-3 px-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                    <span>Core Sync Progress</span>
                    <span>{selectedMedia.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                    <div className="h-full shadow-[0_0_25px_rgba(163,230,53,0.7)] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)" style={{ width: `${selectedMedia.progress}%`, background: 'linear-gradient(90deg, #365314 0%, #bef264 100%)' }}>
                       <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 blur-sm" />
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_12px_white]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                <section className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 border-b border-white/5 pb-3">Metadata Overview</h4>
                  <p className="text-zinc-300 text-xl md:text-2xl font-light leading-relaxed max-w-5xl opacity-90">{selectedMedia.description}</p>
                </section>

                <section className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 border-b border-white/5 pb-3">Genre Classification</h4>
                   <div className="flex flex-wrap gap-3">
                     {(selectedMedia.genres || [selectedMedia.category]).map((genre, idx) => (
                       <span key={idx} className="genre-chip px-7 py-3 bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/70 hover:border-lime-400/50 hover:text-white transition-all">{genre}</span>
                     ))}
                   </div>
                </section>
              </div>

              <div className="space-y-12">
                <section className="space-y-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 border-b border-white/5 pb-3">Neural Cast</h4>
                  <div className="grid grid-cols-1 gap-6 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
                    {(selectedMedia.cast || []).map((member, idx) => (
                      <div key={idx} className="flex items-center gap-5 group">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-900 border border-white/10 flex-shrink-0">
                          <img src={member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={member.name} />
                        </div>
                        <div>
                          <div className="text-base font-black group-hover:text-lime-400 transition-colors leading-tight">{member.name}</div>
                          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 border-b border-white/5 pb-3">Stream Protocol</h4>
                   <div className="vibrant-glass p-6 fluid-geom-md space-y-4">
                     <div className="flex justify-between items-center text-[10px]">
                       <span className="text-white/40 uppercase font-black tracking-widest">Format</span>
                       <span className="text-white/80 font-bold uppercase">{selectedMedia.format.split(' • ')[0]}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px]">
                       <span className="text-white/40 uppercase font-black tracking-widest">Encoding</span>
                       <span className="text-white/80 font-bold uppercase">{selectedMedia.format.includes('4K') ? 'HEVC (H.265)' : 'AVC (H.264)'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px]">
                       <span className="text-white/40 uppercase font-black tracking-widest">DR Layer</span>
                       <span className="text-lime-400 font-bold uppercase">{selectedMedia.format.includes('HDR') || selectedMedia.format.includes('VISION') ? 'High Dynamic Range' : 'Standard'}</span>
                     </div>
                   </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCloud = () => (
    <div className="p-12 space-y-8 animate-apple-open">
      <h2 className="text-4xl font-black tracking-tighter text-vibrant">Cloud Storage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="vibrant-glass p-8 fluid-geom-md border-white/10 flex flex-col items-center gap-6 text-center">
           <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Monitor size={32} /></div>
           <div>
             <h4 className="text-xl font-black">Google Drive</h4>
             <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">Connected</p>
           </div>
           <button className="ios-reflective px-8 py-3 fluid-geom-sm text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white hover:text-black transition-all">Browse Files</button>
        </div>
        {/* Placeholder for other providers */}
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl animate-apple-open p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center gap-6 border-b border-white/20 pb-8">
           <SearchIcon size={48} className="text-white/20" />
           <input 
             autoFocus
             placeholder="Search Neural Library..." 
             className="bg-transparent text-5xl font-black tracking-tighter outline-none flex-1 placeholder:text-white/10"
           />
           <button onClick={() => setIsSearchOpen(false)} className="ios-reflective p-4 fluid-geom-md border-white/10"><X size={32} /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {library.slice(0, 4).map(item => <MediaCard key={item.id} item={item} onClick={() => handleMediaClick(item)} />)}
        </div>
      </div>
    </div>
  );

  // Auth/Loading logic
  if (!isAuthenticated) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <GlobalBackgroundVideo />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <main className="h-screen overflow-y-auto no-scrollbar relative z-10">
        {isSearchOpen && renderSearch()}
        {view === 'home' && renderHome()}
        {view === 'details' && renderDetails()}
        {view === 'cloud' && renderCloud()}
        {view === 'downloads' && <div className="p-12"><h2 className="text-4xl font-black tracking-tighter text-vibrant">Sync Center</h2><p className="text-white/40 mt-4 uppercase tracking-widest text-[10px]">No active downloads</p></div>}
      </main>
      {isPlayerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          <AppleStylePlayer 
            source="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
            title={selectedMedia?.title}
            onClose={() => setIsPlayerOpen(false)}
          />
        </div>
      )}
      <BottomNav active={view === 'details' ? 'home' : view} onNavigate={setView} />
    </div>
  );
}

// --- Specialized UI Fragments (Memoized) ---
const HeroSection = React.memo(({ item, onInfo, onPlay }: { item: MediaItem; onInfo: () => void; onPlay: () => void }) => (
  <div className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden">
    <img src={item.backdrop} className="w-full h-full object-cover scale-110 opacity-70" alt={item.title} />
    <div className="absolute inset-0 hbo-gradient" />
    <div className="absolute bottom-36 left-0 right-0 px-12 flex flex-col items-start max-w-2xl">
      <div className="flex items-center gap-3 mb-6 animate-pop">
        <PlayCircle size={18} className="text-lime-500" />
        <span className="text-white text-[11px] font-black tracking-[0.45em] uppercase opacity-90">Curated Masterpiece</span>
      </div>
      <h1 className="responsive-title font-[900] mb-10 tracking-tighter text-vibrant animate-pop">{item.title}</h1>
      <p className="text-zinc-200 text-sm md:text-xl font-medium mb-12 line-clamp-2 animate-pop leading-relaxed opacity-90">{item.description}</p>
      <div className="flex gap-5 w-full animate-pop">
        <button onClick={onPlay} className="ios-reflective text-white h-20 px-12 flex-1 md:flex-initial fluid-geom-md font-black text-sm flex items-center justify-center gap-4 transition-all border-white/20 liquid-tap hover:bg-white hover:text-black">
          <Play size={26} fill="currentColor" /> WATCH NOW
        </button>
        <button onClick={onInfo} className="ios-reflective text-white h-20 w-20 fluid-geom-md font-bold flex items-center justify-center transition-all liquid-tap border-white/20"><Info size={30} /></button>
      </div>
    </div>
  </div>
));

const AuthScreen = React.memo(({ onAuth }: { onAuth: () => void }) => (
  <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-12 text-center animate-apple-open overflow-hidden">
    <GlobalBackgroundVideo isAuth />
    <div className="mb-24 animate-pop relative z-10">
      <div className="absolute -inset-20 bg-lime-400/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
      <div className="text-8xl md:text-9xl font-black italic tracking-tighter mb-4 text-white text-vibrant drop-shadow-[0_0_60px_rgba(190,242,100,0.3)] uppercase">LUMINA</div>
      <p className="text-zinc-300 font-bold uppercase tracking-[0.8em] text-[11px] opacity-80 pl-2">Neural Media Hub</p>
    </div>
    <div className="w-full max-w-sm space-y-6 relative z-10 p-8 fluid-geom-lg vibrant-glass border-white/5 shadow-2xl">
      <button onClick={onAuth} className="w-full h-20 fluid-geom-md flex items-center gap-6 px-8 bg-blue-600 transition-all hover:scale-105 active:scale-95 liquid-tap shadow-2xl border border-white/10">
        <span className="flex-1 text-center font-black tracking-tight text-sm text-white">CONTINUE WITH GOOGLE</span>
      </button>
      <button onClick={onAuth} className="w-full h-20 fluid-geom-md flex items-center gap-6 px-8 bg-sky-600 transition-all hover:scale-105 active:scale-95 liquid-tap shadow-2xl border border-white/10">
        <span className="flex-1 text-center font-black tracking-tight text-sm text-white">MICROSOFT SIGN IN</span>
      </button>
    </div>
  </div>
));

const MediaCard = React.memo(({ item, onClick, isHome }: { item: MediaItem; onClick: () => void; isHome?: boolean }) => (
  <div onClick={onClick} className="relative flex-shrink-0 poster-width transition-all duration-500 cursor-pointer group animate-pop liquid-tap">
    <div className="aspect-[2/3] fluid-geom-md overflow-hidden bg-zinc-900/50 poster-border backdrop-blur-md transition-all duration-700 group-hover:border-white/40 relative">
      <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:opacity-60" loading="lazy" />
      <div className="absolute top-4 right-4">
        <span className="format-badge ios-reflective px-2.5 py-1.5 fluid-geom-sm text-[8px] font-black uppercase tracking-widest backdrop-blur-md border-white/10">{item.format.split(' • ')[0]}</span>
      </div>
    </div>
    {item.progress !== undefined && item.progress > 0 && (
      <div className={`mt-3 h-[4px] w-full rounded-full overflow-hidden relative ${isHome ? 'bg-white/10' : 'bg-white/5'}`}>
        <div className="h-full shadow-[0_0_15px_rgba(163,230,53,0.7)] transition-all duration-500 relative" style={{ width: `${item.progress}%`, background: 'linear-gradient(90deg, #4d7c0f 0%, #bef264 100%)' }}>
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
        </div>
      </div>
    )}
    <div className={`${item.progress ? 'mt-3' : 'mt-5'} px-2`}>
      <h4 className="text-[17px] font-[900] truncate text-white tracking-[-0.06em] group-hover:text-lime-400 transition-all duration-300 leading-tight">{item.title}</h4>
      <p className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.25em] mt-1.5 opacity-60">{item.year} • {item.category}</p>
    </div>
  </div>
));
