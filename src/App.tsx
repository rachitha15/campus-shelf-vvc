import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { 
  Book, 
  Bounty 
} from "./types";
import BookCard from "./components/BookCard";
import BountyBar from "./components/BountyBar";
import { 
  Plus, 
  Search, 
  Award, 
  Camera, 
  Upload, 
  X, 
  Sparkles, 
  Loader2, 
  MapPin, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle, 
  Phone, 
  ArrowRight,
  Info,
  AlertTriangle,
  Sliders,
  RefreshCw
} from "lucide-react";

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Theme state
  const [activeTheme, setActiveTheme] = useState<'blue' | 'emerald' | 'crimson' | 'midnight'>('blue');

  const themes = {
    blue: {
      primaryBg: "bg-brand-purple",
      primaryHover: "hover:bg-brand-indigo",
      textPrimary: "text-brand-purple",
      accentBg: "bg-brand-pink/10 text-brand-pink",
      bannerBg: "from-brand-purple via-brand-indigo to-brand-pink",
      badgeHighlight: "bg-brand-pink/10 text-brand-pink",
      accentBorder: "border-brand-purple/20",
      focusRing: "focus:ring-brand-purple/10",
      focusBorder: "focus:border-brand-purple"
    },
    emerald: {
      primaryBg: "bg-brand-indigo",
      primaryHover: "hover:bg-brand-purple",
      textPrimary: "text-brand-indigo",
      accentBg: "bg-brand-pink/10 text-brand-pink",
      bannerBg: "from-brand-indigo via-brand-purple to-brand-pink",
      badgeHighlight: "bg-brand-purple/10 text-brand-purple",
      accentBorder: "border-brand-indigo/20",
      focusRing: "focus:ring-brand-indigo/10",
      focusBorder: "focus:border-brand-indigo"
    },
    crimson: {
      primaryBg: "bg-brand-pink",
      primaryHover: "hover:bg-brand-purple",
      textPrimary: "text-brand-pink",
      accentBg: "bg-brand-indigo/10 text-brand-indigo",
      bannerBg: "from-brand-pink via-brand-purple to-brand-indigo",
      badgeHighlight: "bg-brand-indigo/10 text-brand-indigo",
      accentBorder: "border-brand-pink/20",
      focusRing: "focus:ring-brand-pink/10",
      focusBorder: "focus:border-brand-pink"
    },
    midnight: {
      primaryBg: "bg-brand-purple",
      primaryHover: "hover:bg-brand-indigo",
      textPrimary: "text-white",
      accentBg: "bg-brand-pink/10 text-brand-pink",
      bannerBg: "from-brand-purple via-brand-indigo to-brand-pink",
      badgeHighlight: "bg-brand-pink/10 text-brand-pink",
      accentBorder: "border-brand-purple/20",
      focusRing: "focus:ring-brand-purple/10",
      focusBorder: "focus:border-brand-purple"
    }
  };

  const currentTheme = themes[activeTheme];

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopper, setFilterTopper] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(3); // mock km

  // Notification overlay & Shelf clearance nudge state
  const [nudgeState, setNudgeState] = useState<{
    show: boolean;
    sellerName: string;
    phone: string;
    bookTitle: string;
  } | null>(null);

  // Listing workflow modal
  const [showSellModal, setShowSellModal] = useState(false);

  // Form states during "Sell" listing flow
  const [sellForm, setSellForm] = useState({
    title: "",
    author: "",
    edition: "",
    price: "",
    originalPrice: "",
    distance: "0.2 km (Hostel Block A)",
    sellerName: "",
    sellerCourse: "",
    sellerPhone: "",
    condition: "",
    isTopperCopy: false,
    coverUrl: "",
    pageUrls: [] as string[],
    coverColor: "from-blue-600 to-indigo-800",
    binding: "Paperback",
    publisher: "",
    publicationYear: new Date().getFullYear().toString(),
    language: "English",
    totalPages: "",
  });

  // AI Scanner visual feedback
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [scanError, setScanError] = useState("");
  const [scanStep, setScanStep] = useState(0);

  // Live Camera state
  const [useCamera, setUseCamera] = useState(false);
  const [isVirtualCamera, setIsVirtualCamera] = useState(false);
  const [physicalCameraState, setPhysicalCameraState] = useState<'idle' | 'requesting' | 'success' | 'blocked'>('idle');
  const [virtualBookSelect, setVirtualBookSelect] = useState<'electrodynamics' | 'os' | 'genetics' | 'marketing'>('electrodynamics');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch all books and demand list on load
  const loadData = async () => {
    try {
      setLoading(true);
      const [resBooks, resBounties] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/bounties")
      ]);
      if (resBooks.ok) {
        const booksList = await resBooks.json();
        setBooks(booksList);
      }
      if (resBounties.ok) {
        const bountiesList = await resBounties.json();
        setBounties(bountiesList);
      }
    } catch (e) {
      console.error("Failed to fetch fresh listings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Synchronize camera stream with HTML video tag once it renders in DOM
  useEffect(() => {
    let active = true;
    const syncVideo = () => {
      if (useCamera && !isVirtualCamera && streamRef.current && videoRef.current) {
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        videoRef.current.play().catch((err) => {
          console.warn("Camera video play try failed:", err);
        });
      }
    };

    // Run synchronization immediately
    syncVideo();

    // Run periodic sync checks to safeguard against dynamic mounting delay
    const interval = setInterval(() => {
      if (!active) return;
      syncVideo();
    }, 250);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [useCamera, isVirtualCamera, physicalCameraState]);

  const startPhysicalCameraOnly = async () => {
    setPhysicalCameraState('requesting');
    setScanError("");
    
    // Release any old streams
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Error stopping old tracks", e);
      }
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser or preview environment doesn't support direct camera access (getUserMedia is unavailable)."
        );
      }

      let stream: MediaStream;
      try {
        // Step 1: Try backing camera ("environment"), ideal for mobile scanning
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
      } catch (firstErr) {
        console.warn("Could not acquire environmental camera, falling back to general camera constraint:", firstErr);
        try {
          // Step 2: Fallback to general camera (standard front/webcam), great for laptops & desktops
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (secondErr: any) {
          console.error("All camera requests failed:", secondErr);
          throw new Error(
            secondErr.message || "Camera access was denied or device is busy."
          );
        }
      }

      streamRef.current = stream;
      setPhysicalCameraState('success');
      setUseCamera(true);
      setIsVirtualCamera(false);
      
      // Attempt immediate hookup to video ref if already rendered
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.error("Immediate video play failed:", err));
      }
    } catch (err: any) {
      console.warn("Physical camera access failed during connection:", err);
      setPhysicalCameraState('blocked');
      // Do NOT force isVirtualCamera to true so the user can actually see the blocked screen,
      // read instructions on how to break out of iframe, and retry or choose simulator.
      setIsVirtualCamera(false);
      setUseCamera(true);
      setScanError(
        `Physical Camera Access Blocked: ${err.message || 'Permissions restricted in iframe wrapper.'}`
      );
    }
  };

  const stopPhysicalCameraOnly = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("Error stopping tracks on manual switch", e);
      }
      streamRef.current = null;
    }
    setPhysicalCameraState('idle');
  };

  // Main wrapper triggered by sell actions
  const startCamera = async () => {
    await startPhysicalCameraOnly();
  };

  const stopCamera = () => {
    stopPhysicalCameraOnly();
    setUseCamera(false);
    setIsVirtualCamera(false);
  };

  // Convert binary file to base64
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Simulate a highly styled Virtual Book scan frame capture
  const captureVirtualFrame = async () => {
    setIsScanning(true);
    setScanError("");
    setScanningMessage("Analyzing simulated photo using Gemini Vision API...");
    const loggerInterval = runVisualSpinnerLogs();

    const virtualCovers: Record<string, { title: string; author: string; edition: string; isTopperCopy: boolean; coverColor: string; coverUrl: string; pageUrls: string[] }> = {
      electrodynamics: {
        title: "Introduction to Electrodynamics",
        author: "David J. Griffiths",
        edition: "4th Edition",
        isTopperCopy: true,
        coverColor: "from-blue-700 to-sky-950",
        coverUrl: "/src/assets/images/used_opt_1_1780909304957.png",
        pageUrls: ["/src/assets/images/electrodynamics_page_1780908004425.png"]
      },
      os: {
        title: "Operating System Concepts",
        author: "Abraham Silberschatz, Peter B. Galvin & Greg Gagne",
        edition: "10th Edition",
        isTopperCopy: true,
        coverColor: "from-teal-800 to-slate-950",
        coverUrl: "/src/assets/images/used_opt_2_1780909326288.png",
        pageUrls: ["/src/assets/images/operating_systems_page_1780908527141.png"]
      },
      genetics: {
        title: "Principles of Genetics",
        author: "Eldon John Gardner, Michael J. Simmons",
        edition: "8th Edition",
        isTopperCopy: false,
        coverColor: "from-emerald-700 to-green-950",
        coverUrl: "/src/assets/images/used_opt_3_1780909342850.png",
        pageUrls: ["/src/assets/images/genetics_page_1780908544676.png"]
      },
      marketing: {
        title: "Marketing Management",
        author: "Philip Kotler & Kevin Lane Keller",
        edition: "15th Edition",
        isTopperCopy: true,
        coverColor: "from-red-800 to-black",
        coverUrl: "/src/assets/images/used_opt_4_1780909358755.png",
        pageUrls: ["/src/assets/images/macroeconomics_page_1780908496793.png"]
      }
    };

    setTimeout(() => {
      clearInterval(loggerInterval);
      const data = virtualCovers[virtualBookSelect];
      setSellForm((prev) => ({
        ...prev,
        title: data.title,
        author: data.author,
        edition: data.edition,
        isTopperCopy: data.isTopperCopy,
        coverColor: data.coverColor,
        coverUrl: data.coverUrl,
        pageUrls: data.pageUrls,
        condition: data.isTopperCopy 
          ? "Pre-marked with highlighter annotations by College Topper!"
          : "Pristine academic condition, all pages intact."
      }));
      setIsScanning(false);
      setUseCamera(false);
      setIsVirtualCamera(false);
    }, 2800);
  };

  // Capture image frame from live video
  const captureFrame = async () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        stopCamera();
        await triggerAIScan(dataUrl);
      }
    } catch (e: any) {
      setScanError("Failed capturing screenshot frame: " + e.message);
    }
  };

  // Handle standard photo upload
  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await getBase64(file);
      // Let's store base64 in form coverUrl to draw the actual uploaded cover!
      setSellForm(prev => ({ ...prev, coverUrl: base64 }));
      await triggerAIScan(base64);
    } catch (err: any) {
      setScanError("Failed reading file: " + err.message);
    }
  };

  // Fun helper to cycle AI scanner logs & display text to emphasize UX magic
  const runVisualSpinnerLogs = () => {
    const messages = [
      "Gemini is analyzing cover photograph...",
      "Extracting book publishers & student tags...",
      "Parsing main textbook title & primary authors...",
      "Checking for handmarked sketches, margins or highlights...",
      "Done! Generating optimal academic metadata."
    ];
    let step = 0;
    setScanStep(0);
    const interval = setInterval(() => {
      if (step < messages.length - 1) {
        step++;
        setScanStep(step);
        setScanningMessage(messages[step]);
      } else {
        clearInterval(interval);
      }
    }, 1300);
    return interval;
  };

  // Send selected base64 cover to backend scanner endpoint
  const triggerAIScan = async (base64Image: string) => {
    setIsScanning(true);
    setScanError("");
    setScanningMessage("Connecting to Gemini-3.5-flash Scanner...");
    
    const loggerInterval = runVisualSpinnerLogs();

    try {
      const response = await fetch("/api/scan-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "AIScan failed");
      }

      const parsedResult = await response.json();
      
      // Select an aesthetic template cover color at random for the book card
      const presets = [
        "from-blue-600 to-indigo-800",
        "from-emerald-700 to-teal-900",
        "from-amber-600 to-red-800",
        "from-sky-700 to-cyan-950",
        "from-purple-700 to-fuchsia-900",
        "from-teal-600 to-cyan-800"
      ];
      const randomGradient = presets[Math.floor(Math.random() * presets.length)];

      setSellForm((prev) => ({
        ...prev,
        title: parsedResult.title || "",
        author: parsedResult.author || "",
        edition: parsedResult.edition || "1st Edition",
        isTopperCopy: !!parsedResult.isTopperCopy,
        coverColor: randomGradient,
        condition: parsedResult.isTopperCopy 
          ? "Highly sought-after Topper notes & margin explanations included!" 
          : "Clean student condition, standard text formatting.",
        binding: parsedResult.binding || "Paperback",
        publicationYear: parsedResult.publicationYear ? String(parsedResult.publicationYear) : new Date().getFullYear().toString(),
        language: parsedResult.language || "English",
        publisher: parsedResult.publisher || "",
        totalPages: parsedResult.totalPages ? String(parsedResult.totalPages) : "",
      }));

    } catch (err: any) {
      console.error(err);
      setScanError("Gemini scan timed out or failed. No worries! You can quickly type your book details manually below.");
    } finally {
      clearInterval(loggerInterval);
      setIsScanning(false);
    }
  };

  // Simulate a Demo Book upload to experience Gemini scanning without a physical phone camera
  const triggerDemoScan = async (demoType: 'accounting' | 'ai' | 'medicine') => {
    setIsScanning(true);
    setScanError("");
    setScanningMessage("Initializing simulated scanner payload...");
    const loggerInterval = runVisualSpinnerLogs();

    const mockCovers: Record<string, { title: string; author: string; edition: string; isTopperCopy: boolean; coverColor: string }> = {
      accounting: {
        title: "Frank Wood's Business Accounting",
        author: "Alan Sangster",
        edition: "14th Edition",
        isTopperCopy: true,
        coverColor: "from-amber-600 to-red-800"
      },
      ai: {
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell & Peter Norvig",
        edition: "4th Global Edition",
        isTopperCopy: false,
        coverColor: "from-blue-600 to-indigo-800"
      },
      medicine: {
        title: "Guyton and Hall Textbook of Medical Physiology",
        author: "John E. Hall & Michael Hall",
        edition: "14th South Asian Edition",
        isTopperCopy: true,
        coverColor: "from-emerald-700 to-teal-900"
      }
    };

    setTimeout(() => {
      clearInterval(loggerInterval);
      const data = mockCovers[demoType];
      setSellForm((prev) => ({
        ...prev,
        title: data.title,
        author: data.author,
        edition: data.edition,
        isTopperCopy: data.isTopperCopy,
        coverColor: data.coverColor,
        condition: data.isTopperCopy 
          ? "Pre-marked with highlighter annotations by College Topper!"
          : "Pristine academic condition, all pages intact."
      }));
      setIsScanning(false);
    }, 3500);
  };

  // Submit listing to database
  const handleListSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sellForm.title || !sellForm.price || !sellForm.sellerPhone) {
      alert("Please ensure Title, Price, and Contact Phone fields are completed!");
      return;
    }

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sellForm,
          price: Number(sellForm.price),
          originalPrice: sellForm.originalPrice ? Number(sellForm.originalPrice) : undefined
        })
      });

      if (response.ok) {
        // Reload listing instantly
        await loadData();
        // Reset form
        setSellForm({
          title: "",
          author: "",
          edition: "",
          price: "",
          originalPrice: "",
          distance: "0.2 km (Hostel Block A)",
          sellerName: "",
          sellerCourse: "",
          sellerPhone: "",
          condition: "",
          isTopperCopy: false,
          coverUrl: "",
          pageUrls: [],
          coverColor: "from-blue-600 to-indigo-800",
          binding: "Paperback",
          publisher: "",
          publicationYear: new Date().getFullYear().toString(),
          language: "English",
          totalPages: "",
        });
        setShowSellModal(false);
        stopCamera();
      } else {
        alert("Failed to submit textbook listing. Try again!");
      }
    } catch (err) {
      console.error(err);
      alert("Error listing textbook.");
    }
  };

  // Post a needed book demand bubble from quick input
  const handleAddBounty = async (newBounty: Omit<Bounty, "id">) => {
    try {
      const response = await fetch("/api/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBounty)
      });
      if (response.ok) {
        await loadData();
      }
    } catch (e) {
      console.error("Could not post demand", e);
    }
  };

  // Pre-fill form from selected demand requests (fulfills demand)
  const handleSelectBounty = (bounty: Bounty) => {
    setSellForm((prev) => ({
      ...prev,
      title: bounty.seekingText,
      sellerCourse: bounty.course,
    }));
    setShowSellModal(true);
    startCamera();
  };

  // Triggered when clicking Buy on WhatsApp
  const handleBuyClick = (book: Book) => {
    // Show the "Shelf Clearance" nudge overlay
    setNudgeState({
      show: true,
      sellerName: book.sellerName,
      phone: book.sellerPhone,
      bookTitle: book.title
    });
  };

  // Finish WhatsApp redirection and redirect user safely
  const proceedToWhatsApp = () => {
    if (!nudgeState) return;
    const cleanPhone = nudgeState.phone.replace(/[^0-9+]/g, "");
    const message = encodeURIComponent(`Hi ${nudgeState.sellerName}, I saw your textbook listing for "${nudgeState.bookTitle}" on Campus Shelf. Is it still available?`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
    // Close the nudge overlay state
    setNudgeState(null);
    // Redirect
    window.open(waUrl, "_blank");
  };

  // Filtered dataset
  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.sellerCourse.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTopper = !filterTopper || book.isTopperCopy;
    
    // Mocking distance parsing (e.g. "0.2 km" -> 0.2)
    const floatDist = parseFloat(book.distance) || 0.1;
    const matchesDistance = floatDist <= maxDistance;

    return matchesSearch && matchesTopper && matchesDistance;
  });

  return (
    <div id="app-root" className="min-h-screen bg-zinc-950 font-sans antialiased flex items-center justify-center py-0 md:py-8 px-0 sm:px-4 selection:bg-brand-purple/30 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Background Spotlights for Ambient Aesthetic Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/15 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-pink/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[8s]"></div>
      
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 px-4">
        
        {/* LEFT PRESENTATION COLLATERAL: Visible only on high-fidelity desktop screens */}
        <div id="desktop-presentation-panel" className="hidden lg:flex lg:col-span-6 flex-col justify-between py-6 space-y-8 text-neutral-100">
          
          {/* Active indicator bar */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 bg-neutral-900/90 px-4 py-2 rounded-full border border-neutral-800 text-[11px] font-bold tracking-wide shadow-md backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-neutral-300 font-mono">14 Active Hostel Listings Today</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-display font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400">
              Your Campus. <br />
              Your Books. <br />
              Direct Swap.
            </h1>
            
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed font-medium">
              Campus Shelf is a high-performance peer-to-peer textbook marketplace. Auto-extract cover meta information with high-fidelity student notes and connect instantly over WhatsApp.
            </p>
          </div>

          {/* Interactive Core Campus Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md shadow-xs">
              <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-extrabold">CO₂ Reuse Offset</p>
              <h3 className="text-xl font-display font-black text-emerald-400 mt-1">112 kg Saved</h3>
              <p className="text-[11px] text-neutral-400 mt-1 font-medium">Equivalent to planting 6 campus trees.</p>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl backdrop-blur-md shadow-xs">
              <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase font-extrabold font-mono">Student Savings</p>
              <h3 className="text-xl font-display font-black text-brand-pink mt-1">₹1,450 / yr</h3>
              <p className="text-[11px] text-neutral-400 mt-1 font-medium">Save up to 75% on curriculum books.</p>
            </div>
          </div>

          {/* Aesthetic Theme Profile Customizer Block */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 p-5 rounded-3xl backdrop-blur-md space-y-4 max-w-md shadow-xl">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-brand-indigo uppercase font-black">Visual Identity</p>
              <h4 className="text-sm font-extrabold text-white mt-1">Select Campus Colorway</h4>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'blue', name: 'University Indigo', color: 'bg-indigo-600' },
                { id: 'emerald', name: 'Forest Mint', color: 'bg-emerald-600' },
                { id: 'crimson', name: 'Rosè Scribe', color: 'bg-rose-600' },
                { id: 'midnight', name: 'Onyx Dark', color: 'bg-neutral-950' }
              ].map(themeItem => (
                <button
                  key={themeItem.id}
                  onClick={() => setActiveTheme(themeItem.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                    activeTheme === themeItem.id
                      ? 'bg-neutral-800/90 border-neutral-600 text-white shadow-md'
                      : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:border-neutral-700/60'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${themeItem.color} border border-white/20 shadow-xs shrink-0`}></span>
                  <span className="text-[11px] font-bold tracking-tight truncate">
                    {themeItem.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Slogans Footer info */}
          <div className="text-[10px] text-neutral-600 font-mono tracking-wider">
            CAMPUS SHELF • PEER SWAP PROTOCOL V1.4
          </div>
        </div>

        {/* RIGHT PANEL: MOBILE PREVIEW TERMINAL SIMULATOR */}
        <div className="col-span-1 lg:col-span-6 flex justify-center w-full">
          <div id="phone-frame" className="w-full max-w-md bg-neutral-50 flex flex-col min-h-screen md:min-h-[810px] md:max-h-[880px] md:rounded-[40px] md:shadow-[0_22px_70px_-15px_rgba(0,0,0,0.55)] md:border-[10px] md:border-neutral-900 overflow-hidden relative transition-all duration-300">
            
            {/* Dynamic Mobile Status Bar on Desktop view */}
            <div className="hidden md:flex bg-neutral-950 text-white/95 text-[10px] px-6 py-1.5 justify-between items-center select-none font-mono tracking-wider border-b border-neutral-900/50">
              <span className="font-bold">Campus 📶</span>
              <span className="text-neutral-500 font-extrabold uppercase text-[9px] tracking-widest">{activeTheme} Theme Active</span>
              <span className="font-bold">100% 🔋</span>
            </div>

        {/* Header App Bar */}
        <header id="app-header" className="sticky top-0 bg-white border-b border-gray-100 shadow-xs z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`w-8 h-8 rounded-lg ${currentTheme.primaryBg} flex items-center justify-center text-white font-black text-lg shadow-sm`}>
              C
            </div>
            <div>
              <h1 className={`text-xl font-display font-black ${currentTheme.textPrimary} tracking-tight leading-none`}>
                Campus Shelf
              </h1>
              <span className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">University Swap</span>
            </div>
          </div>

          <button
            id="btn-sell-trigger"
            onClick={() => {
              setShowSellModal(true);
              // start camera flow by default
              startCamera();
            }}
            className={`${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white font-display font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sell +</span>
          </button>
        </header>

        {/* Horizontally scrolling demands/seeking list */}
        <BountyBar 
          bounties={bounties} 
          onAddBounty={handleAddBounty} 
          onSelectBounty={handleSelectBounty}
          currentTheme={currentTheme} 
        />

        {/* Feed & Filtering Panel */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
          
          {/* Welcome Info Board */}
          <div className={`bg-gradient-to-r ${currentTheme.bannerBg} rounded-2xl p-4 text-white shadow-sm relative overflow-hidden`}>
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10 rotate-12">
              <BookOpen className="w-40 h-40" />
            </div>
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase font-mono">
                📝 Exam Season Special
              </div>
              <h2 className="text-lg font-display font-extrabold leading-tight">No commission. Near hostel pickup.</h2>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                Unlock gold study resources! Seek certified handwritten markup from exam toppers in Hostel A & C.
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white border border-gray-200/60 p-3 rounded-2xl space-y-3 shadow-xs">
            {/* Search inputs */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                id="search-input"
                type="text"
                placeholder="Search Title, Author or Course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-gray-50 text-gray-800 placeholder-gray-400 text-xs py-2.5 pl-9 pr-4 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 ${currentTheme.focusRing} ${currentTheme.focusBorder}`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick checkbox & depth range */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-50">
              <button
                onClick={() => setFilterTopper(!filterTopper)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  filterTopper 
                    ? "bg-amber-500/10 text-amber-700 border-amber-300"
                    : "bg-gray-50 text-gray-600 border-gray-255"
                }`}
              >
                <Award className={`w-3.5 h-3.5 ${filterTopper ? "text-amber-500 fill-amber-500" : ""}`} />
                <span>Topper's Copies Only</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-500">Hostel Distance:</span>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold py-1 px-2 focus:outline-hidden text-gray-700"
                >
                  <option value={0.5}>&lt; 0.5 km</option>
                  <option value={1}>&lt; 1.0 km</option>
                  <option value={3}>&lt; 3.0 km (All Campuses)</option>
                </select>
              </div>
            </div>

            {/* Aesthetic Theme Quick Selection Dot Row */}
            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
              <span className="text-[10px] font-mono text-gray-400 font-extrabold uppercase tracking-wide">Campus Accent:</span>
              <div className="flex items-center gap-2.5">
                {[
                  { id: 'blue', color: 'bg-indigo-600', text: 'Royal' },
                  { id: 'emerald', color: 'bg-emerald-600', text: 'Forest' },
                  { id: 'crimson', color: 'bg-rose-600', text: 'Rosè' },
                  { id: 'midnight', color: 'bg-neutral-900', text: 'Onyx' }
                ].map((th) => (
                  <button
                    key={th.id}
                    title={`Switch Campus to ${th.text}`}
                    onClick={() => setActiveTheme(th.id as any)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                      activeTheme === th.id
                        ? "bg-neutral-900 text-white border-neutral-800 shadow-inner"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:text-gray-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${th.color} border border-white/20 shadow-xs inline-block`}></span>
                    <span>{th.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog shelf count */}
          <div className="flex justify-between items-center pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
              The Books Shelf ({filteredBooks.length} items)
            </h3>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${currentTheme.accentBg}`}>
              Near You
            </span>
          </div>

          {/* Book Catalog Feed */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className={`w-8 h-8 ${currentTheme.textPrimary} animate-spin`} />
              <p className="text-xs font-semibold text-gray-505">Loading campus listings...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200/60 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">No books found matching criteria</p>
                <p className="text-xs text-gray-500 mt-1">Try resetting your search query or looking across all hostlers!</p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterTopper(false);
                  setMaxDistance(3);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onBuyClick={handleBuyClick} currentTheme={currentTheme} />
              ))}
            </div>
          )}

        </main>

        {/* Sticky human peer-to-peer message */}
        <div className="bg-white border-t border-gray-100 px-4 py-3.5 text-center text-[11px] text-gray-400 font-medium font-sans">
          Designed for peer-to-peer textbook swaps • 100% Free
        </div>

        {/* ACTION MODAL: SELL & LIST FLOW OVERLAY */}
        {showSellModal && (
          <div className="fixed inset-0 bg-gray-950/70 py-4 px-2 z-50 flex flex-col justify-end md:justify-center overflow-y-auto animate-fade-in">
            <div className="bg-white w-full max-w-sm mx-auto rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
              
              {/* Modal header */}
              <div className={`bg-gradient-to-r ${currentTheme.bannerBg} px-5 py-4 text-white flex justify-between items-center shrink-0`}>
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1.5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold leading-tight">Smart Textbook Scanner</h3>
                    <p className="text-[10px] text-blue-100">Cover auto-fill metadata powered by Gemini</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSellModal(false);
                    stopCamera();
                  }}
                  className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Container Form */}
              <div className="p-5 overflow-y-auto space-y-5">
                
                {/* AI INPUT SCANNING JOURNEY CONTAINER */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden p-4 text-white space-y-3 relative shadow-inner">
                  
                  {isScanning ? (
                    /* SCANNING ACTIVE SCREEN */
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                      
                      {/* Magical layered pulsing ring spinner */}
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-16 h-16 rounded-full border-4 border-indigo-500/25 animate-ping"></div>
                        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-purple-500 animate-spin"></div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-blue-300">Scanning Textbook Cover...</h4>
                        <p className="text-[11px] text-gray-300 max-w-[250px] font-semibold animate-pulse">
                          "{scanningMessage}"
                        </p>
                      </div>

                      {/* Visual scanning lines simulation */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-350"
                          style={{ width: `${(scanStep + 1) * 20}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : useCamera ? (
                    /* LIVE CAMERA OR VIRTUAL SIMULATOR STREAM VIEW */
                    <div className="space-y-4 text-center">
                      
                      {/* Segmented Controller Tab Menu */}
                      <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsVirtualCamera(false);
                            startPhysicalCameraOnly();
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            !isVirtualCamera
                              ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Live Phone / Laptop Cam</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsVirtualCamera(true);
                            stopPhysicalCameraOnly();
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isVirtualCamera
                              ? "bg-slate-800 text-white shadow-md border border-slate-700/50"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Virtual Simulator</span>
                        </button>
                      </div>

                      {isVirtualCamera ? (
                        /* VIRTUAL SIMULATOR MODE */
                        <div className="space-y-3 animate-fade-in text-left">
                          <div className="bg-slate-950 border border-indigo-500/20 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-wider mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>
                              <span>Virtual Scanner Sandbox Mode</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Choose a textured, used textbook to simulate positioning under your virtual camera stream:
                            </p>
                          </div>

                          <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-800">
                            {/* Animated Scanner Laser beam line simulation */}
                            <div className="absolute inset-x-0 h-0.5 bg-cyan-500/60 shadow-[0_0_10px_#06b6d4] animate-[bounce_2s_infinite] z-20 pointer-events-none"></div>

                            {/* Viewfinder background and virtual image stream */}
                            <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900">
                              <div className="w-24 h-32 rounded shadow-2xl overflow-hidden border border-slate-700 relative group transform rotate-1 transition-all duration-300">
                                {virtualBookSelect === 'electrodynamics' && (
                                  <img src="/src/assets/images/used_opt_1_1780909304957.png" className="w-full h-full object-cover" />
                                )}
                                {virtualBookSelect === 'os' && (
                                  <img src="/src/assets/images/used_opt_2_1780909326288.png" className="w-full h-full object-cover" />
                                )}
                                {virtualBookSelect === 'genetics' && (
                                  <img src="/src/assets/images/used_opt_3_1780909342850.png" className="w-full h-full object-cover" />
                                )}
                                {virtualBookSelect === 'marketing' && (
                                  <img src="/src/assets/images/used_opt_4_1780909358755.png" className="w-full h-full object-cover" />
                                )}
                              </div>
                            </div>

                            {/* Target Reticle Overlay */}
                            <div className="absolute inset-6 border-2 border-dashed border-cyan-400/50 rounded-lg flex items-end justify-center pb-2 pointer-events-none z-10">
                              <span className="text-[9px] bg-slate-950/90 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                                Sandbox Cam Feed • Active
                              </span>
                            </div>
                          </div>

                          {/* Quick selection pill list */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setVirtualBookSelect('electrodynamics')}
                              className={`py-2 px-2.5 rounded-lg text-[10px] font-bold text-left transition-all truncate border flex items-center gap-1.5 cursor-pointer ${
                                virtualBookSelect === 'electrodynamics'
                                  ? 'bg-blue-950 text-blue-300 border-blue-500/40 shadow-inner'
                                  : 'bg-slate-800/40 text-zinc-400 border-slate-800 hover:bg-slate-800 hover:text-zinc-300'
                              }`}
                            >
                              📘 Electrodynamics
                            </button>
                            <button
                              type="button"
                              onClick={() => setVirtualBookSelect('os')}
                              className={`py-2 px-2.5 rounded-lg text-[10px] font-bold text-left transition-all truncate border flex items-center gap-1.5 cursor-pointer ${
                                virtualBookSelect === 'os'
                                  ? 'bg-teal-950 text-teal-300 border-teal-500/40 shadow-inner'
                                  : 'bg-slate-800/40 text-zinc-400 border-slate-800 hover:bg-slate-800 hover:text-zinc-300'
                              }`}
                            >
                              💻 OS Concepts
                            </button>
                            <button
                              type="button"
                              onClick={() => setVirtualBookSelect('genetics')}
                              className={`py-2 px-2.5 rounded-lg text-[10px] font-bold text-left transition-all truncate border flex items-center gap-1.5 cursor-pointer ${
                                virtualBookSelect === 'genetics'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 shadow-inner'
                                  : 'bg-slate-800/40 text-zinc-400 border-slate-800 hover:bg-slate-800 hover:text-zinc-300'
                              }`}
                            >
                              🧬 Genetics Pro
                            </button>
                            <button
                              type="button"
                              onClick={() => setVirtualBookSelect('marketing')}
                              className={`py-2 px-2.5 rounded-lg text-[10px] font-bold text-left transition-all truncate border flex items-center gap-1.5 cursor-pointer ${
                                virtualBookSelect === 'marketing'
                                  ? 'bg-red-950 text-red-300 border-red-500/40 shadow-inner'
                                  : 'bg-slate-800/40 text-zinc-400 border-slate-800 hover:bg-slate-800 hover:text-zinc-300'
                              }`}
                            >
                              📈 Marketing Mgmt
                            </button>
                          </div>

                          <div className="flex gap-2 justify-center pt-2">
                            <button
                              type="button"
                              onClick={captureVirtualFrame}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer w-full shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-4 h-4 animate-pulse animate-bounce" />
                              <span>Simulate AI Scan</span>
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-xs py-2.5 px-3  rounded-xl cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* PHYSICAL HARDWARE CAMERA */
                        <div className="space-y-3.5 animate-fade-in text-left">
                          
                          {physicalCameraState === 'requesting' && (
                            <div className="flex flex-col items-center justify-center py-10 space-y-3 border border-slate-800 rounded-xl bg-slate-950">
                              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                              <p className="text-xs font-semibold text-zinc-400">Requesting physical hardware access...</p>
                            </div>
                          )}

                          {physicalCameraState === 'blocked' && (
                            <div className="space-y-4">
                              <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl space-y-2.5">
                                <div className="flex items-center gap-2 text-xs font-extrabold text-red-400 uppercase tracking-widest font-mono">
                                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                                  <span>Hardware Blocked</span>
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                  Your browser blocked standard camera access. This happens automatically when web pages run embedded inside secure sandboxed iFrame preview containers.
                                </p>
                                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                                  <p className="font-bold text-zinc-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                                    <span>How to resolve and scan physical books:</span>
                                  </p>
                                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 ml-1">
                                    <li>Click the <strong className="text-amber-400">"Open in New Tab"</strong> icon at the top-right of this visual editor to break out of the iframe lock.</li>
                                    <li>When prompted by Chrome/Safari/Firefox, grant <strong className="text-white">Camera Permission</strong> in the URL search bar.</li>
                                    <li>The live camera stream will link up instantly!</li>
                                  </ol>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={startPhysicalCameraOnly}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                  <span>Retry Sensor Request</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsVirtualCamera(true)}
                                  className="bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer text-center"
                                >
                                  Use Simulator Instead
                                </button>
                              </div>
                            </div>
                          )}

                          {physicalCameraState === 'success' && (
                            <div className="space-y-3.5 text-center">
                              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
                                <video
                                  ref={videoRef}
                                  className="w-full h-full object-cover"
                                  playsInline
                                  autoPlay
                                  muted
                                ></video>
                                {/* Target Viewfinder Overlay */}
                                <div className="absolute inset-8 border-2 border-dashed border-blue-400/60 rounded-lg flex items-center justify-center pointer-events-none">
                                  <span className="text-[10px] bg-slate-900/85 px-2.5 py-1 rounded text-blue-200 shadow-md">
                                    Frame Book Spine & Title Card
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 justify-center text-center">
                                <button
                                  type="button"
                                  onClick={captureFrame}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-lg shadow-blue-950/40"
                                >
                                  Capture Snapshot
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="bg-slate-800 hover:bg-slate-700 text-zinc-300 font-bold text-xs py-2.5 px-3.5 rounded-xl cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  ) : (
                    /* SCAN INTRO & DROP CHANNELS */
                    <div className="space-y-4">
                      {sellForm.coverUrl && (
                        <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/85 animate-fade-in">
                          <div className="w-10 h-14 rounded overflow-hidden shadow-md shrink-0 bg-slate-950 border border-slate-700 flex-none">
                            <img src={sellForm.coverUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[8px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                              Cover Graphic Selected
                            </span>
                            <h5 className="text-xs font-bold text-zinc-100 truncate mt-1">
                              {sellForm.title || "Awaiting Title Input"}
                            </h5>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {sellForm.author || "Awaiting Author Input"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSellForm(prev => ({ ...prev, coverUrl: "" }))}
                            className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1.5 rounded-md bg-red-950/20 hover:bg-red-950/40 font-bold transition-all cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      <div className="text-center space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                        <p className="text-xs font-semibold text-blue-100">
                          To auto-fill details instantly, click trigger below:
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Camera trigger */}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer border border-indigo-500/10"
                        >
                          <Camera className="w-5 h-5 text-indigo-200" />
                          <span>Use Camera</span>
                        </button>

                        {/* File upload trigger */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer border border-slate-700"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span>Upload Image</span>
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      {/* Instant Realistic Cover Templates preset chooser */}
                      <div className="border-t border-slate-800/80 pt-3 space-y-2">
                        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider text-center">
                          Or apply attractive academic cover template:
                        </p>
                        <div className="grid grid-cols-4 gap-2 justify-items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSellForm(prev => ({
                                ...prev,
                                coverUrl: "/src/assets/images/used_operations_cover_1781513276942.jpg",
                                coverColor: "from-blue-600 to-indigo-800",
                                title: prev.title || "Operations Management Guide",
                                author: prev.author || "Krajewski & Malhotra"
                              }));
                            }}
                            className={`relative w-11 h-14 rounded overflow-hidden border transition-all ${
                              sellForm.coverUrl === "/src/assets/images/used_operations_cover_1781513276942.jpg"
                                ? "border-amber-400 ring-2 ring-amber-400 scale-105"
                                : "border-slate-800 hover:border-slate-600 hover:scale-105"
                            }`}
                            title="Apply Operations Blue Cover"
                          >
                            <img src="/src/assets/images/used_operations_cover_1781513276942.jpg" className="w-full h-full object-cover" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSellForm(prev => ({
                                ...prev,
                                coverUrl: "/src/assets/images/used_algorithms_cover_1781513216009.jpg",
                                coverColor: "from-emerald-700 to-teal-900",
                                title: prev.title || "Introduction to Algorithms",
                                author: prev.author || "Cormen & Stein"
                              }));
                            }}
                            className={`relative w-11 h-14 rounded overflow-hidden border transition-all ${
                              sellForm.coverUrl === "/src/assets/images/used_algorithms_cover_1781513216009.jpg"
                                ? "border-amber-400 ring-2 ring-amber-400 scale-105"
                                : "border-slate-800 hover:border-slate-600 hover:scale-105"
                            }`}
                            title="Apply Algorithms Green Cover"
                          >
                            <img src="/src/assets/images/used_algorithms_cover_1781513216009.jpg" className="w-full h-full object-cover" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSellForm(prev => ({
                                ...prev,
                                coverUrl: "/src/assets/images/used_economics_cover_1781513257218.jpg",
                                coverColor: "from-amber-600 to-red-800",
                                title: prev.title || "Principles of Microeconomics",
                                author: prev.author || "N. Gregory Mankiw"
                              }));
                            }}
                            className={`relative w-11 h-14 rounded overflow-hidden border transition-all ${
                              sellForm.coverUrl === "/src/assets/images/used_economics_cover_1781513257218.jpg"
                                ? "border-amber-400 ring-2 ring-amber-400 scale-105"
                                : "border-slate-800 hover:border-slate-600 hover:scale-105"
                            }`}
                            title="Apply Economics Gold Cover"
                          >
                            <img src="/src/assets/images/used_economics_cover_1781513257218.jpg" className="w-full h-full object-cover" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSellForm(prev => ({
                                ...prev,
                                coverUrl: "/src/assets/images/used_chemistry_cover_1781513240203.jpg",
                                coverColor: "from-sky-700 to-cyan-950",
                                title: prev.title || "Advanced Organic Chemistry",
                                author: prev.author || "Morrison & Boyd"
                              }));
                            }}
                            className={`relative w-11 h-14 rounded overflow-hidden border transition-all ${
                              sellForm.coverUrl === "/src/assets/images/used_chemistry_cover_1781513240203.jpg"
                                ? "border-amber-400 ring-2 ring-amber-400 scale-105"
                                : "border-slate-800 hover:border-slate-600 hover:scale-105"
                            }`}
                            title="Apply Chemistry Science Cover"
                          >
                            <img src="/src/assets/images/used_chemistry_cover_1781513240203.jpg" className="w-full h-full object-cover" />
                          </button>
                        </div>
                      </div>

                      {/* Demo preset simulators to test the AI power directly */}
                      <div className="border-t border-slate-850 pt-2.5 space-y-1.5">
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider text-center">
                          Or try out simulated auto-scan:
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => triggerDemoScan('accounting')}
                            className="bg-slate-800/80 hover:bg-slate-800 text-blue-300 text-[9px] py-1 px-1.5 rounded-md font-medium truncate"
                          >
                            📙 Accounting
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerDemoScan('ai')}
                            className="bg-slate-800/80 hover:bg-slate-800 text-blue-300 text-[9px] py-1 px-1.5 rounded-md font-medium truncate"
                          >
                            📘 Comput Sci
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerDemoScan('medicine')}
                            className="bg-slate-800/80 hover:bg-slate-800 text-amber-300 text-[9px] py-1 px-1.5 rounded-md font-medium truncate"
                          >
                            ⭐️ Topper Med
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Scan Error Status */}
                  {scanError && (
                    <div className="bg-red-950/50 border border-red-800/50 rounded-xl p-2.5 text-[11px] text-red-200 flex gap-2">
                      <Info className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{scanError}</span>
                    </div>
                  )}

                  {/* Smart auto detection badge status */}
                  {!isScanning && (sellForm.title || sellForm.author) && (
                    <div className="bg-emerald-950/60 border border-emerald-800/40 rounded-xl p-2.5 text-[11px] text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Gemini Auto-Detected: fields populated below!</span>
                    </div>
                  )}
                </div>

                {/* TEXTBOOK LISTING METADATA FORM */}
                <form onSubmit={handleListSubmit} className="space-y-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Book Information Card
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Textbook Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Operations Management, Algorithms..."
                        value={sellForm.title}
                        onChange={(e) => setSellForm({ ...sellForm, title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Author Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rohit"
                          value={sellForm.author}
                          onChange={(e) => setSellForm({ ...sellForm, author: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Book Edition
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 12th Global"
                          value={sellForm.edition}
                          onChange={(e) => setSellForm({ ...sellForm, edition: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Original Price (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          value={sellForm.originalPrice}
                          onChange={(e) => setSellForm({ ...sellForm, originalPrice: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-800 mb-1 font-bold">
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 600"
                          value={sellForm.price}
                          onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                          className="w-full bg-gray-50 border border-emerald-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-900 font-extrabold"
                        />
                      </div>
                    </div>

                    {/* Key highlights / scholastic specifications */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5">
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">
                        Key Scholastic Highlights
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Publisher
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Pearson"
                            value={sellForm.publisher}
                            onChange={(e) => setSellForm({ ...sellForm, publisher: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/15 focus:border-purple-500 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Number of Pages
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 520"
                            value={sellForm.totalPages}
                            onChange={(e) => setSellForm({ ...sellForm, totalPages: e.target.value })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/15 focus:border-purple-500 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Binding
                          </label>
                          <select
                            value={sellForm.binding}
                            onChange={(e) => setSellForm({ ...sellForm, binding: e.target.value })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-2 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/15 focus:border-purple-500 font-bold text-slate-800"
                          >
                            <option value="Paperback">Paperback</option>
                            <option value="Hardcover">Hardcover</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Pub. Year
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 2021"
                            value={sellForm.publicationYear}
                            onChange={(e) => setSellForm({ ...sellForm, publicationYear: e.target.value })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-2 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/15 focus:border-purple-500 text-center font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Language
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. English"
                            value={sellForm.language}
                            onChange={(e) => setSellForm({ ...sellForm, language: e.target.value })}
                            className="w-full bg-white border border-gray-250 rounded-xl px-2 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/15 focus:border-purple-500 font-semibold"
                          />
                        </div>
                      </div>

                      {/* MULTIPLE SAMPLE PAGES / PREVIEW FILES UPLOAD */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1.5 flex items-center justify-between">
                          <span>Inside Pages Preview</span>
                          <span className="text-[9px] text-brand-purple font-black uppercase">Sample Pages Scan</span>
                        </label>
                        
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {/* File selector trigger */}
                          <label className="w-12 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-purple hover:bg-white flex flex-col items-center justify-center cursor-pointer transition-all shrink-0">
                            <span className="text-sm font-bold text-gray-400">+</span>
                            <span className="text-[7px] text-gray-400 font-black uppercase text-center">Add Page</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files) return;
                                const base64Promises = Array.from(files).map(file => getBase64(file as File));
                                try {
                                  const results = await Promise.all(base64Promises);
                                  setSellForm(prev => ({
                                    ...prev,
                                    pageUrls: [...prev.pageUrls, ...results]
                                  }));
                                } catch (err) {
                                  console.error("Failed to load sample page", err);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {/* Render preview pages list */}
                          {sellForm.pageUrls.length === 0 ? (
                            <div className="flex items-center text-[9px] text-gray-400 italic font-medium pl-2">
                              No sample pages scanned yet. Click + to add.
                            </div>
                          ) : (
                            sellForm.pageUrls.map((url, idx) => (
                              <div key={idx} className="relative w-12 h-16 bg-slate-150 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                <img src={url} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setSellForm(prev => ({
                                    ...prev,
                                    pageUrls: prev.pageUrls.filter((_, i) => i !== idx)
                                  }))}
                                  className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white p-0.5 rounded-full"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Condition Tag
                      </label>
                      <input
                        type="text"
                        placeholder="Marks/Highlights? e.g. Very clean pages, like new"
                        value={sellForm.condition}
                        onChange={(e) => setSellForm({ ...sellForm, condition: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500 fill-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">Mark as Topper's Copy</p>
                          <p className="text-[10px] text-amber-700">Contains handwritten equations & notes</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={sellForm.isTopperCopy}
                        onChange={(e) => setSellForm({ ...sellForm, isTopperCopy: e.target.checked })}
                        className="w-4 h-4 rounded-md border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-amber-50 cursor-pointer"
                      />
                    </div>

                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 pt-2 border-t border-gray-100">
                      Seller Contact Card
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rohit"
                          value={sellForm.sellerName}
                          onChange={(e) => setSellForm({ ...sellForm, sellerName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Course Code / Sec *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MBA Sec A"
                          value={sellForm.sellerCourse}
                          onChange={(e) => setSellForm({ ...sellForm, sellerCourse: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          WhatsApp Mobile *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +9198755..."
                          value={sellForm.sellerPhone}
                          onChange={(e) => setSellForm({ ...sellForm, sellerPhone: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          My Location
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hostel A, 102"
                          value={sellForm.distance}
                          onChange={(e) => setSellForm({ ...sellForm, distance: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Submit / Cancel Buttons */}
                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSellModal(false);
                          stopCamera();
                        }}
                        className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold py-3 rounded-xl cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 ${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white text-xs font-bold py-3 rounded-xl cursor-pointer transition-all shadow-sm`}
                      >
                        List It Instantly
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* EXTRA CREDIT UX Nudge: The "Shelf Clearance" Nudge Popup Overlay */}
        {nudgeState?.show && (
          <div className="fixed inset-0 bg-gray-950/85 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 animate-slide-up">
              
              {/* Artistic Header banner */}
              <div className="bg-amber-500 p-5 text-white flex flex-col items-center justify-center text-center relative">
                <div className="absolute top-3 left-3 bg-white/20 text-white font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">
                  Campus Shelf Clearance
                </div>
                <BookOpen className="w-10 h-10 mb-2 mt-2 text-white fill-white/20 animate-bounce" />
                <h3 className="text-base font-black">Awesome choice!</h3>
                <p className="text-xs text-amber-100 mt-1 max-w-[240px]">
                  Connecting you securely via WhatsApp directly to seller {nudgeState.sellerName}.
                </p>
              </div>

              {/* Nudge content block */}
              <div className="p-6 text-center space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                    🎓 Academic Green Campus
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                    While you exchange this book, do you have any BCom guides, MBA journals, or syllabus items taking up valuable shelf space?
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    List just one unused study guide now to declutter your shelf and foster sustainability!
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Option A: List a Book now */}
                  <button
                    onClick={() => {
                      setNudgeState(null);
                      setShowSellModal(true);
                      startCamera();
                    }}
                    className={`w-full ${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-500/10 hover:scale-[1.01]`}
                  >
                    <span>List a Book Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Option B: Skip & Proceed WhatsApp */}
                  <button
                    onClick={proceedToWhatsApp}
                    className="w-full bg-transparent hover:bg-gray-50 text-gray-500 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer border border-gray-200 flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>No thanks, connect to WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          </div>
        </div>
      </div>
    </div>
  );
}
