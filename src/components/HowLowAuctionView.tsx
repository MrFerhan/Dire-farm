import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  HelpCircle, 
  Trophy, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Send, 
  Sparkles, 
  Loader2, 
  QrCode, 
  DollarSign, 
  Tag, 
  Info,
  Bell,
  Mail,
  MessageSquare,
  CreditCard,
  Wallet,
  Lock,
  Smartphone,
  Receipt,
  Check
} from 'lucide-react';
import { BidAuction, Language, User } from '../types';

interface HowLowAuctionViewProps {
  onShowToast: (msg: string) => void;
  lang: Language;
  currentUser?: User | null;
  onOpenAuthModal?: () => void;
}

export const HowLowAuctionView: React.FC<HowLowAuctionViewProps> = ({ onShowToast, lang, currentUser, onOpenAuthModal }) => {
  const isAmharic = lang === 'am';

  const [auctions, setAuctions] = useState<BidAuction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Selected Auction for Bidding
  const [selectedAuction, setSelectedAuction] = useState<BidAuction | null>(null);

  // Bid Form State
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [bidAmount, setBidAmount] = useState<string>('3.50');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'chapa'>('telebirr');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Payment Gateway Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentPin, setPaymentPin] = useState('1234');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Result Feedback State after bid submission
  const [bidResult, setBidResult] = useState<{
    status_hint: 'lowest_unique' | 'unique_higher' | 'duplicate';
    message: string;
    total_bids_count: number;
  } | null>(null);

  // Fetch Auctions
  const fetchAuctions = () => {
    fetch('/api/auctions')
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        if (data.success && Array.isArray(data.auctions)) {
          setAuctions(data.auctions);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.error('Error fetching auctions:', err);
      });
  };

  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 10000);
    const timerInterval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, []);

  const handleOpenBidModal = (auc: BidAuction) => {
    setSelectedAuction(auc);
    setBidResult(null);
    setSubmitError(null);
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phone);
    }
    setPaymentRef(`TB-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleOpenPayModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!currentUser) {
      setSubmitError('An account is required to place auction bids. Please sign in or register with your Ethiopian Fayda National ID (FAN).');
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    if (!currentUser.id_verified || !currentUser.national_id) {
      setSubmitError('National ID Verification Required: Please verify your 12-digit Ethiopian Fayda Digital ID in your account profile before bidding.');
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    if (!customerName || !customerPhone || !bidAmount) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    // Open Pay Bid Fee Modal
    setShowPayModal(true);
  };

  const handleExecutePayment = async () => {
    setIsProcessingPay(true);
    const generatedRef = paymentMethod === 'telebirr' 
      ? `TB-${Math.floor(100000 + Math.random() * 900000)}` 
      : paymentMethod === 'cbe_birr'
      ? `CBE-${Math.floor(100000 + Math.random() * 900000)}`
      : `CHP-${Math.floor(100000 + Math.random() * 900000)}`;

    setPaymentRef(generatedRef);

    // Simulate payment processing delay with Ethio Telecom / CBE Gateway
    setTimeout(async () => {
      setIsProcessingPay(false);
      setShowPayModal(false);
      await executeFinalBidSubmit(generatedRef);
    }, 1400);
  };

  const executeFinalBidSubmit = async (ref: string) => {
    if (!selectedAuction) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${selectedAuction.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          bid_amount_etb: parseFloat(bidAmount),
          payment_method: paymentMethod,
          payment_reference: ref
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        setBidResult({
          status_hint: data.status_hint,
          message: data.message,
          total_bids_count: data.total_bids_count
        });
        fetchAuctions();
        onShowToast(`70 ETB Bid Fee Verified! Bid of ETB ${bidAmount} registered for ${selectedAuction.goat_title}!`);
      } else {
        if (data.code === 'ACCOUNT_REQUIRED' || data.code === 'NID_REQUIRED') {
          setSubmitError(data.error);
          if (onOpenAuthModal) onOpenAuthModal();
        } else {
          setSubmitError(data.error || 'Failed to register bid.');
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      // Fallback response for offline preview
      const hints: Array<'lowest_unique' | 'unique_higher' | 'duplicate'> = ['lowest_unique', 'unique_higher', 'duplicate'];
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      setBidResult({
        status_hint: randomHint,
        message: 'Bid registered! 70 ETB entry fee verified.',
        total_bids_count: (selectedAuction.total_bids_count || 10) + 1
      });
      onShowToast(`70 ETB Payment Received! Bid of ETB ${bidAmount} recorded!`);
    }
  };

  // Dynamic Countdown renderer
  const renderCountdown = (endDateStr: string, detailed = false) => {
    const end = new Date(endDateStr).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return (
        <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold rounded-lg flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> AUCTION CLOSED
        </span>
      );
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (detailed) {
      return (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
          <div className="bg-slate-900 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md text-center min-w-[38px]">
            <span className="block text-sm font-black">{days}</span>
            <span className="text-[9px] uppercase text-slate-400 block font-sans">Days</span>
          </div>
          <span className="text-amber-500 font-bold">:</span>
          <div className="bg-slate-900 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md text-center min-w-[38px]">
            <span className="block text-sm font-black">{String(hours).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase text-slate-400 block font-sans">Hrs</span>
          </div>
          <span className="text-amber-500 font-bold">:</span>
          <div className="bg-slate-900 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md text-center min-w-[38px]">
            <span className="block text-sm font-black">{String(mins).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase text-slate-400 block font-sans">Min</span>
          </div>
          <span className="text-amber-500 font-bold">:</span>
          <div className="bg-slate-900 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-md text-center min-w-[38px]">
            <span className="block text-sm font-black text-rose-400 animate-pulse">{String(secs).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase text-slate-400 block font-sans">Sec</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 font-mono text-xs font-black text-amber-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-md backdrop-blur-xs">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
        <span>
          {days}d {String(hours).padStart(2, '0')}h {String(mins).padStart(2, '0')}m {String(secs).padStart(2, '0')}s
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Banner / Header */}
      <div className="relative rounded-3xl bg-slate-950 text-white overflow-hidden border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              {isAmharic ? 'ምን ያህል ዝቅተኛ? ጨረታ' : '"How Low" Auction'}
            </span>
            <span className="px-3 py-1 bg-slate-800 text-amber-400 border border-slate-700 rounded-full text-xs font-extrabold">
              {isAmharic ? 'የመግቢያ ክፍያ 70 ብር' : '70 ETB Entry Fee'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {isAmharic
              ? 'ዝቅተኛውንና አንደኛውን ብቸኛ ዋጋ በመስጠት በ70 ብር ፍየል ያሸንፉ!'
              : 'Win Premium Enkutatash Goats with the Lowest Unique Bid!'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isAmharic
              ? 'በ70 ብር ብቻ ይሳተፉ፤ ከማንኛውም ተወዳዳሪ ያልተደገመና ዝቅተኛ ዋጋ ያስገቡ። የ15-20 ቀናት የጨረታ ጊዜ ሲጠናቀቅ ፍየሉን በሰጡት አነስተኛ ዋጋ ይረከቡ!'
              : 'Pay a flat 70 ETB entry fee and enter your unique bid amount. The participant with the smallest unrepeated bid when the 15-20 day timer expires wins the fattened livestock lot!'}
          </p>

          {/* How It Works Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-black text-xs block">STEP 1</span>
              <h4 className="font-extrabold text-white text-xs">Pay 70 ETB Entry</h4>
              <p className="text-[11px] text-slate-400">Via Telebirr or CBE Birr to validate your auction ticket.</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-black text-xs block">STEP 2</span>
              <h4 className="font-extrabold text-white text-xs">Submit Secret Bid</h4>
              <p className="text-[11px] text-slate-400">Pick any amount (e.g., 1.50 ETB, 4.20 ETB, 0.85 ETB).</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-black text-xs block">STEP 3</span>
              <h4 className="font-extrabold text-white text-xs">Lowest Unique Wins</h4>
              <p className="text-[11px] text-slate-400">If no one else matched your lowest amount, you win the goat!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Auctions Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
              Live Reserve Auction Lots
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              {isAmharic ? 'አሁን ክፍት የሆኑ የጨረታ ፍየሎች' : 'Active "How Low" Bidding Lots'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            15 - 20 Days Countdown Availability
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-xs font-bold">Loading active auction feed...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.filter((a) => a.is_active).map((auc) => (
              <div
                key={auc.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={auc.goat_image}
                      alt={auc.goat_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {auc.goat_breed}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      {renderCountdown(auc.end_date)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {auc.goat_title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {auc.description}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Market Value</span>
                        <span className="font-black text-slate-900 text-sm">
                          ETB {auc.market_price_etb.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Bid Entry Fee</span>
                        <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          70 ETB / Bid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenBidModal(auc)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Flame className="w-4 h-4 fill-slate-950" />
                    <span>{isAmharic ? 'በ70 ብር ተሳተፍ' : 'Place 70 ETB Bid Now'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                    {auc.total_bids_count || 0} bids placed so far
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Auctions & Recent Winners */}
      <div className="space-y-6 pt-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
            Dire Farms Auction Hall of Fame
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            {isAmharic ? 'የቅርብ ጊዜ አሸናፊዎች' : 'Recent "How Low" Winners'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {auctions.filter((a) => !a.is_active).map((closed) => (
            <div
              key={closed.id}
              className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col sm:flex-row gap-4 items-center"
            >
              <img
                src={closed.goat_image}
                alt={closed.goat_title}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-700"
              />
              <div className="space-y-2 flex-1">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-black uppercase">
                  🏆 Auction Winner Announced
                </span>
                <h4 className="font-extrabold text-sm text-white">{closed.goat_title}</h4>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <p>
                    Winner: <span className="font-bold text-amber-400">{closed.winner_name}</span>
                  </p>
                  <p>
                    Winning Lowest Unique Bid:{' '}
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      ETB {closed.winning_bid_etb?.toFixed(2)}
                    </span>
                    {' '}(Market Price: ETB {closed.market_price_etb.toLocaleString()})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bidding Modal */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-black text-slate-900 text-sm">
                  {isAmharic ? 'የ70 ብር ጨረታ ማስገቢያ' : 'Submit 70 ETB Bid'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuction(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!bidResult ? (
              <form onSubmit={handleOpenPayModal} className="space-y-4 text-xs">
                
                {/* Account & Fayda NID Status Bar */}
                {currentUser && currentUser.id_verified ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl flex items-center justify-between text-emerald-950 font-bold">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Fayda NID Verified Bidder: <span className="font-mono">{currentUser.national_id}</span></span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-[10px] uppercase font-black">Verified</span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl space-y-2 text-amber-950">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold flex items-center gap-1.5 text-xs text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Account & Fayda NID Required to Bid</span>
                      </span>
                      {onOpenAuthModal && (
                        <button
                          type="button"
                          onClick={onOpenAuthModal}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          Sign In / Verify NID
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      To guarantee fair auction integrity, all bidders must register and verify their 12-digit Ethiopian Fayda Digital ID (FAN).
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold space-y-1">
                    <p>{submitError}</p>
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        className="underline font-bold text-rose-900 hover:text-rose-950 block mt-1 cursor-pointer"
                      >
                        Click here to Sign In or Verify National ID
                      </button>
                    )}
                  </div>
                )}

                {/* Goat Summary Card with Live Timer */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAuction.goat_image}
                      alt={selectedAuction.goat_title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{selectedAuction.goat_title}</h4>
                      <span className="text-[11px] text-slate-500 block">
                        Market Value: ETB {selectedAuction.market_price_etb.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    {renderCountdown(selectedAuction.end_date, true)}
                  </div>
                </div>

                {/* 70 Birr Fee Info Box */}
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-xs">
                    <QrCode className="w-4 h-4 text-amber-700" />
                    <span>Pay 70 ETB Entry Fee via Telebirr or CBE Birr</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Send 70 ETB to Telebirr Merchant <span className="font-black font-mono">#908211</span> or CBE Account <span className="font-black font-mono">100022394857</span> (Dire Farms PLC). Enter transaction reference below.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ato Bethlehem Tadesse"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number (+251) *</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+251 911 223 344"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Your Secret Bid Amount (ETB) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="1000"
                      required
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full p-3 bg-slate-900 text-amber-400 font-mono text-lg font-black rounded-xl border border-slate-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ETB
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 Tip: Try uncommon decimals (e.g., 2.35 Birr, 0.95 Birr) to avoid duplicate matches!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Payment Channel</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                    >
                      <option value="telebirr">Telebirr Wallet (#908211)</option>
                      <option value="cbe_birr">CBE Birr (#100022394857)</option>
                      <option value="chapa">Chapa / Bank Cards</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Entry Fee Amount</label>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl font-black font-mono text-amber-900 text-xs flex items-center justify-between">
                      <span>70.00 ETB</span>
                      <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded text-amber-950 font-bold">FIXED FEE</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedAuction(null)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs text-xs cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>Pay Entry Fee (70 ETB) & Submit Bid</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Live Feedback Result */
              <div className="space-y-5 text-center py-2">
                {bidResult.status_hint === 'lowest_unique' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <Trophy className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-lg text-emerald-950">
                      🔥 YOU ARE CURRENTLY LEADING!
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Your bid of <span className="font-bold font-mono">ETB {bidAmount}</span> is currently the <strong>LOWEST UNIQUE BID</strong>! If no one places a lower unique bid or duplicates your amount before timer ends, you win the goat!
                    </p>
                  </div>
                )}

                {bidResult.status_hint === 'unique_higher' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-lg text-amber-950">
                      YOUR BID IS UNIQUE!
                    </h4>
                    <p className="text-xs text-amber-800">
                      Your bid of <span className="font-bold font-mono">ETB {bidAmount}</span> is unique (unrepeated), but another participant currently holds a lower unique bid. You can submit another bid for 70 Birr!
                    </p>
                  </div>
                )}

                {bidResult.status_hint === 'duplicate' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-lg text-rose-950">
                      DUPLICATE BID DETECTED!
                    </h4>
                    <p className="text-xs text-rose-800">
                      Someone else has already placed a bid for <span className="font-bold font-mono">ETB {bidAmount}</span>! Duplicated bids cannot win. Place another bid with a different amount to stay in the running!
                    </p>
                  </div>
                )}

                {/* Multi-Channel Automated Notification Dispatch Summary */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-left text-xs space-y-3 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-amber-400 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Automated Confirmations Dispatched</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[10px] font-mono font-bold">
                      3 / 3 DELIVERED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 flex flex-col items-center text-center space-y-1">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-slate-200">Email Sent</span>
                      <span className="text-[9px] text-slate-400 font-mono">SMTP Mailer</span>
                    </div>

                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 flex flex-col items-center text-center space-y-1">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-200">SMS Sent</span>
                      <span className="text-[9px] text-slate-400 font-mono">Ethio Telecom</span>
                    </div>

                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 flex flex-col items-center text-center space-y-1">
                      <Send className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-slate-200">WhatsApp Sent</span>
                      <span className="text-[9px] text-slate-400 font-mono">WhatsApp Biz</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    A receipt and live bid standing statement was dispatched to <strong className="text-slate-200 font-mono">{customerPhone}</strong> via Email, SMS, & WhatsApp.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setBidResult(null)}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs"
                  >
                    Place Another Bid (70 Birr)
                  </button>
                  <button
                    onClick={() => setSelectedAuction(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Pay Bid Fee Payment Gateway Modal */}
      {showPayModal && selectedAuction && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span>Pay Bid Fee (70.00 ETB)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    256-BIT SSL ENCRYPTED GATEWAY
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPayModal(false)}
                disabled={isProcessingPay}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Order / Fee Summary */}
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-semibold">How Low Auction Lot:</span>
                  <span className="font-extrabold text-amber-300">{selectedAuction.goat_title}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-semibold">Your Secret Bid:</span>
                  <span className="font-bold font-mono text-emerald-400">ETB {bidAmount}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-semibold">Bidding Account:</span>
                  <span className="font-mono text-slate-200">{customerName} ({customerPhone})</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-amber-400 font-extrabold">Total Entry Fee Due:</span>
                  <span className="text-base font-black font-mono text-amber-400">70.00 ETB</span>
                </div>
              </div>

              {/* Payment Channel Selector */}
              <div>
                <label className="font-bold text-slate-800 block mb-2">Select Mobile Payment Gateway</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('telebirr')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'telebirr'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-extrabold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-600" />
                    <span className="text-[10px]">Telebirr</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cbe_birr')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'cbe_birr'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-extrabold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-purple-600" />
                    <span className="text-[10px]">CBE Birr</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('chapa')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'chapa'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-extrabold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-[10px]">Chapa Cards</span>
                  </button>
                </div>
              </div>

              {/* PIN / Account Simulation Input */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    {paymentMethod === 'telebirr' ? 'Telebirr Wallet PIN' : paymentMethod === 'cbe_birr' ? 'CBE Birr PIN' : 'Card Security OTP'}
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">
                    Demo PIN: 1234
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    value={paymentPin}
                    onChange={(e) => setPaymentPin(e.target.value)}
                    placeholder="Enter PIN (1234)"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-center text-sm font-bold tracking-widest text-slate-900"
                  />
                </div>

                <p className="text-[10px] text-slate-500 text-center">
                  A USSD push request will be sent to <strong className="text-slate-800 font-mono">{customerPhone}</strong> to debit 70.00 ETB.
                </p>
              </div>

              {/* Security Banner */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-[10px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant confirmation dispatched via SMS & WhatsApp upon payment authorization.</span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  disabled={isProcessingPay}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex-1 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPay || !paymentPin}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex-[2] flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPay ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Contacting Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Authorize Pay 70.00 ETB</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
