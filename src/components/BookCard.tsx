import { useState } from "react";
import { Book } from "../types";
import { Award, MapPin, MessageCircle, BookOpen, Calendar, Globe, Building, Eye, X, ArrowLeftRight, CheckCircle2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface BookCardProps {
  key?: string;
  book: Book;
  onBuyClick: (book: Book) => void;
  currentTheme?: {
    primaryBg: string;
    primaryHover: string;
    textPrimary: string;
    accentBg: string;
    accentBorder: string;
    badgeHighlight: string;
  };
}

export default function BookCard({ book, onBuyClick, currentTheme }: BookCardProps) {
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Setup nice CSS gradients for book covers if no photo was uploaded
  const gradientClass = book.coverColor || "from-slate-800 to-slate-950";

  const previewImages = [
    ...(book.coverUrl ? [book.coverUrl] : []),
    ...(book.pageUrls || [])
  ];

  // Safe fallback theme if not provided
  const theme = currentTheme || {
    primaryBg: "bg-brand-purple",
    primaryHover: "hover:bg-brand-indigo",
    textPrimary: "text-brand-purple",
    accentBg: "bg-brand-pink/10 text-brand-pink",
    badgeHighlight: "bg-brand-pink/10 text-brand-pink",
    accentBorder: "border-brand-purple/20"
  };

  // Used Condition Characteristics Assessment
  const cond = (book.condition || "").toLowerCase();
  const isTopperAnnotated = book.isTopperCopy || cond.includes("topper") || cond.includes("annotated") || cond.includes("notes");
  const hasTapeSpine = cond.includes("wear") || cond.includes("bend") || cond.includes("crease") || cond.includes("loved") || cond.includes("tape");
  const hasDogEar = cond.includes("bend") || cond.includes("crease") || cond.includes("loved") || cond.includes("good") || cond.includes("well kept") || book.price < 700;
  const hasStainRing = cond.includes("highlight") || cond.includes("notes") || cond.includes("chemistry") || cond.includes("worn") || book.price < 600;

  const handleOpenInspect = () => {
    setActiveImageIndex(0);
    setZoomLevel(1);
    setIsInspectOpen(true);
  };

  const handleNextImage = () => {
    setZoomLevel(1);
    setActiveImageIndex((prev) => (prev + 1) % previewImages.length);
  };

  const handlePrevImage = () => {
    setZoomLevel(1);
    setActiveImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  const handleZoomToggle = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.6 : prev === 1.6 ? 2.2 : 1));
  };

  return (
    <>
      <div className="bg-white rounded-[22px] sm:rounded-[24px] shadow-xs border border-gray-100 overflow-hidden flex flex-row md:flex-col hover:shadow-xl hover:border-gray-200 transition-all duration-355 relative group">
        
        {/* 3:4 Book Cover Container - adaptive size for mobile horizontally vs md column */}
        <div className="relative aspect-[3/4] w-[120px] min-[380px]:w-[136px] sm:w-[155px] md:w-full shrink-0 bg-slate-50 overflow-hidden flex items-center justify-center border-r md:border-r-0 md:border-b border-gray-100/80">
          {/* Subtle paper aging/grunge multiplier overlay to make any cover image look tactilely used */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-amber-900/[0.04] via-transparent to-amber-950/[0.04] mix-blend-multiply z-10"></div>
          
          {/* Campus Used Book Vintage Sticker Overlay - beautifully scaled down on mobile */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-yellow-200/95 hover:bg-yellow-200 text-yellow-905 text-[8px] sm:text-[9px] font-mono font-black tracking-wider py-0.5 sm:py-1 px-1.5 sm:px-2.5 rounded-xs shadow-md border-y border-yellow-400 rotate-[-5deg] z-20 uppercase transition-all select-none flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-amber-600 animate-ping"></span>
            <span className="truncate">Used</span>
          </div>

          {/* Student Chapter Index Sticky Flags peaking from the page block of the book */}
          <div className="absolute right-0 top-1/4 bottom-1/4 flex flex-col justify-center gap-1.5 pointer-events-none z-15 overflow-hidden">
            <div className="w-2.5 sm:w-3.5 h-1.5 bg-rose-500/90 rounded-l-xs shadow-sm translate-x-1 group-hover:translate-x-0.5 transition-transform duration-300"></div>
            <div className="w-3 sm:w-4 h-1.5 bg-amber-400/90 rounded-l-xs shadow-sm translate-x-1.5 group-hover:translate-x-0.5 transition-transform duration-300"></div>
            <div className="w-2.5 sm:w-3 h-1.5 bg-emerald-500/90 rounded-l-xs shadow-sm translate-x-1 group-hover:translate-x-0.5 transition-transform duration-300"></div>
          </div>

          {/* Spine Crease / Fold wear effect to show 3D textbook depth */}
          <div className="absolute left-[2.5px] top-0 bottom-0 w-[3.5px] bg-white/15 pointer-events-none z-15 shadow-[1px_0_3px_rgba(0,0,0,0.12)] opacity-80"></div>
          <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-black/25 pointer-events-none z-15"></div>

          {/* Scribbled student ownership handwriting representation */}
          <div className="absolute top-[32px] sm:top-[42px] md:top-[48px] right-2 sm:right-3.5 pointer-events-none rotate-[-5deg] z-15 select-none opacity-45 mix-blend-multiply transition-opacity group-hover:opacity-70 bg-white/30 px-1 py-0.5 border border-blue-900/10 rounded-sm">
            <span className="font-mono text-[7px] sm:text-[8px] text-blue-900 font-extrabold tracking-wide uppercase italic">
              {book.sellerName ? book.sellerName.split(" ")[0] : "Student"}'s
            </span>
          </div>

          {/* Coffee mug ring stain overlay - scaled smaller inside mobile row */}
          {hasStainRing && (
            <div className="absolute top-[32%] left-[12%] pointer-events-none opacity-[0.06] rotate-45 select-none z-15">
              <svg className="w-12 h-12 sm:w-20 sm:h-20 text-amber-950" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                <ellipse cx="50" cy="50" rx="36" ry="34" />
                <path d="M78 42 C 86 46, 86 54, 78 58" />
                <ellipse cx="48" cy="48" rx="35" ry="33" />
              </svg>
            </div>
          )}

          {/* Highlight post-it yellow sticky note for Topper / annotated items - hidden on ultra compact covers */}
          {isTopperAnnotated && (
            <div className="hidden sm:block absolute bottom-12 md:bottom-16 right-2 bg-yellow-101 text-yellow-950 p-2 py-1.5 rounded-sm shadow-md border-t-2 border-yellow-300 text-[10px] font-sans font-bold tracking-tight rotate-[-4deg] z-15 select-none max-w-[90px] md:max-w-[100px] leading-tight">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-yellow-200/50"></div>
              <span className="text-[7.5px] uppercase tracking-wider text-amber-800 block font-mono">Note:</span>
              <span className="truncate block font-semibold text-[8.5px]">📌 Annotated!</span>
            </div>
          )}

          {/* Tactical Dog-ear Folded Corner */}
          {hasDogEar && (
            <>
              {/* Triangular page flap corner fold */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-slate-200 border-l border-t border-slate-300/60 shadow-[-1px_-1px_3px_rgba(0,0,0,0.15)] pointer-events-none z-20 [clip-path:polygon(0_100%,100%_0,100%_100%)] rounded-tl-xs"></div>
              {/* Exposed underlying page shadow gap */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-stone-100 pointer-events-none z-10 [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
            </>
          )}

          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} p-3 sm:p-5 flex flex-col justify-between text-white relative`}>
              {/* Textbook Aesthetic Spine Line & Pattern */}
              <div className="absolute left-2.5 top-0 bottom-0 w-[3px] bg-gradient-to-r from-white/10 to-black/10 shadow-md"></div>
              
              {/* Tiny publisher block logo */}
              <div className="self-end text-[7.5px] sm:text-[9px] font-mono tracking-widest uppercase opacity-70 bg-white/10 px-1 py-0.5 rounded backdrop-blur-xs">
                CS ED
              </div>

              {/* Title & Author on virtual jacket */}
              <div className="space-y-1.5 mt-2 sm:mt-4 pl-2 select-none">
                <p className="text-[8px] sm:text-[10px] font-mono tracking-wider opacity-75 uppercase">Campus Book</p>
                <h3 className="text-xs sm:text-lg font-display font-black tracking-tight leading-4 sm:leading-6 line-clamp-3">
                  {book.title}
                </h3>
              </div>

              {/* Bottom meta tag */}
              <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-mono opacity-80 pl-2">
                <span className="truncate">{book.edition}</span>
              </div>
            </div>
          )}

          {/* Topper's Copy Golden Star Badge - scaled for compact size */}
          {book.isTopperCopy && (
            <div className="absolute bottom-2 right-2 md:bottom-auto md:top-4 md:right-4 bg-amber-500 text-gray-950 text-[7px] sm:text-[9px] md:text-[10px] font-display font-black py-0.5 sm:py-1 px-1.5 sm:px-3 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg border border-amber-300 animate-pulse z-15">
              <Award className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-gray-950" />
              <span className="max-sm:hidden">Topper's Copy</span>
            </div>
          )}
          
          {/* Highlighted Price Tag Floating Overlay - adjusted for cover width */}
          <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 flex items-center gap-1 bg-gray-950/95 backdrop-blur-md text-white font-display px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full shadow-lg border border-white/10 z-15">
            <span className="font-black text-[10px] sm:text-xs text-emerald-400">₹{book.price}</span>
          </div>

          {/* Quick inspect overlay button */}
          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleOpenInspect}
              className="bg-white/95 backdrop-blur-xs text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-brand-purple" />
              <span>Inspect</span>
            </button>
          </div>
        </div>

        {/* Book Information Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0 md:space-y-4 space-y-3">
          <div>
            {/* Main Title & Authors Info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2.5 mb-2.5">
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm sm:text-base font-display font-black text-gray-950 leading-tight line-clamp-2 group-hover:${theme.textPrimary} transition-colors`}>
                  {book.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-gray-505 font-semibold mt-0.5 truncate">
                  {book.author} • <span className={`${theme.textPrimary} font-bold bg-slate-100/90 px-1.5 py-0.5 rounded text-[10px]`}>{book.edition}</span>
                </p>
              </div>
              {/* Extremely bold price highlight inside card */}
              <div className="text-left sm:text-right shrink-0 flex flex-col items-start sm:items-end justify-center mt-1 sm:mt-0">
                <div className="flex items-center gap-1.5 justify-start sm:justify-end">
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="text-[11px] sm:text-xs line-through text-gray-400 font-bold">
                      ₹{book.originalPrice}
                    </span>
                  )}
                  <span className={`text-sm sm:text-[15px] md:text-base font-display font-black ${theme.textPrimary} ${theme.accentBg.split(' ')[0]} px-2 py-0.5 rounded-lg border ${theme.accentBorder}`}>
                    ₹{book.price}
                  </span>
                </div>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-[9px] text-emerald-600 font-extrabold mt-0.5 tracking-tight">
                    Save ₹{book.originalPrice - book.price} ({Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}%)
                  </span>
                )}
              </div>
            </div>

            {/* Seller Metadata */}
            <div className="pt-2 sm:pt-3.5 border-t border-gray-150 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="font-bold text-gray-800 truncate">{book.sellerName}</span>
                <span className={`text-[9.5px] sm:text-[10px] px-2 py-0.5 rounded-full font-extrabold font-mono shrink-0 ${theme.badgeHighlight || 'bg-indigo-50/80 text-indigo-700'}`}>
                  {book.sellerCourse}
                </span>
              </div>

              {/* Condition badge text */}
              <div className="bg-gray-50/90 p-2 sm:p-2.5 rounded-xl border border-gray-100 select-none">
                <p className="text-[10px] sm:text-[11px] text-gray-600 italic line-clamp-1">
                  "{book.condition}"
                </p>
              </div>

              {/* Specs pill view inside catalog list */}
              <div className="flex flex-wrap gap-1 mt-1">
                {book.binding && (
                  <span className="text-[8px] sm:text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                    {book.binding}
                  </span>
                )}
                {book.totalPages && (
                  <span className="text-[8px] sm:text-[9px] bg-slate-100/95 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                    📚 {book.totalPages} Pages
                  </span>
                )}
                {book.publicationYear && (
                  <span className="text-[8px] sm:text-[9px] bg-slate-100/95 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                    🗓️ {book.publicationYear}
                  </span>
                )}
              </div>

              {/* Campus location & distance */}
              <div className="flex items-center text-[10px] sm:text-[11px] text-gray-500 gap-1.5 pt-0.5">
                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3 text-red-500 hover:scale-110 transition-transform" />
                </div>
                <span className="truncate font-semibold text-gray-600">{book.distance}</span>
              </div>
            </div>
          </div>

          {/* Actions: Inspect & Buy Button Grid - side-by-side on mobile, stacked on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 sm:gap-2 pt-1">
            <button
              onClick={handleOpenInspect}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-display font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-center"
            >
              <Eye className="w-3.5 h-3.5 shrink-0 text-brand-purple" />
              <span className="truncate">Inspect Pages</span>
            </button>

            <button
              onClick={() => onBuyClick(book)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] hover:shadow-lg hover:shadow-emerald-600/10 text-white py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-display font-extrabold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-xs transition-all duration-200 cursor-pointer text-center"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="truncate">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS & PAGES INSPECT MODAL - FULL SCREEN DETAILED OVERLAY */}
      {isInspectOpen && (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-slate-950 text-white animate-fade-in select-none h-screen h-[100dvh] w-screen overflow-hidden">
          {/* Main Visual Arena (Image Panel) - takes up 48% height on mobile, full-flex on desktop */}
          <div className="h-[48vh] md:h-full flex-1 min-h-0 bg-slate-950 flex flex-col relative group/viewer overflow-hidden justify-between">
            {/* Topbar inside viewer */}
            <div className="absolute top-0 inset-x-0 p-3 md:p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-30">
              <button
                type="button"
                onClick={() => setIsInspectOpen(false)}
                className="bg-black/50 hover:bg-black/75 hover:scale-105 active:scale-95 text-white p-2 md:p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] md:text-xs font-bold"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Exit</span>
              </button>

              {/* Page indicator status banner */}
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-white/15 text-[10px] md:text-xs font-mono font-bold tracking-wide">
                Page {activeImageIndex + 1} / {previewImages.length}
              </div>

              {/* Interactive Zoom Control */}
              <button
                type="button"
                onClick={handleZoomToggle}
                className="bg-black/50 hover:bg-black/75 hover:scale-105 active:scale-95 text-white py-1.5 px-2.5 md:py-2 md:px-3 rounded-lg transition-all cursor-pointer backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] md:text-xs font-bold"
                title="Toggle High-Resolution Magnification"
              >
                {zoomLevel > 1 ? (
                  <>
                    <ZoomOut className="w-3.5 h-3.5 text-amber-400" />
                    <span>Zoom Out</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zoom In</span>
                  </>
                )}
              </button>
            </div>

            {/* Centered Large Immersive Scanned Page Viewer */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative overflow-auto">
              {/* Prev Button */}
              {previewImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 md:left-4 z-20 bg-black/60 hover:bg-white hover:text-black hover:scale-110 active:scale-90 text-white p-2 md:p-4 rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-2xl"
                >
                  <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                </button>
              )}

              {/* The Scanned Image Canvas */}
              <div className="w-full h-full max-h-[38vh] md:max-h-[80vh] flex items-center justify-center transition-all duration-300">
                {previewImages[activeImageIndex] ? (
                  <div className="overflow-auto max-w-full max-h-full">
                    <img
                      src={previewImages[activeImageIndex]}
                      alt={`Campus scan view ${activeImageIndex + 1}`}
                      style={{ transform: `scale(${zoomLevel})` }}
                      className="max-h-[34vh] md:max-h-[78vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10 transition-transform duration-300 ease-out origin-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className={`w-48 md:w-64 aspect-[3/4] rounded-2xl bg-gradient-to-br ${gradientClass} flex flex-col justify-center items-center text-white font-bold p-4 md:p-8 text-center shadow-2xl border border-white/15`}>
                    <BookOpen className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 text-white/55 animate-bounce" />
                    <p className="text-sm md:text-xl font-display font-black leading-tight">{book.title}</p>
                    <p className="text-[8px] md:text-[10px] mt-1 font-mono opacity-80 uppercase tracking-widest">No preview image</p>
                  </div>
                )}
              </div>

              {/* Next Button */}
              {previewImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 md:right-4 z-20 bg-black/60 hover:bg-white hover:text-black hover:scale-110 active:scale-90 text-white p-2 md:p-4 rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-2xl"
                >
                  <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                </button>
              )}
            </div>

            {/* Bottom Slider / Navigation Thumbnails Row */}
            <div className="bg-gradient-to-t from-black/95 to-transparent p-3 md:p-6 pt-6 md:pt-12 space-y-2 z-10 shrink-0">
              <span className="block text-[7.5px] md:text-[8px] tracking-widest text-zinc-400 font-extrabold uppercase font-mono text-center">
                Multi-Page Viewfinder (Tap to flip)
              </span>
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 no-scrollbar max-w-lg mx-auto">
                {previewImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setZoomLevel(1);
                      setActiveImageIndex(idx);
                    }}
                    className={`relative w-11 h-14 md:w-14 md:h-18 rounded-lg border-2 transition-all duration-200 overflow-hidden bg-slate-900 flex-none hover:scale-105 active:scale-95 ${
                      activeImageIndex === idx
                        ? "border-emerald-400 ring-4 ring-emerald-400/20 shadow-lg scale-110"
                        : "border-zinc-800 opacity-55 hover:opacity-100"
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/15 hover:bg-transparent transition-colors"></div>
                    <span className="absolute bottom-0 inset-x-0 bg-black/90 text-[7px] md:text-[8px] text-zinc-300 py-0.5 font-black uppercase text-center truncate">
                      {idx === 0 && book.coverUrl ? "Cover" : `P. ${book.coverUrl ? idx : idx + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right detailed educational board section */}
          <div className="h-[52vh] md:h-full md:w-[400px] xl:w-[450px] shrink-0 bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col overflow-y-auto relative text-zinc-100">
            <div className="p-6 md:p-8 space-y-6 flex-1">
              {/* Verification & Badging */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    CAMPUS INSIGHTS Verified
                  </span>
                  {book.isTopperCopy && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/20 font-bold px-3 py-1 rounded-full flex items-center gap-1 font-mono font-black">
                      <Award className="w-3.5 h-3.5 fill-amber-300/20" />
                      TOPPER COPY
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-display font-black text-white tracking-tight leading-7">
                  {book.title}
                </h3>
                <p className="text-xs text-zinc-400 font-bold mt-1 font-mono">
                  Edition: {book.edition} | Written by {book.author}
                </p>
              </div>

              {/* Savings Meter Block */}
              {book.originalPrice && (
                <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/25 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400 font-mono">
                    <span>Retail Store Price:</span>
                    <span className="line-through text-zinc-500 font-extrabold">₹{book.originalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-white">
                    <span className="flex items-center gap-1.5">
                      Student Listing Deals:
                    </span>
                    <span className="text-xl font-bold font-display text-emerald-400">₹{book.price}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/15 text-[11px] text-emerald-300 font-semibold leading-relaxed flex items-center gap-1.5 font-mono">
                    <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                    <span>Instant student savings: <strong className="text-emerald-200">₹{book.originalPrice - book.price}</strong> ({Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% off!)</span>
                  </div>
                </div>
              )}

              {/* Scholastic metadata grid */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider font-mono">
                  Scholastic Specifications
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Binding style</p>
                    <p className="text-xs font-bold text-white mt-0.5">{book.binding || "Paperback"}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Publication Year</p>
                    <p className="text-xs font-bold text-white mt-0.5">{book.publicationYear || "2021"}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Primary Language</p>
                    <p className="text-xs font-bold text-white mt-0.5">{book.language || "English"}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Total Volume Size</p>
                    <p className="text-xs font-bold text-white mt-0.5">{book.totalPages ? `${book.totalPages} Pages` : "500+ Pages"}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 col-span-2">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase font-mono">Publisher Entity</p>
                    <p className="text-xs font-bold text-white mt-0.5 truncate">{book.publisher || "Pearson Academic"}</p>
                  </div>
                </div>
              </div>

              {/* Owner Condition Audit */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider font-mono">
                  Owner Condition Audit
                </h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-xs text-zinc-300 leading-relaxed font-mono">
                  <p className="italic">
                    "{book.condition}"
                  </p>
                  <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-white/5 text-[9px] text-zinc-400 font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Listed by {book.sellerName} ({book.sellerCourse})</span>
                  </div>
                </div>
              </div>

              {/* Distance context details */}
              <div className="bg-white/5 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-semibold">{book.distance}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer Box */}
            <div className="p-6 md:p-8 bg-slate-950/70 border-t border-white/15 space-y-3 shrink-0">
              <button
                onClick={() => {
                  setIsInspectOpen(false);
                  onBuyClick(book);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white py-3.5 px-4 rounded-xl font-display font-black text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-950/60"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Message Seller ({book.sellerName})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInspectOpen(false)}
                className="w-full bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white py-2.5 px-4 rounded-xl font-mono text-center text-xs font-bold transition-all cursor-pointer"
              >
                Close Immersive Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
