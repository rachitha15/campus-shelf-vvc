import { useState, FormEvent } from "react";
import { Bounty } from "../types";
import { TrendingUp, Plus, X, Megaphone, Send } from "lucide-react";

interface BountyBarProps {
  bounties: Bounty[];
  onAddBounty: (bounty: Omit<Bounty, "id">) => void;
  onSelectBounty?: (bounty: Bounty) => void;
  currentTheme: {
    primaryBg: string;
    primaryHover: string;
    textPrimary: string;
    accentBg: string;
    focusRing: string;
    focusBorder: string;
  };
}

export default function BountyBar({ bounties, onAddBounty, onSelectBounty, currentTheme }: BountyBarProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [seeking, setSeeking] = useState("");
  const [course, setCourse] = useState("");
  const [reward, setReward] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!seeking.trim()) return;

    onAddBounty({
      seekingText: seeking,
      course: course || "General",
      offeredReward: reward ? `Offering ₹${reward}` : "Negotiable",
    });

    // Reset Form
    setSeeking("");
    setCourse("");
    setReward("");
    setShowRequestModal(false);
  };

  return (
    <div className="bg-white border-b border-gray-100 py-3.5 relative">
      <div className="max-w-xl mx-auto px-4 flex items-center gap-3">
        {/* Urgent Icon */}
        <div className={`flex items-center gap-1.5 shrink-0 ${currentTheme.accentBg} text-xs font-bold px-3 py-1.5 rounded-full`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-display uppercase tracking-wider text-[10px] font-extrabold">Demand List</span>
        </div>

        {/* Scrollable container with hidden scrollbar */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5">
          {/* Quick Request Trigger Pill */}
          <button
            onClick={() => setShowRequestModal(true)}
            className={`flex items-center gap-1 ${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white font-display font-extrabold text-xs py-1.5 px-3.5 rounded-full shrink-0 cursor-pointer shadow-xs whitespace-nowrap active:scale-95 transition-all`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Book</span>
          </button>

          {/* List of active student bounties */}
          {bounties.map((bounty) => (
            <div
              key={bounty.id}
              onClick={() => onSelectBounty?.(bounty)}
              className="bg-gray-50/80 border border-gray-150 hover:border-gray-300 hover:bg-white text-gray-700 text-xs py-1.5 px-4 rounded-full shrink-0 flex items-center gap-2 transition-all shadow-2xs cursor-pointer hover:scale-[1.02] active:scale-95"
              title="Click to fulfill this requested book demand!"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
              <span className="font-bold text-gray-900">{bounty.seekingText}</span>
              <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                {bounty.course}
              </span>
              <span className="text-[11px] text-emerald-600 font-extrabold border-l border-gray-200 pl-2">
                {bounty.offeredReward}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Request Seeking Bubble Overlay - Modern Dialog */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 animate-slide-up">
            <div className={`p-6 text-white relative ${currentTheme.primaryBg}`}>
              <div className="absolute right-[-10px] top-[-10px] opacity-10">
                <Megaphone className="w-24 h-24 rotate-12" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <span className="bg-white/10 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full font-bold">
                    HOSTEL BROADCAST
                  </span>
                  <h3 className="text-lg font-display font-black mt-1">Request a Book</h3>
                  <p className="text-[11px] opacity-90 mt-0.5">Let nearby hostelers know what to sell!</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                  Book Name or Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahadevan Books, QTM Notes"
                  value={seeking}
                  onChange={(e) => setSeeking(e.target.value)}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 ${currentTheme.focusRing} ${currentTheme.focusBorder}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                    Course Code / Class
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MBA Sec B"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 ${currentTheme.focusRing} ${currentTheme.focusBorder}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider font-mono mb-1.5">
                    Offered Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 ${currentTheme.focusRing} ${currentTheme.focusBorder}`}
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-display font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 ${currentTheme.primaryBg} ${currentTheme.primaryHover} text-white font-display font-extrabold text-xs py-3 rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all`}
                >
                  <Send className="w-3 h-3" />
                  <span>Post Demand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
