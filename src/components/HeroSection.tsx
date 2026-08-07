import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Truck, 
  Scale,
  Flame
} from 'lucide-react';
import { Language } from '../types';

interface HeroSectionProps {
  onBrowseCatalogue: () => void;
  onOpenAdvisor: () => void;
  onOpenHowLow?: () => void;
  onOpenB2BModal?: (tab?: 'b2b' | 'verify') => void;
  lang: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBrowseCatalogue,
  onOpenAdvisor,
  onOpenHowLow,
  onOpenB2BModal,
  lang
}) => {
  const isAmharic = lang === 'am';

  return (
    <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isAmharic ? 'የ2019 የእንቁጣጣሽ በዓል ልዩ ዝግጅት' : 'Enkutatash 2026 Festive Season Livestock'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {isAmharic ? (
                <>
                  ለእንቁጣጣሽ በዓልዎ <span className="text-amber-400">ምርጥ የወፈሩ ፍየሎችን</span> በቀጥታ ከአ பண்ண ይዘዙ
                </>
              ) : (
                <>
                  Premium Goats for Your <span className="text-amber-400">Enkutatash Celebration</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {isAmharic
                ? 'ዲሬ ፋርምስ ኃ/የተ/የግ/ማኅበር ለበዓልዎ የሚሆን የጤናና የክብደት ማረጋገጫ ያላቸውን የሐረር፣ አፋርና ሶማሌ ፍየሎችን በግልጽ ዋጋና አስተማማኝ አቅርቦት ያቀርባል።'
                : 'Direct from Dire Farms pasture lots in Dire Dawa to your family feast. Quality verified, transparent ETB pricing, with full veterinary health certification.'}
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAmharic ? 'የእንስሳት ሐኪም ማረጋገጫ' : 'Vet Quality Certified'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isAmharic ? 'የክብደትና ዋጋ ግልጽነት' : 'Fixed ETB Pricing & Weight'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{isAmharic ? 'አስተማማኝ ማድረስ' : 'Scheduled Door Delivery'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBrowseCatalogue}
                className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-extrabold rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>{isAmharic ? 'ያሉትን ፍየሎች ይመልከቱ' : 'Browse Available Goats'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onOpenHowLow && (
                <button
                  onClick={onOpenHowLow}
                  className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-slate-950" />
                  <span>{isAmharic ? 'የ70 ብር ጨረታ (How Low)' : '"How Low" 70 ETB Bidding'}</span>
                </button>
              )}

              <button
                onClick={onOpenAdvisor}
                className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{isAmharic ? 'በኤአይ ፍየል ይምረጡ' : 'Consult AI Advisor'}</span>
              </button>

              {onOpenB2BModal && (
                <button
                  onClick={() => onOpenB2BModal('b2b')}
                  className="flex items-center gap-2 px-4 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isAmharic ? 'የጅምላ ትዕዛዝ (B2B)' : 'B2B Wholesale Quotes'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Featured Hero Image & Badge */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-slate-800 group">
              <img
                src="https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=900"
                alt="Dire Farms Enkutatash Goat"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Float Card on Image */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      {isAmharic ? 'የሐረር ፍየል - 38 ኪ.ግ' : 'Harar Fattened Champion'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {isAmharic ? 'ሙሉ የጤና ሰርተፍኬት ያለው' : '38kg Extra Large • Vet Certified'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-300 font-bold block">700 ETB / kg</span>
                  <span className="text-lg font-black text-amber-400">ETB 26,600</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Key Metrics Banner */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">50+</div>
            <p className="text-xs text-slate-400 font-medium">
              {isAmharic ? 'የተደለቡ ፍየሎች' : 'Fattened Goats Ready'}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <p className="text-xs text-slate-400 font-medium">
              {isAmharic ? 'የጤና ምርመራ የተደረገላቸው' : 'Vet Health Certified'}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">48 hrs</div>
            <p className="text-xs text-slate-400 font-medium">
              {isAmharic ? 'የምላሽና የማድረስ ጊዜ' : 'Max Inquiry Response Time'}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-sky-400">ETB 0</div>
            <p className="text-xs text-slate-400 font-medium">
              {isAmharic ? 'የደላላ ክፍያ የለም' : 'Broker Middleman Markup'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
