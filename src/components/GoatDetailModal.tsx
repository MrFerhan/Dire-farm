import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Scale, 
  Calendar, 
  MapPin, 
  Award, 
  Share2, 
  ShoppingBag, 
  Copy, 
  Check, 
  ShieldCheck, 
  PhoneCall 
} from 'lucide-react';
import { Goat, Language } from '../types';

interface GoatDetailModalProps {
  goat: Goat | null;
  onClose: () => void;
  onOrderNow: (goat: Goat) => void;
  lang: Language;
}

export const GoatDetailModal: React.FC<GoatDetailModalProps> = ({
  goat,
  onClose,
  onOrderNow,
  lang
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!goat) return null;

  const isAmharic = lang === 'am';
  const images = goat.images.length > 0 ? goat.images : [{ url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800', caption: goat.title }];

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this ${goat.title} (${goat.weight_kg}kg, ETB ${goat.price_etb.toLocaleString()}) on Dire Farms PLC!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full my-8 shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Column: Image Gallery */}
        <div className="md:w-1/2 bg-slate-900 p-6 flex flex-col justify-between text-white">
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-800 h-64 sm:h-72 border border-slate-700 shadow-md">
              <img
                src={images[activeImageIndex]?.url}
                alt={goat.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                {images[activeImageIndex]?.caption || goat.title}
              </span>
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-amber-400 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Farm Quality Verification Box */}
          <div className="mt-4 p-3 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div className="text-[11px]">
              <span className="font-bold text-slate-100 block">
                {isAmharic ? 'የእንስሳት ሐኪም ማረጋገጫ' : 'Official Veterinary Pass'}
              </span>
              <span className="text-slate-400">
                {goat.health_certificate || 'Verified Ministry of Agriculture Record'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Actions */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  {goat.breed}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-1">
                  {goat.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Tag */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                  {isAmharic ? 'ቋሚ ተመን: 700 ብር በኪሎ' : 'Fixed Rate: 700 ETB / kg'}
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ETB {(goat.weight_kg * 700).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg block">
                  {goat.weight_kg} kg × 700 Birr
                </span>
              </div>
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Scale className="w-3 h-3 text-amber-600" /> Weight
                </span>
                <span className="font-extrabold text-slate-900">{goat.weight_kg} kg</span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-600" /> Age
                </span>
                <span className="font-extrabold text-slate-900">{goat.age_months} months</span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Health
                </span>
                <span className="font-extrabold text-slate-900">{goat.health_status}</span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-600" /> Location
                </span>
                <span className="font-extrabold text-slate-900">{goat.origin}</span>
              </div>
            </div>

            {/* Care & Feeding Details */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isAmharic ? 'መግለጫና የአመጋገብ ሁኔታ' : 'Feeding & Farm Care Details'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {goat.description}
              </p>
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed italic">
                "{goat.care_notes}"
              </p>
            </div>

            {/* Social Share Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500">Share:</span>
              <button
                onClick={handleShareWhatsApp}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>

          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOrderNow(goat);
              }}
              className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAmharic ? 'ይህን ፍየል እዘዝ (Order This Goat)' : 'Proceed to Order / Inquiry'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
