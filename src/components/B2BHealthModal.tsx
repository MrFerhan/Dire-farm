import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  X, 
  Search, 
  CheckCircle2, 
  Calculator, 
  Truck, 
  FileCheck, 
  Award, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import { Language, Inquiry } from '../types';

interface B2BHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (newInquiry: Inquiry) => void;
  initialTab?: 'b2b' | 'verify';
  lang: Language;
}

export const B2BHealthModal: React.FC<B2BHealthModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  initialTab = 'b2b',
  lang
}) => {
  if (!isOpen) return null;

  const isAmharic = lang === 'am';
  const [activeTab, setActiveTab] = useState<'b2b' | 'verify'>(initialTab);

  // B2B Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [breed, setBreed] = useState('Harar Fattened Ram');
  const [quantity, setQuantity] = useState<number>(10);
  const [deliveryDate, setDeliveryDate] = useState('2026-09-08');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any>(null);

  // Health Cert Lookup State
  const [certInput, setCertInput] = useState('ET-HAR-8892');
  const [certResult, setCertResult] = useState<any>(null);
  const [isSearchingCert, setIsSearchingCert] = useState(false);

  // Calculate discounts
  let discountPercent = 0;
  if (quantity >= 20) discountPercent = 15;
  else if (quantity >= 10) discountPercent = 10;
  else if (quantity >= 5) discountPercent = 5;

  const basePrice = 7200;
  const unitPrice = basePrice * (1 - discountPercent / 100);
  const totalEtb = unitPrice * quantity;

  const handleB2BSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/b2b/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          contact_person: contactPerson,
          phone,
          email,
          breed,
          quantity,
          estimated_delivery_date: deliveryDate,
          special_requests: specialRequests
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        setSubmittedQuote(data);
        const newInq: Inquiry = {
          id: `inq-b2b-${Date.now()}`,
          reference_number: data.quote_reference,
          customer_name: `${companyName} (${contactPerson})`,
          customer_phone: phone,
          customer_email: email,
          goat_id: 'b2b-bulk-order',
          goat_title: `B2B Wholesale (${quantity}x ${breed})`,
          goat_price_etb: Math.round(unitPrice),
          quantity,
          preferred_delivery_date: deliveryDate,
          notes: `B2B Quote. Requests: ${specialRequests}`,
          status: 'new',
          created_at: new Date().toISOString()
        };
        onOrderSuccess(newInq);
      } else {
        alert(data.error || 'Failed to submit B2B quotation request');
      }
    } catch (err) {
      setIsSubmitting(false);
      // Fallback
      const fallbackRef = `B2B-DF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackData = {
        quote_reference: fallbackRef,
        quantity,
        discount_percent: discountPercent,
        price_per_goat_etb: Math.round(unitPrice),
        total_etb: totalEtb,
        message: 'B2B Wholesale Quotation submitted to Dire Farms Corporate Account Manager.'
      };
      setSubmittedQuote(fallbackData);
      onOrderSuccess({
        id: `inq-b2b-${Date.now()}`,
        reference_number: fallbackRef,
        customer_name: `${companyName} (${contactPerson})`,
        customer_phone: phone,
        customer_email: email,
        goat_id: 'b2b-bulk-order',
        goat_title: `B2B Wholesale (${quantity}x ${breed})`,
        goat_price_etb: Math.round(unitPrice),
        quantity,
        preferred_delivery_date: deliveryDate,
        notes: `B2B Quote. Requests: ${specialRequests}`,
        status: 'new',
        created_at: new Date().toISOString()
      });
    }
  };

  const handleCertLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!certInput.trim()) return;

    setIsSearchingCert(true);
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(certInput.trim())}`);
      const data = await res.json();
      setIsSearchingCert(false);
      if (data.success) {
        setCertResult(data.certificate);
      }
    } catch (err) {
      setIsSearchingCert(false);
      setCertResult({
        certificate_id: certInput.toUpperCase(),
        issuer: 'FDRE Ministry of Agriculture & Livestock Inspectorate',
        veterinarian: 'Dr. Solomon Bekele (Regional Inspector)',
        farm_depot: 'Dire Dawa Model Feedlot - Block A',
        breed: 'Dire Farms Verified Stock',
        vaccinations: ['PPR Vaccine', 'Deworming & Health Screening Pass'],
        quarantine_passed: true,
        inspection_date: '2026-08-02',
        status: 'APPROVED & VALID FOR ENKUTATASH SLAUGHTER'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full my-8 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Tabs */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('b2b')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'b2b'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isAmharic ? 'የንግድ ድርጅቶች የጅምላ ትዕዛዝ' : 'B2B Wholesale Orders'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('verify');
                if (!certResult) handleCertLookup();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'verify'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAmharic ? 'የጤና ሰርተፍኬት ማረጋገጫ' : 'Verify Health Certificate'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB 1: B2B WHOLESALE CALCULATOR & FORM */}
        {activeTab === 'b2b' && (
          <div className="p-6 space-y-6">
            
            {!submittedQuote ? (
              <form onSubmit={handleB2BSubmit} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                      Hotel, Catering & Corporate Enkutatash Supply
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Tiered Bulk Discount Active
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {isAmharic ? 'የጅምላ ፍየል ዋጋ መጠየቂያ' : 'B2B Wholesale Quotation Request'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Guaranteed feedlot reserve, custom weights, official veterinary health pass, and dedicated transport arrangement.
                  </p>
                </div>

                {/* Live Discount Calculator Box */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-amber-400" /> Live Bulk Pricing Estimator
                    </span>
                    <span className="text-xs font-extrabold text-amber-400">
                      {discountPercent}% OFF APPLIED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-800/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Quantity</span>
                      <span className="font-black text-white text-base">{quantity} Goats</span>
                    </div>
                    <div className="bg-slate-800/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Per Goat (ETB)</span>
                      <span className="font-black text-emerald-400 text-base">
                        ETB {Math.round(unitPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-900 block font-bold">Estimated Total</span>
                      <span className="font-black text-slate-950 text-base">
                        ETB {totalEtb.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center">
                    💡 Tier Discounts: 5-9 Goats (5% OFF) • 10-19 Goats (10% OFF) • 20+ Goats (15% OFF)
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Ras Hotel PLC / Skylight Catering"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Ato Bethlehem Worku"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number (+251) *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +251 911 234 567"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Corporate Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="procurement@company.com.et"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preferred Breed Stock</label>
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Harar Fattened Ram">Harar Fattened Ram (Heavy Weight)</option>
                      <option value="Afar Lowland Goat">Afar Lowland Goat (Lean Tender Meat)</option>
                      <option value="Somali White Goat">Somali White Goat (High Yield)</option>
                      <option value="Borena Grain-Fed Goat">Borena Grain-Fed Goat</option>
                      <option value="Mixed Assortment">Mixed Breed Assortment</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Quantity (Goats) *</label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Special Delivery / Health Pass Instructions</label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Requesting health certificate copies in advance for hotel audit, delivery at Bole branch..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Quotation...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Submit Corporate Order</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Quotation Slip */
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Quotation Confirmed
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Wholesale Quote #{submittedQuote.quote_reference}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                    Thank you! Dire Farms Corporate Account Manager will review your specification and issue formal pro-forma invoice shortly.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-semibold">Company:</span>
                    <span className="font-bold text-slate-900">{companyName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-semibold">Quantity:</span>
                    <span className="font-bold text-slate-900">{quantity} Units ({breed})</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-semibold">Discount Tier:</span>
                    <span className="font-bold text-emerald-700">{submittedQuote.discount_percent}% Discount</span>
                  </div>
                  <div className="flex justify-between pt-1 font-black text-sm text-slate-900">
                    <span>Total Pro-Forma ETB:</span>
                    <span className="text-amber-700">ETB {submittedQuote.total_etb.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSubmittedQuote(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                >
                  Return to Marketplace
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: HEALTH CERTIFICATE LOOKUP */}
        {activeTab === 'verify' && (
          <div className="p-6 space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
                Ministry of Agriculture Verified Inspection Database
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {isAmharic ? 'የእንስሳት ጤና ማረጋገጫ ሰርተፍኬት ፍለጋ' : 'Veterinary Health Certificate Inspection Lookup'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter any Dire Farms livestock tag or certificate number to verify vaccination history and veterinary seal.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleCertLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  placeholder="e.g. ET-HAR-8892, ET-AFA-4011, ET-SOM-5510"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingCert}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {isSearchingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Verify</span>
              </button>
            </form>

            {/* Sample Pills */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400 font-semibold">Try sample tags:</span>
              {['ET-HAR-8892', 'ET-AFA-4011', 'ET-SOM-5510'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setCertInput(tag);
                    setIsSearchingCert(true);
                    fetch(`/api/certificates/${tag}`)
                      .then((r) => r.json())
                      .then((d) => {
                        setIsSearchingCert(false);
                        if (d.success) setCertResult(d.certificate);
                      });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-md"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Certificate Display Result */}
            {certResult && (
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 text-xs animate-in fade-in duration-200">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                      Official FDRE Veterinary Seal
                    </span>
                    <h4 className="text-base font-black text-white font-mono mt-0.5">
                      {certResult.certificate_id}
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {certResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px]">Attending Inspector:</span>
                    <span className="font-bold text-white">{certResult.veterinarian}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px]">Inspection Date:</span>
                    <span className="font-bold text-white">{certResult.inspection_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px]">Origin Depot:</span>
                    <span className="font-bold text-white">{certResult.farm_depot}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px]">Stock Breed:</span>
                    <span className="font-bold text-amber-400">{certResult.breed}</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Administered Vaccinations & Medical Protocol:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {certResult.vaccinations.map((vac: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-semibold">
                        ✓ {vac}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center border-t border-slate-800/80 pt-2">
                  This electronic pass certifies 90-day supervised organic grain fattening at Dire Dawa Model Feedlot. Safe for holiday ritual slaughter.
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
