import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  MessageSquare, 
  Shield, 
  Zap, 
  Smartphone, 
  Clock, 
  User, 
  CheckCircle, 
  ArrowRight, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  RefreshCw, 
  Cpu, 
  Wifi, 
  Globe, 
  Bell, 
  Maximize2, 
  X, 
  AlertTriangle,
  Monitor,
  Check
} from 'lucide-react';

// APK Download URL Variable for future integration
const APK_DOWNLOAD_URL = ""; 

export default function DownloadPage() {
  // Device Detection State
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isSimulatedMobile, setIsSimulatedMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Download simulation state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState("0 KB/s");
  const [downloadedBytes, setDownloadedBytes] = useState("0 MB");

  // Accordion FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Active Screenshot Preview state
  const [activeScreenshot, setActiveScreenshot] = useState(null);

  // App Metadata
  const appMeta = {
    name: "Bloop",
    version: "v1.2.0",
    apkSize: "24.5 MB",
    tagline: "Fast, Secure and Reliable Mobile Experience",
    updatedDate: "June 2026",
    minAndroid: "Android 8.0 (Oreo) or higher",
    developer: "Bloop Dev Team",
    buildNumber: "10204",
    packageName: "com.bloop.chat",
    platform: "Android (ARM64-v8a, armeabi-v7a, x86_64)"
  };

  // Device detection on mount
  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isIPadOS = (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Macintosh/.test(ua));
      const isSmallScreen = window.innerWidth < 1024;

      setIsMobileOrTablet(isMobileUA || isIPadOS || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => {
      window.removeEventListener('resize', checkDevice);
      clearTimeout(timer);
    };
  }, []);

  const startDownload = () => {
    if (!termsAccepted || isDownloading || downloadSuccess) return;

    console.log("Analytics: Download initiated. Version: " + appMeta.version);
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'apk_download_click', {
        'app_name': appMeta.name,
        'version': appMeta.version
      });
    }

    if (APK_DOWNLOAD_URL) {
      window.location.href = APK_DOWNLOAD_URL;
      setDownloadSuccess(true);
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadSuccess(false);

    let progress = 0;
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 15) + 5;
      progress += increment;

      if (progress >= 100) {
        progress = 100;
        setDownloadProgress(100);
        setIsDownloading(false);
        setDownloadSuccess(true);
        clearInterval(interval);
      } else {
        setDownloadProgress(progress);
        const speed = (Math.random() * 2 + 1.5).toFixed(1) + " MB/s";
        setDownloadSpeed(speed);
        const currentMB = ((progress / 100) * 24.5).toFixed(1);
        setDownloadedBytes(`${currentMB} MB`);
      }
    }, 250);
  };

  // Mock UI Mobile Screens for Slider
  const mockScreens = [
    {
      id: 1,
      title: "Secure Gateway",
      description: "Encrypted, modern, passwordless authentication panel",
      component: (
        <div className="w-full h-full bg-[#fbfbfc] flex flex-col justify-between p-4 relative overflow-hidden select-none text-slate-800">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-400/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-10 left-0 w-28 h-28 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-center text-slate-400 text-[10px] border-b border-slate-100 pb-2">
            <span className="font-bold tracking-widest text-cyan-500">BLOOP</span>
            <div className="flex space-x-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Gateway</span>
            </div>
          </div>

          <div className="my-auto flex flex-col items-center text-center space-y-4 px-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-400/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-850">Join Bloop</h4>
              <p className="text-[9px] text-slate-400 mt-0.5">The conversational node interface</p>
            </div>
            
            <div className="w-full space-y-2 text-left">
              <div className="h-7 w-full rounded-lg bg-white border border-slate-200/80 px-2 flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mr-2" />
                <div className="h-2 w-16 bg-slate-300 rounded" />
              </div>
              <div className="h-7 w-full rounded-lg bg-white border border-slate-200/80 px-2 flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mr-2" />
                <div className="h-2 w-24 bg-slate-300 rounded" />
              </div>
            </div>

            <button className="h-8 w-full rounded-lg bg-cyan-500 text-white font-semibold text-[10px] shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer">
              Sign In
            </button>
          </div>

          <div className="h-1.5 w-16 bg-slate-300 rounded-full mx-auto mt-2" />
        </div>
      )
    },
    {
      id: 2,
      title: "Interactive Dashboard",
      description: "Clean, responsive conversations stream with status badges",
      component: (
        <div className="w-full h-full bg-[#fbfbfc] flex flex-col p-3 relative overflow-hidden select-none text-slate-800">
          <div className="flex justify-between items-center pb-2.5 mb-2 border-b border-slate-100">
            <span className="text-xs font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-teal-500">Chats</span>
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-500" />
            </div>
          </div>
          
          <div className="h-6 w-full rounded-full bg-slate-100 px-3 flex items-center mb-3">
            <div className="h-2 w-20 bg-slate-300 rounded" />
          </div>

          <div className="flex-1 space-y-2 overflow-hidden">
            {[
              { name: "Sarah Connor", text: "Are we deploying today?", online: true, unread: 2, color: "from-cyan-400 to-sky-500" },
              { name: "John Doe", text: "Let's review the mockups later.", online: true, unread: 0, color: "from-teal-400 to-emerald-500" },
              { name: "Alex Mercer", text: "Voice message (0:14)", online: false, unread: 0, color: "from-sky-400 to-blue-400" },
              { name: "Bloop Support", text: "Welcome to your new dashboard!", online: true, unread: 1, color: "from-cyan-400 to-teal-400" }
            ].map((c, i) => (
              <div key={i} className="p-2 rounded-xl bg-white border border-slate-100 flex items-center space-x-2.5 shadow-sm">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.color} flex items-center justify-center text-[9px] font-bold text-white shadow-sm`}>
                    {c.name.charAt(0)}
                  </div>
                  {c.online && <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-slate-800 truncate">{c.name}</span>
                    <span className="text-[8px] text-slate-400">12:34 PM</span>
                  </div>
                  <p className="text-[8.5px] text-slate-500 truncate mt-0.5">{c.text}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] font-extrabold text-white">
                    {c.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-1.5 w-16 bg-slate-300 rounded-full mx-auto mt-2" />
        </div>
      )
    },
    {
      id: 3,
      title: "Real-Time Terminal",
      description: "Buttery-smooth message flows with connection feedback",
      component: (
        <div className="w-full h-full bg-[#fbfbfc] flex flex-col p-3 relative overflow-hidden select-none text-slate-850">
          <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-500 flex items-center justify-center text-[9px] font-bold text-white">S</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[9.5px] font-bold text-slate-800 leading-none">Sarah Connor</h5>
              <span className="text-[7.5px] text-emerald-500 font-semibold">Active Now</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-hidden flex flex-col justify-end">
            <div className="self-start max-w-[80%] p-2 rounded-2xl rounded-tl-sm bg-slate-100 text-[9.5px] text-slate-700">
              Hey! Did you check the new APK update?
            </div>
            <div className="self-end max-w-[80%] p-2 rounded-2xl rounded-tr-sm bg-gradient-to-tr from-cyan-400 via-sky-400 to-teal-400 text-[9.5px] text-white shadow-sm shadow-cyan-400/5">
              Yeah, it is incredibly fast. Animations are running at a solid 60fps!
            </div>
            <div className="self-start max-w-[80%] p-2 rounded-2xl rounded-tl-sm bg-slate-100 text-[9.5px] text-slate-700">
              Awesome, downloading it now 🚀
            </div>
            <div className="text-[7px] text-slate-450 self-end flex items-center space-x-1 mr-1">
              <span>Read</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            </div>
          </div>

          <div className="mt-2 h-7 w-full rounded-full bg-slate-50 border border-slate-100 px-3 flex items-center justify-between">
            <div className="h-2.5 w-32 bg-slate-200 rounded-full" />
            <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
              <ArrowRight className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="h-1.5 w-16 bg-slate-300 rounded-full mx-auto mt-2" />
        </div>
      )
    },
    {
      id: 4,
      title: "Interactive Settings",
      description: "Easily adjust dynamic themes and background visual features",
      component: (
        <div className="w-full h-full bg-[#fbfbfc] flex flex-col p-3 relative overflow-hidden select-none text-slate-800">
          <div className="text-xs font-bold text-slate-800 mb-3">Settings</div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-3 p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-800">Profile Node</p>
                <p className="text-[7.5px] text-slate-400">Configure public credentials</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-100 space-y-2 shadow-sm">
              <span className="text-[8px] uppercase tracking-wider text-slate-450 font-extrabold block">Preferences</span>
              
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-650">Dynamic Ambient Glow</span>
                <div className="w-6 h-3.5 rounded-full bg-cyan-500 p-0.5 flex justify-end items-center cursor-pointer">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-650">Haptic Feedback</span>
                <div className="w-6 h-3.5 rounded-full bg-slate-200 p-0.5 flex justify-start items-center cursor-pointer">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-650">Hardware Acceleration</span>
                <div className="w-6 h-3.5 rounded-full bg-cyan-500 p-0.5 flex justify-end items-center cursor-pointer">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-1.5 w-16 bg-slate-300 rounded-full mx-auto mt-2" />
        </div>
      )
    },
    {
      id: 5,
      title: "Media vault",
      description: "Browse high-definition gallery elements and shared files",
      component: (
        <div className="w-full h-full bg-[#fbfbfc] flex flex-col p-3 relative overflow-hidden select-none text-slate-800">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-800">Media Gallery</span>
            <span className="text-[8px] text-slate-450 uppercase">24 Shared Items</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 flex-1 overflow-hidden">
            {[
              "from-cyan-400 to-blue-500",
              "from-teal-400 to-emerald-500",
              "from-sky-400 to-indigo-500",
              "from-cyan-500 to-teal-500",
              "from-blue-400 to-cyan-500",
              "from-teal-300 to-cyan-400",
              "from-sky-300 to-blue-400",
              "from-emerald-450 to-teal-500",
              "from-cyan-600 to-blue-600"
            ].map((gradient, i) => (
              <div key={i} className={`aspect-square rounded-lg bg-gradient-to-tr ${gradient} opacity-85 flex items-center justify-center border border-white`}>
                <span className="text-[8px] font-mono text-white/70">#{i+1}</span>
              </div>
            ))}
          </div>
          
          <div className="h-1.5 w-16 bg-slate-300 rounded-full mx-auto mt-2" />
        </div>
      )
    }
  ];

  // Features list
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-cyan-500" />,
      title: "Fast Performance",
      desc: "Instant loading, optimized thread handling, and smooth 60fps transitions across all screens."
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      title: "Secure Authentication",
      desc: "Robust industry-grade protection keeping your local authentication credentials completely safe."
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-sky-500" />,
      title: "Real-Time Updates",
      desc: "Synchronized message nodes with extremely fast pipeline feedback."
    },
    {
      icon: <Smartphone className="w-5 h-5 text-teal-500" />,
      title: "Modern User Interface",
      desc: "Beautiful glassmorphism styled pages designed with elegant mobile layouts."
    },
    {
      icon: <Wifi className="w-5 h-5 text-blue-500" />,
      title: "Offline Support",
      desc: "Cache mechanisms allowing you to read previously loaded messages seamlessly."
    },
    {
      icon: <Globe className="w-5 h-5 text-cyan-600" />,
      title: "Cloud Synchronization",
      desc: "Optimistic background sync to keep files current the moment you connect."
    },
    {
      icon: <Bell className="w-5 h-5 text-sky-600" />,
      title: "Push Notifications",
      desc: "Instant, real-time alert logs keeping you updated on messages."
    },
    {
      icon: <Lock className="w-5 h-5 text-teal-600" />,
      title: "Data Privacy Protection",
      desc: "Encrypted transmission protecting critical credentials from third-party interception."
    }
  ];

  // Desktop Blocker Screen Component
  if (!isMobileOrTablet && !isSimulatedMobile) {
    return (
      <div className="absolute inset-0 h-full w-full bg-[#f8fafc] flex flex-col justify-center items-center p-6 text-center text-slate-800 font-sans">
        {/* Glow Effects (Cyan/Teal) */}
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-300/20 blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-teal-350/20 blur-[100px] pointer-events-none -z-10" />
        
        <div className="max-w-md p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-cyan-100 flex flex-col items-center space-y-6 shadow-xl relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-450 via-sky-450 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-400/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500">
              Mobile Only Access
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              This application is available only for mobile devices. Please open this page from your phone or tablet.
            </p>
          </div>

          <div className="w-full h-[1px] bg-slate-200" />

          {/* Simulate view toggle button for developer review */}
          <div className="space-y-3 w-full">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Testing Sandbox</p>
            <button 
              onClick={() => setIsSimulatedMobile(true)}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer text-slate-700"
            >
              <Monitor className="w-4 h-4 text-cyan-500" />
              <span>Simulate Mobile Viewport</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile / Tablet Main Landing Page Layout (White Theme)
  return (
    <div className="absolute inset-0 h-full w-full overflow-y-auto bg-[#f8fafc] text-slate-800 font-sans overflow-x-hidden pb-12 selection:bg-cyan-500/20 selection:text-slate-850">
      {/* Background ambient blurring elements */}
      <div className="absolute top-[2%] left-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-300/25 blur-[80px] pointer-events-none -z-10" />
      <div className="absolute top-[35%] right-[-10%] w-[280px] h-[280px] rounded-full bg-teal-300/20 blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[-5%] w-[320px] h-[320px] rounded-full bg-sky-200/30 blur-[80px] pointer-events-none -z-10" />

      {/* Developer Simulate Exit Badge (If viewing simulation on desktop) */}
      {isSimulatedMobile && (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 py-2 border-b border-cyan-100 flex justify-between items-center text-xs text-slate-800 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Simulated Mobile Mode</span>
          </div>
          <button 
            onClick={() => setIsSimulatedMobile(false)}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold cursor-pointer text-slate-700"
          >
            Exit Sandbox
          </button>
        </div>
      )}

      {/* Main Container constrained to Max Mobile/Tablet widths */}
      <div className="max-w-[480px] mx-auto px-4 pt-8 md:px-6 relative">
        
        {/* Loading Skeletons State */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200" />
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-40 bg-slate-200 rounded" />
            </div>
            <div className="h-64 w-full bg-slate-200 rounded-3xl" />
            <div className="h-36 w-full bg-slate-200 rounded-3xl" />
            <div className="space-y-3">
              <div className="h-10 w-full bg-slate-200 rounded-xl" />
              <div className="h-10 w-full bg-slate-200 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. HERO SECTION */}
            <section className="flex flex-col items-center text-center pt-4">
              {/* App Logo */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-450 via-sky-450 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-400/20 mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              
              {/* App Titles */}
              <h1 className="text-3xl font-black tracking-tight text-slate-850">{appMeta.name}</h1>
              <p className="text-[11px] font-bold text-slate-450 uppercase tracking-widest mt-1.5">
                {appMeta.tagline}
              </p>

              {/* Badges Info */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="px-2.5 py-1 rounded-full bg-white/70 border border-cyan-100 text-[9.5px] font-bold text-cyan-600 shadow-sm">
                  Version {appMeta.version}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/70 border border-cyan-100 text-[9.5px] font-bold text-sky-600 shadow-sm">
                  Size: {appMeta.apkSize}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/70 border border-cyan-100 text-[9.5px] font-bold text-teal-600 shadow-sm">
                  {appMeta.minAndroid}
                </span>
              </div>
              
              {/* Hero details table */}
              <div className="w-full mt-6 grid grid-cols-2 gap-3 text-left text-xs bg-white/60 border border-cyan-100 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2 text-slate-500">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  <div>
                    <p className="text-[8.5px] leading-none text-slate-400">Developer</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{appMeta.developer}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  <div>
                    <p className="text-[8.5px] leading-none text-slate-400">Last Updated</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{appMeta.updatedDate}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. APP SCREENSHOTS SECTION (CAROUSEL) */}
            <section className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-600">App Screenshots</h2>
              
              {/* Screenshot Slider Container */}
              <div className="w-full overflow-x-auto flex space-x-4 pb-2 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing">
                {mockScreens.map((screen) => (
                  <div 
                    key={screen.id} 
                    className="flex-shrink-0 w-[180px] h-[340px] rounded-3xl border-4 border-slate-200 bg-[#fbfbfc] overflow-hidden snap-start relative shadow-lg hover:border-slate-300 transition-colors group"
                  >
                    {screen.component}
                    
                    {/* Hover expand overlay */}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button 
                        onClick={() => setActiveScreenshot(screen)}
                        className="p-2.5 rounded-full bg-cyan-500 text-white shadow-md transform scale-90 group-hover:scale-100 transition-transform cursor-pointer hover:bg-cyan-600"
                        aria-label="Preview screenshot"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-center text-slate-400">Swipe horizontal to view screens</p>
            </section>

            {/* 3. FEATURES SECTION */}
            <section className="space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-600">Core Features</h2>
              
              <div className="grid grid-cols-1 gap-3">
                {features.map((feat, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-2xl bg-white/60 border border-cyan-100 hover:border-cyan-200/80 transition-colors flex space-x-3.5 shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/5 border border-cyan-100 flex items-center justify-center shrink-0">
                      {feat.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-800">{feat.title}</h3>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. WHY CHOOSE THIS APP SECTION */}
            <section className="p-5 rounded-3xl bg-gradient-to-br from-cyan-50/50 to-teal-50/40 border border-cyan-150 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-700">Why Choose Bloop?</h2>
              
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  "Optimized for Android operating frameworks",
                  "Lightweight APK footprint preserving local memory",
                  "Super-fast and safe installation logs",
                  "Secure and encrypted local data storage logs",
                  "Regular features and compatibility updates",
                  "Easy to navigate conversational flows"
                ].map((text, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-650 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. DOWNLOAD CARD SECTION */}
            <section id="download-card" className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-sky-600">Install Channel</h2>
              
              <div className="p-6 rounded-3xl bg-white/80 border border-cyan-100 flex flex-col items-center space-y-5 shadow-lg relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-cyan-500/5 blur-xl pointer-events-none" />
                
                <div className="w-full flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-450">Latest Build</p>
                    <p className="font-extrabold text-slate-800 text-sm">{appMeta.version}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-450">APK Weight</p>
                    <p className="font-extrabold text-slate-800 text-sm">{appMeta.apkSize}</p>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* Simulated Download Progress bar */}
                <AnimatePresence>
                  {isDownloading && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full space-y-2"
                    >
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Downloading: {downloadedBytes} / {appMeta.apkSize}</span>
                        <span>{downloadSpeed}</span>
                      </div>
                      
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-200"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                      <div className="text-right text-[10px] text-cyan-600 font-bold">{downloadProgress}% complete</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success Message Placeholder */}
                <AnimatePresence>
                  {downloadSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5"
                    >
                      <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-800">APK Download Complete!</h4>
                      <p className="text-[9.5px] text-slate-500">Check your system file manager to complete application installation.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* T&C Checklist verification warning */}
                {!termsAccepted && (
                  <p className="text-[9.5px] text-orange-600 text-center flex items-center justify-center space-x-1.5 bg-orange-50 border border-orange-200 p-2.5 rounded-xl">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Please read and agree to Terms & Conditions below to enable download.</span>
                  </p>
                )}

                {/* Interactive Download Action Button */}
                <button
                  onClick={startDownload}
                  disabled={!termsAccepted || isDownloading}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
                    !termsAccepted 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : isDownloading
                      ? 'bg-slate-100 text-cyan-600 border border-cyan-200 pointer-events-none'
                      : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500 hover:opacity-95 text-white shadow-md shadow-cyan-500/10 active:scale-[0.98]'
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-500 rounded-full animate-spin" />
                      <span>Fetching APK Package...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{downloadSuccess ? 'Download Again' : 'Download APK'}</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* 6. TERMS AND CONDITIONS SECTION */}
            <section className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-600">Terms & Conditions</h2>
              
              <div className="p-4 rounded-3xl bg-white/80 border border-cyan-100 space-y-3.5 shadow-sm">
                <div className="h-28 overflow-y-auto pr-1 text-[9.5px] text-slate-500 space-y-2 border-b border-slate-100 pb-2 scrollbar-none">
                  <p className="font-bold text-slate-800">1. User Responsibility</p>
                  <p>You agree to deploy and access the Bloop client only in compliance with regional telecommunication laws. You accept sole responsibility for all credentials entered within the app layout.</p>
                  
                  <p className="font-bold text-slate-800">2. Data Privacy</p>
                  <p>Accounts run on local cryptographic records. Storage of message logs is encrypted on the device cache system and does not compile telemetry indexes outside user preferences.</p>
                  
                  <p className="font-bold text-slate-805">3. Proper Application Use</p>
                  <p>The application should be used solely for private conversational routing. Network queries may not be flooded or loaded with automated stress scripts.</p>
                  
                  <p className="font-bold text-slate-800">4. Reverse Engineering</p>
                  <p>You strictly agree not to decompile, reverse engineer, or trace bytecode signatures of this distribution package file to extract configuration configurations.</p>
                  
                  <p className="font-bold text-slate-800">5. Update Policies</p>
                  <p>Updates are pushed periodically to secure local endpoints. Using legacy releases might disrupt the integrity of message transmissions.</p>
                  
                  <p className="font-bold text-slate-800">6. Limitation of Liability</p>
                  <p>The development team is not responsible for data transmission integrity failures resulting from unauthorized client builds or network interference.</p>
                </div>

                {/* Consent checkbox */}
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs select-none">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-350 bg-white text-cyan-600 focus:ring-cyan-500/50"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    I have read and agree to the Terms & Conditions.
                  </span>
                </label>
              </div>
            </section>

            {/* 7. PRIVACY POLICY SECTION */}
            <section className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-600">Privacy Policy</h2>
              
              <div className="p-5 rounded-3xl bg-white/80 border border-cyan-100 space-y-4 shadow-sm">
                <div className="space-y-3 text-[10px] text-slate-500 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-slate-800 text-[10.5px]">Data Collection</h4>
                    <p className="mt-0.5">We do not store plain-text conversation indexes on central servers. Account creations only compile local username aliases, emails, and device platform tokens to link message endpoints.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[10.5px]">Data Usage</h4>
                    <p className="mt-0.5">Collected metadata serves only to deliver notifications and coordinate incoming/outgoing web sockets. No indexes are shared with third-party tracking portals.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[10.5px]">Data Protection</h4>
                    <p className="mt-0.5">Storage caches utilize state-of-the-art sandbox structures unique to mobile environments to isolate the app database from external reading.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[10.5px]">User Rights</h4>
                    <p className="mt-0.5">You hold full rights to purge local caches or delete registration credentials directly through the Profile panel, which terminates cloud associations instantly.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[10.5px]">Contact Information</h4>
                    <p className="mt-0.5">For inquiries regarding transport security configurations, contact security@bloop.chat.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. FAQ SECTION */}
            <section className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-cyan-600">Frequently Asked Questions</h2>
              
              <div className="space-y-2">
                {[
                  {
                    q: "How do I install the APK?",
                    a: "1. Tap 'Download APK' above to download the file.\n2. Open your device 'Settings', navigate to 'Security' or 'Apps', and toggle 'Install Unknown Apps' (or 'Allow from this source').\n3. Locate the downloaded file in your notification drawer or 'Downloads' directory and tap to install."
                  },
                  {
                    q: "Is the application free?",
                    a: "Yes. Bloop is an open, client-driven platform. There are no download charges, usage subscriptions, or registration fees required."
                  },
                  {
                    q: "Is my data secure?",
                    a: "Bloop coordinates transport links directly. Message nodes are transient and do not compile persistent records on external networks, minimizing the footprint of data storage leaks."
                  },
                  {
                    q: "How do I update the application?",
                    a: "You can visit this download page periodically. If an update becomes critical, the Bloop messaging client will display an alert directing you to fetch the latest compilation."
                  },
                  {
                    q: "What Android version is required?",
                    a: "Bloop requires Android 8.0 (Oreo) or later. The compilation uses optimized APIs that require this base framework to operate."
                  }
                ].map((faq, i) => (
                  <div key={i} className="rounded-2xl border border-cyan-100 bg-white/80 overflow-hidden shadow-sm transition-all">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                      className="w-full p-4 flex justify-between items-center text-left text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-slate-700">{faq.q}</span>
                      {openFaqIndex === i ? (
                        <ChevronUp className="w-4 h-4 text-cyan-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {openFaqIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <p className="p-4 text-[10px] text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50/50">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

            {/* 9. APP INFORMATION CARD */}
            <section className="space-y-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-600">Technical Specifications</h2>
              
              <div className="p-5 rounded-3xl bg-white/80 border border-cyan-100 shadow-sm">
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                  <div>
                    <p className="text-[9px] text-slate-450 uppercase font-black">App Name</p>
                    <p className="font-bold text-slate-800 mt-0.5">{appMeta.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-455 uppercase font-black">Version</p>
                    <p className="font-bold text-slate-800 mt-0.5">{appMeta.version}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 uppercase font-black">Build Number</p>
                    <p className="font-bold text-slate-800 mt-0.5">{appMeta.buildNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 uppercase font-black">Package Name</p>
                    <p className="font-bold text-slate-800 mt-0.5 truncate">{appMeta.packageName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 uppercase font-black">Developer</p>
                    <p className="font-bold text-slate-800 mt-0.5">{appMeta.developer}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 uppercase font-black">Release Date</p>
                    <p className="font-bold text-slate-800 mt-0.5">{appMeta.updatedDate}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 uppercase font-black">APK Weight</p>
                    <p className="font-bold text-slate-800 mt-0.5">{appMeta.apkSize}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 uppercase font-black">Architecture</p>
                    <p className="font-bold text-slate-800 mt-0.5 text-[10px] leading-tight">{appMeta.platform}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="text-center pt-4 pb-6 space-y-2 border-t border-slate-200">
              <div className="flex justify-center space-x-1.5 items-center text-[10px] text-slate-450">
                <span>© 2026 Bloop Chat.</span>
                <span>•</span>
                <span>All rights reserved.</span>
              </div>
              <p className="text-[8px] text-slate-400">
                This distribution is compiled securely. Double check file checksums prior to manual side-loading.
              </p>
            </footer>

          </div>
        )}

      </div>

      {/* 10. FULL SCREEN SCREENSHOT PREVIEW MODAL */}
      <AnimatePresence>
        {activeScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 flex flex-col justify-center items-center p-4 backdrop-blur-sm"
          >
            {/* Close trigger overlay */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={() => setActiveScreenshot(null)} />
            
            {/* Modal Header */}
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-3 bg-white/90 px-3 py-1.5 rounded-full shadow-md border border-cyan-50">
              <span className="text-xs text-slate-700 font-semibold">{activeScreenshot.title}</span>
              <button 
                onClick={() => setActiveScreenshot(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-250 text-slate-800 cursor-pointer transition-colors"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Phone Frame */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-[280px] h-[520px] rounded-[48px] border-[10px] border-slate-850 bg-white overflow-hidden shadow-2xl relative"
            >
              {/* Dynamic Screen Component */}
              {activeScreenshot.component}
            </motion.div>
            
            <p className="text-xs text-slate-600 mt-4 max-w-xs text-center z-10 font-bold bg-white/95 px-4 py-1.5 rounded-full shadow-md border border-cyan-50">{activeScreenshot.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
