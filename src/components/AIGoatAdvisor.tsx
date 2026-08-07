import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  Banknote, 
  ChefHat, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  Lightbulb, 
  RotateCcw 
} from 'lucide-react';
import { Language, Goat } from '../types';

interface AIGoatAdvisorProps {
  goats: Goat[];
  onSelectGoatForOrder: (goat: Goat) => void;
  lang: Language;
}

export const AIGoatAdvisor: React.FC<AIGoatAdvisorProps> = ({
  goats,
  onSelectGoatForOrder,
  lang
}) => {
  const isAmharic = lang === 'am';

  const [familySize, setFamilySize] = useState('8-12 people');
  const [budgetEtb, setBudgetEtb] = useState('22000');
  const [eventType, setEventType] = useState('Enkutatash Family Feast');
  const [preferences, setPreferences] = useState('Extra fattened, high dressing percentage for traditional stew & roasted meat.');

  const [isLoading, setIsLoading] = useState(false);
  const [recommendationText, setRecommendationText] = useState<string | null>(null);

  const handleConsultAI = async () => {
    setIsLoading(true);
    setRecommendationText(null);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familySize,
          budgetEtb,
          eventType,
          preferences
        })
      });

      const data = await res.json();
      if (res.ok && data.recommendation) {
        setRecommendationText(data.recommendation);
      } else {
        setRecommendationText('Error generating AI recommendation. Please try again or browse catalogue directly.');
      }
    } catch (err: any) {
      setRecommendationText(`Error connecting to Gemini API: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
              Gemini AI Powered
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isAmharic ? 'የዲሬ ፋርምስ ኤአይ ፍየል መምረጫ ረዳት' : 'Smart Dire Farms Goat Advisor'}
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          {isAmharic
            ? 'ለቤተሰብዎ ብዛትና ለበዓልዎ በጀት የሚመጥነውን ምርጥ ፍየል በኤአይ ረዳታችን እርዳታ ይምረጡ።'
            : 'Unsure which goat breed, weight, or age best fits your Enkutatash feast? Tell Gemini your guest count and budget for an instant recommendation.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Controls */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b pb-3 border-slate-100">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>{isAmharic ? 'የበዓልዎ ፍላጎት' : 'Feast Requirements'}</span>
          </h3>

          {/* Guest Size */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAmharic ? 'የቤተሰብ/የተጋባዦች ብዛት' : 'Family / Guest Count'}</span>
            </label>
            <select
              value={familySize}
              onChange={(e) => setFamilySize(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value="4-6 people">Small Family (4 - 6 people)</option>
              <option value="8-12 people">Medium Household (8 - 12 people)</option>
              <option value="15-25 people">Large Extended Feast (15 - 25 people)</option>
              <option value="50+ people (Hotel/Restaurant)">B2B Banquet (50+ guests)</option>
            </select>
          </div>

          {/* Target Budget in ETB */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAmharic ? 'የተመደበ በጀት (በብር)' : 'Target Budget (ETB)'}</span>
            </label>
            <select
              value={budgetEtb}
              onChange={(e) => setBudgetEtb(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value="18000">ETB 15,000 - 20,000 (~22 - 28 kg @ 700/kg)</option>
              <option value="22000">ETB 20,000 - 25,000 (~29 - 35 kg @ 700/kg)</option>
              <option value="28000">ETB 25,000 - 32,000+ (36 - 45+ kg @ 700/kg)</option>
            </select>
          </div>

          {/* Event Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAmharic ? 'የበዓሉ ዓይነት' : 'Occasion'}</span>
            </label>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g. Enkutatash Family Feast"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isAmharic ? 'ልዩ ምርጫዎች' : 'Preparation Preferences'}
            </label>
            <textarea
              rows={3}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. Prefer tender meat for traditional Ethiopian wot stew..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          {/* Consult Button */}
          <button
            onClick={handleConsultAI}
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Consulting Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAmharic ? 'የኤአይ ምክረ-ሀሳብ አግኝ' : 'Get AI Recommendation'}</span>
              </>
            )}
          </button>
        </div>

        {/* Output View */}
        <div className="lg:col-span-7 space-y-4">
          {!recommendationText && !isLoading && (
            <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3 h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                {isAmharic ? 'የኤአይ ምክረ-ሀሳብ ዝግጁ ነው' : 'Ready to Consult Gemini AI'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {isAmharic
                  ? 'በግራ በኩል ያለውን ቅጽ ሞልተው "የኤአይ ምክረ-ሀሳብ አግኝ" የሚለውን ይጫኑ።'
                  : 'Select your guest count and budget on the left, then click "Get AI Recommendation".'}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 shadow-2xs">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Analyzing Dire Farms Stock with Gemini 3.6...
                </h4>
                <p className="text-xs text-slate-500">
                  Evaluating live weights (kg), dressing percentage, and ETB pricing match...
                </p>
              </div>
            </div>
          )}

          {recommendationText && !isLoading && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {isAmharic ? 'የኤአይ ፍየል መምረጫ ምክር' : 'Gemini AI Recommendation'}
                    </h3>
                    <p className="text-[10px] text-slate-400">Dire Farms Enkutatash Assistant</p>
                  </div>
                </div>

                <button
                  onClick={handleConsultAI}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                  title="Regenerate"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Render Response Text */}
              <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3 font-sans whitespace-pre-wrap text-slate-800">
                {recommendationText}
              </div>

              {/* Quick Order Top Match Action */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-xs block">
                    {isAmharic ? 'ተስማሚ ፍየልዎን ለማዘዝ ዝግጁ ነዎት?' : 'Ready to reserve a matched goat?'}
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {isAmharic ? 'የሐረር ወይም አፋር ፍየሎችን በቀጥታ ይዘዙ' : 'Direct from Dire Dawa feedlots.'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (goats.length > 0) onSelectGoatForOrder(goats[0]);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>{isAmharic ? 'አሁኑኑ እዘዝ' : 'Order Recommended Goat'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
