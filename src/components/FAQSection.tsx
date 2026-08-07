import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Truck, 
  ShieldCheck, 
  Calendar, 
  Award, 
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Language } from '../types';

interface FAQItem {
  id: string;
  category: 'quality' | 'delivery' | 'enkutatash' | 'payment';
  questionEn: string;
  questionAm: string;
  answerEn: string;
  answerAm: string;
  badgeEn?: string;
  badgeAm?: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'quality',
    questionEn: 'How does Dire Farms guarantee livestock health and actual weight?',
    questionAm: 'ዲሬ ፋርምስ የእንስሳቱን ጤንነት እና ትክክለኛ ክብደት እንዴት ያረጋግጣል?',
    answerEn: 'Every goat and sheep at Dire Farms undergoes a minimum 90-day supervised fattening protocol in our Dire Dawa model feedlots. Each animal is tagged with a digital QR code, inspected by Ministry of Agriculture certified veterinarians, and issued a official Health & Vaccination Pass. Live weight is measured on calibrated digital scales prior to dispatch, guaranteed within ±0.5 kg.',
    answerAm: 'በዲሬ ፋርምስ የሚገኙ ፍየሎችና በጎች በሙሉ በዲሬዳዋ ሞዴል እርሻችን ውስጥ ለ90 ቀናት በልዩ እንክብካቤና መኖ የታጎሩ ናቸው። እያንዳንዱ እንስሳ ዲጂታል QR ኮድ የተገጠመለት ሲሆን በግብርና ሚኒስቴር ባለሙያዎች ተመርምሮ የጤና ሰርተፍኬት ይሰጠዋል። ክብደታቸው በዲጂታል ሚዛን ተለክቶ በሙሉ ዋስትና ይላካል።',
    badgeEn: 'Ministry Certified',
    badgeAm: 'የጤና ሰርተፍኬት ያለው'
  },
  {
    id: 'faq-2',
    category: 'quality',
    questionEn: 'What livestock breeds are available for the Enkutatash New Year season?',
    questionAm: 'ለእንቁጣጣሽ በዓል ምን ዓይነት የፍየል እና የበግ ዝርያዎች ይገኛሉ?',
    answerEn: 'We offer premier Ethiopian regional breeds including Harar Highland Bucks (noted for high muscle yield and lean meat), Borana Heavy Breeds (large frame, ideal for B2B/feasting), Afar Drought-Resistant Bucks, and Jimma Blackhead Steatopygous Goats. Detailed breed traits, horn profiles, and body fat ratings are available in our catalogue.',
    answerAm: 'እንደ ሐረር ደጋ ፍየል (ለስጋ ምርትና ለጣዕም የተመረጡ)፣ ቦረና ታላላቅ ፍየሎች (ለትልልቅ ግብዣዎች የሚሆኑ)፣ ዓፋር እና ጅማ ፍየሎችን እናቀርባለን። የእያንዳንዱ ዝርያ ክብደትና መረጃ በካታሎጋችን ውስጥ በዝርዝር ተቀምጧል።',
    badgeEn: '100% Pure Breeds',
    badgeAm: 'የተመረጡ ዝርያዎች'
  },
  {
    id: 'faq-3',
    category: 'delivery',
    questionEn: 'Where does Dire Farms deliver, and how is safe transport handled?',
    questionAm: 'ዲሬ ፋርምስ ወዴት ያደርሳል? የእንስሳቱ ትራንስፖርትስ እንዴት ይከናወናል?',
    answerEn: 'We provide direct doorstep delivery across all 10 subcities of Addis Ababa and Dire Dawa city limits. Transport is carried out using specialized ventilated livestock carriers equipped with hydration troughs and non-slip flooring to ensure maximum comfort and minimal weight stress during transit.',
    answerAm: 'በአዲስ አበባ ባሉ ሁሉም 10 ክፍለ ከተሞች እና በዲሬዳዋ ከተማ ሙሉ አድራሻዎ ድረስ እናደርሳለን። እንስሳቱ ሳይጨናነቁና ሳይጎዱ በልዩ ዝግጅት በተዘጋጁ ትራንስፖርቶች በተጠበቀ ሁኔታ ይጓጓዛሉ።',
    badgeEn: 'Doorstep Delivery',
    badgeAm: 'ቤት ድረስ ማድረስ'
  },
  {
    id: 'faq-4',
    category: 'delivery',
    questionEn: 'Can I pick up my order directly from a local depot instead of home delivery?',
    questionAm: 'በቤት ማድረስ ፈንታ ከዲፖ መውሰድ እችላለሁ?',
    answerEn: 'Yes! Customers can choose free self-pickup at our Addis Ababa Main Depot (Bole Subcity near Cargo Terminal) or the Dire Dawa Model Feedlot Depot. Upon order confirmation, you will receive an SMS/WhatsApp voucher to show at the gate.',
    answerAm: 'አዎ! በአዲስ አበባ ቦሌ ካርጎ አካባቢ ከሚገኘው ዋና ዲፖችን ወይም በዲሬዳዋ ከሚገኘው እርሻችን በነፃ መረከብ ይችላሉ። ትዕዛዝዎን ሲያረጋግጡ የሚላክሎትን የማረጋገጫ መልእክት በማሳየት መረከብ ይችላሉ።',
    badgeEn: 'Depot Pickup Available',
    badgeAm: 'ከዲፖ መረከብ ይቻላል'
  },
  {
    id: 'faq-5',
    category: 'enkutatash',
    questionEn: 'What is the cutoff deadline for Enkutatash 2019 New Year pre-orders?',
    questionAm: 'ለ2019 እንቁጣጣሽ በዓል ቅድመ-ትዕዛዝ ማብቂያ ቀን መቼ ነው?',
    answerEn: 'To guarantee guaranteed delivery on Pagumen 5 (Holiday Eve), all pre-orders must be placed before Pagumen 3. Orders placed after deadline will be subject to express transport availability and live stock stock limits.',
    answerAm: 'ለበዓሉ ዋዜማ (ጳጉሜ 5) በሰዓቱ ማድረስ እንድንችል ቅድመ-ትዕዛዞች እስከ ጳጉሜ 3 ድረስ መያዝ አለባቸው። ከዚያ በኋላ የሚሰጡ ትዕዛዞች እንደቀረው ክምችት ሁኔታ የሚስተናገዱ ይሆናል።',
    badgeEn: 'Enkutatash Deadline',
    badgeAm: 'የእንቁጣጣሽ ቀነ-ገደብ'
  },
  {
    id: 'faq-6',
    category: 'enkutatash',
    questionEn: 'Are there discounts for pre-booking livestock early?',
    questionAm: 'ቅድመ-ትዕዛዝ ቀድሞ ለሚያስይዝ ቅናሽ አለ?',
    answerEn: 'Yes! Pre-booking before Pagumen 1 unlocks an automatic 5% Early Bird discount on all retail livestock, plus complimentary feed rations for 48 hours and free delivery within Addis Ababa ring road.',
    answerAm: 'አዎ! ከጳጉሜ 1 በፊት ቀድመው ሲያዙ የ 5% ቅናሽ የሚያገኙ ሲሆን፣ የ48 ሰዓት ነፃ የመኖ አቅርቦት እና ነፃ የማድረስ አገልግሎት ያገኛሉ።',
    badgeEn: '5% Early Discount',
    badgeAm: '5% የቅድመ-ትዕዛዝ ቅናሽ'
  },
  {
    id: 'faq-7',
    category: 'payment',
    questionEn: 'What payment methods are supported for orders and auction bids?',
    questionAm: 'ለክፍያና ለጨረታ ምን ዓይነት የክፍያ አማራጮች አሉ?',
    answerEn: 'We accept Telebirr SuperApp, CBE Birr, Chapa (Visa/Mastercard and local debit cards), and Direct Bank Wire Transfer to Dire Farms PLC Commercial Bank of Ethiopia account. All orders receive an automated instant receipt via SMS & WhatsApp.',
    answerAm: 'በቴሌብር (Telebirr)፣ በሲቢኢ ብር (CBE Birr)፣ በቻፓ (Chapa) እንዲሁም በንግድ ባንክ ሂሳባችን ቀጥታ ገቢ ማድረግ ይችላሉ። ክፍያው እንደተፈጸመ ወዲያውኑ የደረሰኝ መልእክት በኤስኤምኤስ እና በዋትስአፕ ይላክልዎታል።',
    badgeEn: 'Telebirr & CBE Birr',
    badgeAm: 'ቴሌብርና ሲቢኢ ብር'
  },
  {
    id: 'faq-8',
    category: 'payment',
    questionEn: 'How does the How Low Bidding Auction 70 Birr fee work?',
    questionAm: 'የ70 ብር አነስተኛ ጨረታ ክፍያ እንዴት ይሰራሉ?',
    answerEn: 'The 70 ETB entry fee registers your secret bid in the How Low Unique Bid Auction engine. If your bid is the LOWEST UNIQUE price (no other bidder entered the exact same amount), you win the livestock for that exact bid price (e.g. 3.50 ETB)! The 70 ETB fee is non-refundable and covers administrative verification.',
    answerAm: 'የ70 ብር መግቢያ ክፍያ ሚስጥራዊ ጨረታዎን በስርዓቱ ለማስመዝገብ ያገለግላል። የሰጡት ዋጋ አነስተኛ እና ለብቻው የተሰጠ (Unique) ከሆነ እንስሳውን በሰጡት አነስተኛ ዋጋ (ለምሳሌ በ3.50 ብር) ያሸንፋሉ!',
    badgeEn: '70 ETB Auction Entry',
    badgeAm: 'የ70 ብር ጨረታ መግቢያ'
  },
  {
    id: 'faq-9',
    category: 'payment',
    questionEn: 'How is livestock pricing calculated at Dire Farms?',
    questionAm: 'በዲሬ ፋርምስ የእንስሳት ዋጋ እንዴት ይሰላል?',
    answerEn: 'Dire Farms strictly adheres to a transparent, fixed pricing policy of 700 ETB per kilogram live weight across all goat breeds (Harar, Afar, Somali, Borena, Cross). Total Price = Weight in kg × 700 ETB. No hidden bargaining or variable surcharges.',
    answerAm: 'ዲሬ ፋርምስ በሁሉም የፍየል ዝርያዎች ላይ ግልጽ የሆነ በኪሎ ግራም 700 ብር ቋሚ ተመን ይከተላል። ጠቅላላ ዋጋ = የፍየሉ ክብደት በኪሎ × 700 ብር። ምንም ዓይነት ተጨማሪ ወይም የተደበቀ ክፍያ የለውም።',
    badgeEn: '700 ETB / kg Fixed',
    badgeAm: 'ቋሚ 700 ብር በኪሎ'
  }
];

