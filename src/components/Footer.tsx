import React from 'react';
import { 
  MapPin, 
  PhoneCall, 
  Mail, 
  ShieldCheck, 
  Award, 
  CheckCircle2 
} from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  lang: Language;
  onOpenB2BModal?: (tab?: 'b2b' | 'verify') => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenB2BModal }) => {
  const isAmharic = lang === 'am';

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-16">
      
      {/* Top Value Props Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-white text-sm">
              {isAmharic ? 'የእርሻ ጥራትና የጤና ማረጋገጫ' : 'Verified Farm Quality'}
            </h4>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              {isAmharic ? 'ሁሉም ፍየሎች በእንስሳት ሐኪም ተመርምረው የጤና ሰርተፍኬት አላቸው።' : 'All livestock undergo 90-day supervised fattening with Ministry health passes.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <Award className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-white text-sm">
              {isAmharic ? 'ግልጽ የብር ዋጋ' : 'Transparent Fixed ETB Pricing'}
            </h4>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              {isAmharic ? 'የደላላ እጅ ሳይኖር በግልጽ የተቀመጠ የክብደትና የዋጋ ስሌት።' : 'No broker markups or hidden fees. Real weights in kilograms and fixed ETB prices.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-white text-sm">
              {isAmharic ? 'አስተማማኝ ማድረስ' : 'Enkutatash Scheduled Delivery'}
            </h4>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              {isAmharic ? 'ለበዓልዎ ዋዜማ በጊዜ እንዲደርስዎ ይደረጋል።' : 'Prompt delivery in Dire Dawa and Addis Ababa ahead of New Year celebrations.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 font-black text-slate-950 flex items-center justify-center text-sm">
              DF
            </div>
            <span className="font-black text-white text-base tracking-tight">DIRE FARMS PLC</span>
          </div>
          <p className="text-slate-400 text-xs max-w-md leading-relaxed">
            Dire Farms PLC is Ethiopia's premier digital livestock marketplace, connecting urban households, hotels, and restaurants directly to fattened livestock pasture lots.
          </p>

          {onOpenB2BModal && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => onOpenB2BModal('b2b')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isAmharic ? 'የጅምላ ትዕዛዝ መጠየቂያ' : 'B2B Bulk Orders'}
              </button>
              <button
                onClick={() => onOpenB2BModal('verify')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isAmharic ? 'የጤና ማረጋገጫ ሰርተፍኬት አረጋግጥ' : 'Verify Health Pass'}
              </button>
              <button
                onClick={() => {
                  const elem = document.getElementById('faq-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isAmharic ? 'ተደጋጋሚ ጥያቄዎች (FAQ)' : 'Customer FAQs'}
              </button>
            </div>
          )}

          <div className="pt-2 text-[11px] text-amber-400 font-semibold">
            © 2026 Dire Farms PLC. All Rights Reserved. Enkutatash 2019 Edition.
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
            {isAmharic ? 'አድራሻና እውቂያ' : 'Farm Depots & Contact'}
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Dire Dawa Model Feedlot • Block A, Eastern Region</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Addis Ababa Sales Office • Bole Subcity, Addis Ababa</span>
            </li>
            <li className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-200">+251 911 234 567 / +251 922 889 900</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400 shrink-0" />
              <span>sales@direfarms.com.et</span>
            </li>
          </ul>
        </div>

        {/* Operating Hours */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
            {isAmharic ? 'የስራ ሰዓት' : 'Holiday Service Hours'}
          </h4>
          <div className="space-y-1.5 text-xs text-slate-400">
            <p className="flex justify-between border-b border-slate-800 pb-1">
              <span>Monday - Saturday:</span>
              <span className="font-bold text-slate-200">7:00 AM - 8:00 PM</span>
            </p>
            <p className="flex justify-between border-b border-slate-800 pb-1">
              <span>Enkutatash Holiday Eve:</span>
              <span className="font-bold text-amber-400">24 Hours Hotline</span>
            </p>
            <p className="text-[11px] text-slate-500 pt-1">
              On-site inspection visits available by appointment at Dire Dawa farm depot.
            </p>
          </div>
        </div>

      </div>

    </footer>
  );
};
