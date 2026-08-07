import React from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles, 
  LayoutDashboard, 
  PhoneCall, 
  Globe,
  MapPin,
  Flame,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { Language, User } from '../types';

interface NavbarProps {
  currentView: 'marketplace' | 'advisor' | 'how_low' | 'admin';
  setCurrentView: (view: 'marketplace' | 'advisor' | 'how_low' | 'admin') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  inquiryCount: number;
  onOpenB2BModal: (tab?: 'b2b' | 'verify') => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  lang,
  setLang,
  inquiryCount,
  onOpenB2BModal,
  currentUser,
  onOpenAuthModal
}) => {
  const isAmharic = lang === 'am';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="bg-slate-950 text-amber-400 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
            Enkutatash 2026
          </span>
          <span>
            {isAmharic
              ? '🌼 የ2019 እንቁጣጣሽ በዓል የፍየል ሽያጭና የ70 ብር "ምን ያህል ዝቅተኛ?" ጨረታ ተጀምሯል!'
              : '🌼 Enkutatash Goat Marketplace & 70 Birr "How Low" Bidding is Live!'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold text-slate-900">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Dire Dawa & Addis Ababa
          </span>
          <span className="flex items-center gap-1">
            <PhoneCall className="w-3 h-3" /> +251 911 234 567
          </span>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setCurrentView('marketplace')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-lg">
              DF
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white group-hover:text-amber-400 transition-colors">
                DIRE FARMS PLC
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {isAmharic ? 'የእንስሳት ሽያጭና ማደለቢያ' : 'Premium Ethiopian Livestock Marketplace'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setCurrentView('marketplace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'marketplace'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'የፍየል ካታሎግ' : 'Marketplace'}</span>
          </button>

          <button
            onClick={() => setCurrentView('how_low')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              currentView === 'how_low'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{isAmharic ? 'ምን ያህል ዝቅተኛ? (70 ብር)' : 'How Low Bidding'}</span>
          </button>

          <button
            onClick={() => setCurrentView('advisor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'advisor'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAmharic ? 'የኤአይ ረዳት' : 'AI Advisor'}</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'የአስተዳዳሪ ሰሌዳ' : 'Farm Admin'}</span>
            {inquiryCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                {inquiryCount}
              </span>
            )}
          </button>
        </nav>


        {/* Language & Account Profile Button */}
        <div className="flex items-center gap-2">
          {/* User Account / Sign In */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-extrabold text-amber-400 rounded-lg transition-colors cursor-pointer"
          >
            {currentUser ? (
              <>
                <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate text-white font-bold">{currentUser.name}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAmharic ? 'ይግቡ' : 'Sign In'}</span>
              </>
            )}
          </button>

          {/* B2B / Verify Health Pass */}
          <button
            onClick={() => onOpenB2BModal('b2b')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAmharic ? 'የጅምላ ትዕዛዝ' : 'B2B Pass'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 rounded-lg transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'አማርኛ' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
