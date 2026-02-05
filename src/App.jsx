import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Instagram, 
  Share2, 
  Building, 
  Key,     
  Gift,
  ArrowRight,
  Music,
  Star,
  Car,
  DollarSign,
  Globe,
  Camera,
  Loader,
  Layers, 
  Phone, 
  Facebook,
  User, 
  Smartphone,
  Volume2, 
  VolumeX,
  Play // Icon for the play button
} from 'lucide-react';

/**
 * L TOWER LOFT CONDO - INVITATION
 * Theme: Red & Gold Luxury
 * Content: Updated for "LTOWER Preah Monivong 2" event.
 * Layout: 
 * - Mobile: Vertical Stack (Hero -> Info -> 360 -> Gallery -> RSVP)
 * - Desktop: Split (Left: Hero+360 | Right: Info+Gallery+RSVP)
 * Fixes: 360 Viewer height increased (3x) and touch scrolling prevented.
 * Font: Kantumruy Pro
 */

// --- GOOGLE SHEET CONFIGURATION ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwscAXNDULxa5vLhz01vtzvsI-ZEGtlEA3vzjw4BDn-lLwQ980RslbsgqSBUHmorwA/exec";

// --- IMAGE PATH HELPER ---
const getImg = (path) => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Auto-detect if running on localhost or GitHub Pages
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const basePath = isLocal ? '/' : '/e-invitation/';
  return basePath + cleanPath;
};

// --- UTILS FOR PARTICLES ---
const Particle = ({ delay, left }) => (
  <div 
    className="absolute top-0 w-1 h-1 bg-white/30 rounded-full animate-fall"
    style={{ 
      left: `${left}%`, 
      animationDelay: `${delay}s`,
      animationDuration: `${3 + Math.random() * 2}s`
    }}
  />
);

// --- 360 SPHERICAL VIEWER COMPONENT (Three.js) ---
const ThreeSixtyViewer = ({ imageUrl }) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [textureLoaded, setTextureLoaded] = useState(false);

  useEffect(() => {
    if (window.THREE) {
      setIsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.THREE) return;

    const THREE = window.THREE;
    const container = containerRef.current;
    
    container.innerHTML = ''; 

    let camera, scene, renderer;
    let isUserInteracting = false,
        onPointerDownPointerX = 0, onPointerDownPointerY = 0,
        onPointerDownLon = 0, onPointerDownLat = 0,
        lon = 0, lat = 0,
        phi = 0, theta = 0;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    scene = new THREE.Scene();

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    const finalUrl = imageUrl.startsWith('http') ? imageUrl : getImg(imageUrl);

    const texture = textureLoader.load(finalUrl, () => {
        setTextureLoaded(true);
    }, undefined, (err) => {
       console.warn("Texture load error", err);
       // Ensure loader disappears even on error to avoid bad UX
       setTextureLoaded(true);
    });
    
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const onPointerDown = (event) => {
        // Prevent default behavior to stop scrolling on touch devices
        if (event.type === 'touchstart') {
            event.preventDefault();
        }
        isUserInteracting = true;
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        onPointerDownPointerX = clientX;
        onPointerDownPointerY = clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
    };

    const onPointerMove = (event) => {
        // Prevent default behavior to stop scrolling on touch devices
        if (event.type === 'touchmove') {
            event.preventDefault();
        }
        if (!isUserInteracting) return;
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        lon = (onPointerDownPointerX - clientX) * 0.1 + onPointerDownLon;
        lat = (clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
    };

    const onPointerUp = () => {
        isUserInteracting = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseup', onPointerUp);
    container.addEventListener('mouseleave', onPointerUp);
    // Use passive: false to allow preventDefault()
    container.addEventListener('touchstart', onPointerDown, { passive: false });
    container.addEventListener('touchmove', onPointerMove, { passive: false });
    container.addEventListener('touchend', onPointerUp);

    let animationId;
    const update = () => {
        if (!isUserInteracting) {
            lon += 0.05; 
        }
        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.Math.degToRad(90 - lat);
        theta = THREE.Math.degToRad(lon);

        const x = 500 * Math.sin(phi) * Math.cos(theta);
        const y = 500 * Math.cos(phi);
        const z = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(x, y, z);
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(update);
    };
    update();

    const onWindowResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onWindowResize);
        if (container) {
            container.innerHTML = '';
        }
    };
  }, [isLoaded, imageUrl]);

  return (
    // Added touch-none to prevent browser handling touch gestures (scrolling/zooming) on this div
    <div className="w-full h-full relative bg-black touch-none">
        {(!isLoaded || !textureLoaded) && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                    <span className="text-xs text-gray-400">Loading 3D...</span>
                </div>
            </div>
        )}
        <div ref={containerRef} className="w-full h-full cursor-move outline-none" />
    </div>
  );
};