interface FAQSectionProps {
  lang: Language;
  onOpenAdvisor?: () => void;
  onOpenB2BModal?: (tab?: 'b2b' | 'verify') => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ 
  lang, 
  onOpenAdvisor,
  onOpenB2BModal 
}) => {
  const isAmharic = lang === 'am';
  const [activeCategory, setActiveCategory] = useState<'all' | 'quality' | 'delivery' | 'enkutatash' | 'payment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    if (activeCategory !== 'all' && faq.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = faq.questionEn.toLowerCase().includes(q) || faq.answerEn.toLowerCase().includes(q);
      const matchAm = faq.questionAm.toLowerCase().includes(q) || faq.answerAm.toLowerCase().includes(q);
      return matchEn || matchAm;
    }
    return true;
  });

  const toggleAccordion = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-16 bg-white border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 font-extrabold text-xs">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>{isAmharic ? 'ተደጋግመው የሚጠየቁ ጥያቄዎች' : 'FREQUENTLY ASKED QUESTIONS'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isAmharic 
              ? 'ስለ እንስሳት ጥራት፣ ማድረስና በዓል ትዕዛዝ ማወቅ የሚፈልጉት' 
              : 'Everything You Need to Know About Dire Farms'}
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            {isAmharic
              ? 'ከእርሻ ጥራትና ክብደት ዋስትና እስከ እንቁጣጣሽ በዓል ማድረሻ ሰዓታት ያሉ ጥያቄዎችን እዚህ ያግኙ።'
              : 'Clear answers on veterinary quality standards, doorstep delivery across Addis Ababa & Dire Dawa, and Enkutatash New Year schedules.'}
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          
          {/* Categories Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { key: 'all', labelEn: 'All FAQs', labelAm: 'ሁሉም' },
              { key: 'quality', labelEn: 'Livestock Quality', labelAm: 'የእንስሳት ጥራት' },
              { key: 'delivery', labelEn: 'Delivery & Transport', labelAm: 'ማድረስና ትራንስፖርት' },
              { key: 'enkutatash', labelEn: 'Enkutatash Timelines', labelAm: 'የእንቁጣጣሽ በዓል' },
              { key: 'payment', labelEn: 'Payment & Bids', labelAm: 'ክፍያና ጨረታ' }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {isAmharic ? cat.labelAm : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAmharic ? 'ጥያቄ ይፈልጉ...' : 'Search keywords...'}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

        </div>

        {/* Accordion FAQ Cards List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200/80 p-6">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {isAmharic ? 'ምንም ጥያቄ አልተገኘም።' : 'No matching questions found.'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAmharic ? 'እባክዎን ሌላ ቃል ይፈልጉ ወይም በቀጥታ ይደውሉልን።' : 'Try searching for keywords like "weight", "delivery", or "Telebirr".'}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-amber-50/40 border-amber-300 shadow-sm' 
                      : 'bg-slate-50/60 border-slate-200/90 hover:bg-slate-100/80'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isOpen ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        ?
                      </div>

                      <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                        {isAmharic ? faq.questionAm : faq.questionEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {faq.badgeEn && (
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-950 text-[10px] font-black border border-amber-300/60">
                          {isAmharic ? faq.badgeAm : faq.badgeEn}
                        </span>
                      )}
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-amber-700" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 pt-1 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-amber-200/50 space-y-3">
                      <p className="pl-11">
                        {isAmharic ? faq.answerAm : faq.answerEn}
                      </p>

                      <div className="pl-11 flex items-center gap-4 text-[11px] font-semibold text-amber-900">
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {isAmharic ? 'የተረጋገጠ መረጃ' : 'Dire Farms Verified Guarantee'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Banner CTA */}
        <div className="max-w-4xl mx-auto bg-slate-950 text-slate-100 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 text-xs font-black">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAmharic ? 'ተጨማሪ ጥያቄ አልዎት?' : 'STILL HAVE QUESTIONS?'}</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              {isAmharic ? 'የ AI አማካሪያችንን ይጠይቁ ወይም በስልክ ያግኙን' : 'Talk to Our AI Goat Advisor or Call Hotline'}
            </h3>
            <p className="text-slate-400 text-xs max-w-md">
              {isAmharic 
                ? 'የእኛ AI አማካሪ ለቤተሰብዎ ወይም ለግብዣ የሚሆን ፍየል እንዲመርጡ በሁለት ሰከንድ ውስጥ ይረዳዎታል።'
                : 'Get personalized breed recommendations based on your budget, cooking style, and family size.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenAdvisor && (
              <button
                onClick={onOpenAdvisor}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAmharic ? 'AI አማካሪን ያናግሩ' : 'Ask AI Advisor'}</span>
              </button>
            )}

            {onOpenB2BModal && (
              <button
                onClick={() => onOpenB2BModal('verify')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAmharic ? 'ሰርተፍኬት አረጋግጥ' : 'Verify Health Pass'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