// --- LOGO COMPONENT ---
const LTowerLogo = ({ className = "" }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <img 
      src={getImg("images/logo.png")} 
      alt="L TOWER Logo" 
      className="h-16 md:h-20 object-contain drop-shadow-lg"
      onError={(e) => { e.target.style.display = 'none'; }} 
    />
  </div>
);

// --- SHOWROOM IMAGES DATA ---
const SHOWROOM_IMAGES = [
  "images/bathroom.jpg",
  "images/gym.jpg",
  "images/IMG_3299.jpg",
  "images/IMG_3300.jpg",
  "images/IMG_3301.jpg",
  "images/IMG_8948.jpg",
  "images/kitchen.jpg",
  "images/IMG_8972.jpg",
  "images/IMG_8949.jpg",
  "images/IMG_8974.jpg"
];

// --- SECTIONS COMPONENTS ---

const HeroSection = ({ isMobile }) => (
    <div className={`relative w-full group overflow-hidden shrink-0 ${isMobile ? 'h-80' : 'h-1/2'}`}>
        <img 
            src={getImg("images/building.jpg")}
            alt="L Tower Loft Interior" 
            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-110"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 right-4 animate-pulse">
            <span className="px-3 py-1 bg-red-600 border border-red-400 text-white text-xs uppercase font-bold tracking-wider rounded-full shadow-lg">
                តម្លៃពិសេសមិនធ្លាប់មាន!
            </span>
        </div>
    </div>
);

// 360 Section with "Click to Load" functionality
const ThreeSixtySection = ({ isDesktop = false }) => {
    const [start360, setStart360] = useState(false);

    return (
        <div className={`px-4 md:px-6 py-6 bg-zinc-900 ${isDesktop ? 'bg-transparent h-1/2' : 'border-t border-neutral-800'} space-y-4`}>
            <h3 className="text-center text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Globe className="w-3 h-3" /> មើលទីតាំង & 360°
            </h3>

            {/* Changed height from h-80 to h-[700px] on mobile for extra tall view */}
            <div className={`relative w-full rounded-xl overflow-hidden border border-neutral-700 group shadow-lg ${isDesktop ? 'h-full' : 'h-[700px]'}`}>
                {start360 ? (
                    <ThreeSixtyViewer imageUrl="images/360.jpg" />
                ) : (
                    // STATIC PREVIEW MODE (Fast Loading)
                    <div 
                        className="relative w-full h-full cursor-pointer group bg-black" 
                        onClick={() => setStart360(true)}
                    >
                        <img 
                            src={getImg("images/360.jpg")} 
                            alt="360 Preview" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
                            onError={(e) => { e.target.src = getImg("images/building.jpg"); }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-xl group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-white fill-current ml-1" />
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/20">
                                Tap to View 360°
                            </span>
                        </div>
                    </div>
                )}
                
                {/* 360 Badge - Only show when active or as overlay */}
                {start360 && (
                     <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded-full border border-white/20 flex items-center gap-2 pointer-events-none z-20">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-white">360° Sphere</span>
                    </div>
                )}
            </div>

            <a 
                href="https://maps.app.goo.gl/HKyVoqJC5kiFvGZC9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 transition-colors group"
            >
                <MapPin className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">បង្ហាញផែនទី (Google Maps)</span>
            </a>
        </div>
    );
};

const GallerySection = ({ isDesktop = false }) => (
    <div className={`bg-zinc-900 ${isDesktop ? 'bg-transparent pt-6' : 'pt-6 pb-6 border-t border-neutral-800'} overflow-hidden shrink-0`}>
        {!isDesktop && <div className="w-full h-[1px] bg-neutral-800/50 mx-6 mb-4 w-[calc(100%-48px)]"></div>}
        <h3 className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
            <Camera className="w-3 h-3" /> ទស្សនាបន្ទប់គំរូ (Gallery)
        </h3>
        <div className="relative w-full overflow-hidden">
            <div className="flex w-max animate-scroll">
                {[...SHOWROOM_IMAGES, ...SHOWROOM_IMAGES].map((img, idx) => (
                    <div key={idx} className="w-48 h-32 mx-2 rounded-lg overflow-hidden shrink-0 border border-neutral-700 relative group">
                        <img 
                            src={getImg(img)} 
                            alt={`Showroom ${idx}`} 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- MAIN APP ---
const App = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState('idle');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleOpen = () => {
    setIsOpened(true);
    if (audioRef.current) {
        audioRef.current.play().then(() => {
            setIsMusicPlaying(true);
        }).catch(err => {
            console.log("Audio autoplay prevented", err);
        });
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
        if (isMusicPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setRsvpStatus('submitting');
    
    if (GOOGLE_SCRIPT_URL) {
      try {
        const dataToSend = {
            ...formData,
            phone: `'${formData.phone}` 
        };

        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend)
        });
      } catch (error) {
        console.error("Error sending to sheet", error);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setRsvpStatus('attending');
  };

  return (
    <div className="font-kantumruy text-white w-full overflow-x-hidden bg-neutral-950">
      {/* Global Audio Element */}
      <audio ref={audioRef} src={getImg("audio/bg-music.mp3")} loop />
      
      {/* Floating Music Button */}
      <button 
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-[100] w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white hover:scale-110 transition-transform shadow-xl"
      >
          {isMusicPlaying ? (
            <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
      </button>

      {!isOpened ? (
        // === COVER SCREEN ===
        <div className="fixed inset-0 bg-gradient-to-b from-[#8B0000] via-[#660000] to-black flex flex-col items-center justify-between py-12 px-6 overflow-hidden">
          
          <div className="absolute inset-0 pointer-events-none">
             {[...Array(30)].map((_, i) => (
               <Particle key={i} delay={Math.random() * 5} left={Math.random() * 100} />
             ))}
          </div>

          <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
             <img 
              src={getImg("images/building.jpg")}
              alt="Luxury Condo" 
              className="w-full h-full object-cover grayscale contrast-125"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop"; }} 
             />
          </div>

          <div className="relative z-10 w-full flex justify-center items-center pt-8">
             <LTowerLogo />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center justify-center flex-grow mt-[-20px]">
             <div className="absolute top-0 left-10 animate-pulse delay-700 opacity-60">
               <Star className="w-6 h-6 text-red-400 fill-red-400" />
             </div>
             
             <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] mb-3 leading-relaxed tracking-wide">
               កម្មវិធីបើកលក់
             </h1>
             
             <div className="relative mb-4">
               <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-[#FCD34D] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-relaxed animate-fade-in-up px-2 uppercase">
                 LTOWER ព្រះមុនីវង្ស 2
               </h2>
             </div>

             <div className="mb-6 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20">
               <p className="text-white text-base md:text-lg font-bold tracking-wide">សូមគោរពអញ្ជើញ</p>
             </div>

             <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-2 rounded-full border border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] transform rotate-[-2deg]">
               <p className="text-white text-base md:text-lg font-bold tracking-wide">តម្លៃជាង <span className="text-[#FCD34D] text-lg md:text-xl">$50,000</span></p>
             </div>
          </div>

          <div className="relative z-10 w-full flex flex-col items-center pb-8 gap-4">
             <button 
               onClick={handleOpen}
               className="group relative flex items-center gap-3 px-8 py-3 bg-black/40 backdrop-blur-md border border-[#FCD34D] text-white rounded-lg hover:bg-black/60 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(252,211,77,0.3)]"
             >
               <div className="flex flex-col items-start leading-none pr-2">
                 <span className="text-[9px] text-[#FCD34D] uppercase tracking-widest mb-1 font-sans">Click To View Invitation</span>
                 <span className="font-bold text-sm">ចុចបើកសំបុត្រ</span>
               </div>
               <div className="w-8 h-8 rounded bg-[#FCD34D] flex items-center justify-center text-black group-hover:translate-x-1 transition-transform">
                 <ArrowRight className="w-4 h-4" />
               </div>
             </button>
             
             <div className="flex flex-col items-center gap-1 opacity-50 animate-bounce">
                <div className="w-4 h-4 border-t-2 border-r-2 border-white rotate-[-45deg]"></div>
                <div className="w-4 h-4 border-t-2 border-r-2 border-white rotate-[-45deg] mt-[-10px]"></div>
             </div>
          </div>
        </div>
      ) : (
        // === MAIN INVITATION SCREEN ===
        <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-start md:justify-center pt-0 md:pt-4 pb-0 md:pb-10 px-0 md:px-4 animate-fade-in-up">
          
          {/* Main Card Container */}
          <div className="w-full md:max-w-3xl lg:max-w-7xl mx-auto bg-zinc-900 border border-neutral-800 shadow-[0_0_60px_rgba(185,28,28,0.3)] md:rounded-3xl overflow-hidden relative flex flex-col lg:flex-row lg:h-[90vh]">
            
            {/* Top Decorative Line */}
            <div className="h-1 w-full bg-gradient-to-r from-red-700 via-red-500 to-amber-500 shrink-0 lg:hidden"></div>

            {/* --- DESKTOP LEFT COLUMN --- */}
            <div className="hidden lg:flex w-[55%] flex-col bg-black/20 relative border-r border-neutral-800 h-full overflow-y-auto no-scrollbar">
                <HeroSection isMobile={false} />
                <ThreeSixtySection isDesktop={true} />
            </div>

            {/* --- RIGHT COLUMN / MOBILE MAIN --- */}
            <div className="w-full lg:w-[45%] flex flex-col bg-zinc-900 h-auto lg:h-full relative">
                
                <div className="h-auto lg:flex-1 lg:overflow-y-auto pb-24 lg:pb-32 no-scrollbar"> 
                    
                    <div className="pt-8 pb-6 text-center px-4 md:px-6 bg-black lg:bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-sm shadow-md lg:shadow-none">
                      <div className="flex justify-center mb-4">
                        <LTowerLogo className="scale-75 origin-center" />
                      </div>
                      <p className="text-amber-500 uppercase tracking-[0.3em] text-[10px] font-bold">Grand Opening LTOWER Monivong 2</p>
                    </div>

                    {/* MOBILE: Hero Image (Top) */}
                    <div className="lg:hidden">
                        <HeroSection isMobile={true} />
                    </div>

                    <div className="px-4 md:px-6 py-6 text-center relative">
                      <h1 className="text-xl md:text-2xl font-bold leading-tight mb-4 text-white">
                        កម្មវិធីបើកលក់ <br/>
                        <span className="text-[#FCD34D] text-2xl md:text-3xl">LTOWER ព្រះមុនីវង្ស 2</span>
                      </h1>
                      
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                        <p className="text-gray-300 text-sm leading-relaxed font-light text-justify">
                          <span className="font-bold text-amber-500 text-sm block mb-2 text-center">សូមគោរពអញ្ជើញ!</span>
                          ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា ចូលរួមកម្មវិធីបើកលក់តម្លៃពិសេសមិនធ្លាប់មាន ស្ថិតនៅលើទីតាំងល្អ ដែលមានសក្តានុពល និងផ្តល់ផលចំនេញច្រើន ទាំងការវិនិយោគ ការដាក់ជួល និងការស្នាក់នៅ។
                        </p>
                      </div>

                      {/* PROMOTIONS GRID */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-red-900 to-red-950 p-3 rounded-xl border border-red-800 flex flex-col items-center justify-center">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white mb-2 shadow-lg">
                            <Layers className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-red-300 uppercase font-bold">Promotion</p>
                          <p className="text-sm font-bold text-white leading-tight">ទិញខុនដូ<br/><span className="text-amber-400">2ជាន់ពិសេស</span></p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-zinc-800 to-black p-3 rounded-xl border border-zinc-700 flex flex-col items-center justify-center">
                          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-green-400 mb-2 shadow-lg">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">បង់ប្រចាំខែ</p>
                          <p className="text-xl font-bold text-white">$2xx <span className="text-[10px] font-normal">/ខែ</span></p>
                        </div>
                      </div>

                      {/* EVENT DETAILS */}
                      <div className="space-y-3 pb-4">
                        <div className="flex items-center bg-black/40 p-3 rounded-lg border border-neutral-800">
                          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-red-500 shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="ml-3 text-left">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">កាលបរិច្ឆេទ / Date</p>
                            <p className="font-bold text-sm text-white">21 មីនា 2026</p>
                          </div>
                        </div>

                        <div className="flex items-center bg-black/40 p-3 rounded-lg border border-neutral-800">
                          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-red-500 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="ml-3 text-left">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">ទីតាំង / Location</p>
                            <p className="font-bold text-sm text-white">មហាវិថីព្រះមុនីវង្ស</p>
                            <p className="text-[10px] text-gray-400">Preah Monivong Blvd, Phnom Penh</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MOBILE/TABLET: 360 & Gallery (Moved to Bottom) */}
                    <div className="lg:hidden pb-8">
                        <ThreeSixtySection isDesktop={false} />
                        <GallerySection isDesktop={false} />
                    </div>

                    {/* DESKTOP ONLY: Gallery */}
                    <div className="hidden lg:block">
                        <GallerySection isDesktop={true} />
                    </div>

                    {/* RSVP FORM Section */}
                    <div className="px-4 md:px-6 pt-6 bg-zinc-900 border-t border-neutral-800 lg:border-none mb-24 lg:mb-12">
                      {rsvpStatus === 'attending' ? (
                        <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-6 text-center animate-fade-in">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <h3 className="text-base font-bold text-white mb-1">ចុះឈ្មោះជោគជ័យ!</h3>
                          <p className="text-amber-400 font-bold mb-1">{formData.name}</p>
                          <p className="text-gray-400 text-xs">សូមអរគុណសម្រាប់ការចាប់អារម្មណ៍</p>
                        </div>
                      ) : rsvpStatus === 'submitting' ? (
                        <div className="bg-neutral-800/50 p-6 rounded-lg text-center flex flex-col items-center justify-center h-[200px]">
                            <Loader className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                            <p className="text-gray-300 text-sm">កំពុងបញ្ជូនទិន្នន័យ...</p>
                        </div>
                      ) : rsvpStatus === 'decline' ? (
                        <div className="bg-neutral-800/50 rounded-lg p-6 text-center">
                          <p className="text-gray-400 text-xs">អរគុណ! យើងសង្ឃឹមថានឹងបានជួបអ្នកនៅឱកាសក្រោយ។</p>
                          <button onClick={() => setRsvpStatus('idle')} className="text-white text-[10px] font-bold uppercase underline mt-2">កែប្រែ (Undo)</button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-4 animate-fade-in-up">
                          <div className="flex items-center justify-between">
                              <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4 text-amber-500"/> ចុះឈ្មោះ / Register
                              </h3>
                          </div>

                          <div className="space-y-3">
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <User className="h-4 w-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input 
                                  type="text" 
                                  name="name"
                                  required
                                  placeholder="ឈ្មោះ (Name)" 
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className="w-full pl-10 pr-3 py-3 bg-black/40 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500"
                                />
                              </div>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Smartphone className="h-4 w-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input 
                                  type="tel" 
                                  name="phone"
                                  required
                                  placeholder="លេខទូរស័ព្ទ (Phone)" 
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className="w-full pl-10 pr-3 py-3 bg-black/40 border border-neutral-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500"
                                />
                              </div>
                          </div>

                          <div className="flex flex-col gap-3 mt-2">
                              <button 
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:brightness-110 transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" /> បញ្ជូន (Submit)
                              </button>
                              <button 
                                type="button"
                                onClick={() => setRsvpStatus('decline')}
                                className="w-full py-3 bg-transparent border border-neutral-700 text-gray-500 font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
                              >
                                មិនអាចចូលរួម (Decline)
                              </button>
                          </div>
                        </form>
                      )}
                    </div>
                </div>
            </div>

            {/* Footer Actions (Sticky) */}
            <div className="fixed lg:absolute bottom-0 w-full bg-black/95 backdrop-blur-lg p-4 flex flex-col gap-3 border-t border-neutral-800 z-50 lg:rounded-br-3xl">
                 <div className="flex justify-between items-center max-w-7xl mx-auto w-full lg:w-auto">
                     <a href="tel:+855766333336" className="flex items-center gap-2 text-white font-bold hover:text-amber-500 transition-colors bg-neutral-800/50 px-3 py-2 rounded-full border border-white/10">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-900/50">
                            <Phone className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm">076 63 333 36</span>
                     </a>
                     
                     <div className="flex gap-3">
                         <a href="https://www.facebook.com/ltowercondo/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                            <Facebook className="w-4 h-4" />
                         </a>
                         <a href="https://www.instagram.com/l_tower_condo/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                            <Instagram className="w-4 h-4" />
                         </a>
                         <a href="https://www.tiktok.com/@ltowercondo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-black border border-neutral-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                               <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                         </a>
                         <button className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-white hover:bg-neutral-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                         </button>
                     </div>
                 </div>
            </div>

          </div>
        </div>
      )}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&display=swap');
        
        .font-kantumruy {
          font-family: 'Kantumruy Pro', sans-serif;
        }

        /* --- KEYFRAMES --- */

        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }

        /* Subtle Bounce for FAB */
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }

        /* Marquee Animation */
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite; /* Adjusted speed for "slow slide" */
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default App;