import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  ShoppingBag, 
  Sparkles,
  X,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { Goat, FilterOptions, Language } from '../types';

interface GoatCatalogueProps {
  goats: Goat[];
  onSelectGoatDetail: (goat: Goat) => void;
  onSelectGoatOrder: (goat: Goat) => void;
  lang: Language;
}

export const GoatCatalogue: React.FC<GoatCatalogueProps> = ({
  goats,
  onSelectGoatDetail,
  onSelectGoatOrder,
  lang
}) => {
  const isAmharic = lang === 'am';

  const [filters, setFilters] = useState<FilterOptions>({
    breed: 'all',
    weightRange: [20, 50],
    priceRange: [14000, 35000],
    healthStatus: 'all',
    sortBy: 'newest',
    searchQuery: ''
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Apply Search, Filters, and Sorting
  const filteredGoats = useMemo(() => {
    return goats
      .filter((g) => {
        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = g.title.toLowerCase().includes(q);
          const matchBreed = g.breed.toLowerCase().includes(q);
          const matchDesc = g.description.toLowerCase().includes(q);
          if (!matchTitle && !matchBreed && !matchDesc) return false;
        }

        // Breed
        if (filters.breed !== 'all' && g.breed !== filters.breed) {
          return false;
        }

        // Health Status
        if (filters.healthStatus !== 'all' && g.health_status !== filters.healthStatus) {
          return false;
        }

        // Weight Range
        if (g.weight_kg < filters.weightRange[0] || g.weight_kg > filters.weightRange[1]) {
          return false;
        }

        // Price Range (calculated based on 700 ETB/kg)
        const effectivePrice = g.weight_kg * 700;
        if (effectivePrice < filters.priceRange[0] || effectivePrice > filters.priceRange[1]) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.weight_kg * 700;
        const priceB = b.weight_kg * 700;
        if (filters.sortBy === 'price_asc') return priceA - priceB;
        if (filters.sortBy === 'price_desc') return priceB - priceA;
        if (filters.sortBy === 'weight_desc') return b.weight_kg - a.weight_kg;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [goats, filters]);

  const resetFilters = () => {
    setFilters({
      breed: 'all',
      weightRange: [20, 50],
      priceRange: [14000, 35000],
      healthStatus: 'all',
      sortBy: 'newest',
      searchQuery: ''
    });
  };

  const hasActiveFilters = 
    filters.breed !== 'all' ||
    filters.healthStatus !== 'all' ||
    filters.searchQuery !== '' ||
    filters.weightRange[0] > 20 ||
    filters.weightRange[1] < 50 ||
    filters.priceRange[0] > 14000 ||
    filters.priceRange[1] < 35000;

  return (
    <section id="catalogue-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Section Heading & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'የእንስሳት ካታሎግ' : 'Dire Farms Inventory'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAmharic ? 'ለበዓል የተዘጋጁ የፍየል ዓይነቶች' : 'Certified Goats Available for Order'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isAmharic 
              ? 'ሁሉም ፍየሎች በዲሬ ዳዋ የእንስሳት እርሻችን በተገቢው መንገድ ተደልበው የቀረቡ ናቸው።' 
              : 'All livestock are fattened in Dire Dawa feedlots with full veterinary documentation.'}
          </p>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder={isAmharic ? 'በዓይነት፣ በክብደት ይፈልጉ...' : 'Search breed, title, weight...'}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Desktop & Collapsible Mobile) */}
      <div className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Breed Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {isAmharic ? 'የፍየል ዝርያ (Breed)' : 'Goat Breed'}
            </label>
            <select
              value={filters.breed}
              onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">{isAmharic ? 'ሁሉም ዝርያዎች (All)' : 'All Breeds'}</option>
              <option value="Harar Goat">Harar Goat (ሐረር)</option>
              <option value="Afar Goat">Afar Goat (አፋር)</option>
              <option value="Somali Goat">Somali Goat (ሶማሌ)</option>
              <option value="Borena Goat">Borena Goat (ቦረና)</option>
              <option value="Cross Breed">Cross Breed (ክሮስ)</option>
            </select>
          </div>

          {/* Health Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {isAmharic ? 'የጤና ሁኔታ (Health)' : 'Health Certification'}
            </label>
            <select
              value={filters.healthStatus}
              onChange={(e) => setFilters({ ...filters, healthStatus: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="all">{isAmharic ? 'ሁሉም የጤና ደረጃዎች' : 'All Health Statuses'}</option>
              <option value="Fattened Premium">Fattened Premium</option>
              <option value="Vaccinated & Healthy">Vaccinated & Healthy</option>
              <option value="Vet Certified">Vet Certified</option>
            </select>
          </div>

          {/* Weight Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {isAmharic ? `ክብደት: ${filters.weightRange[0]}kg - ${filters.weightRange[1]}kg` : `Weight: ${filters.weightRange[0]}kg - ${filters.weightRange[1]}kg`}
            </label>
            <input
              type="range"
              min="20"
              max="50"
              value={filters.weightRange[1]}
              onChange={(e) => setFilters({ ...filters, weightRange: [filters.weightRange[0], Number(e.target.value)] })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Max Price Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {isAmharic ? `ከፍተኛ ዋጋ: ETB ${filters.priceRange[1].toLocaleString()}` : `Max Price: ETB ${filters.priceRange[1].toLocaleString()}`}
            </label>
            <input
              type="range"
              min="14000"
              max="35000"
              step="700"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], Number(e.target.value)] })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              <span>{isAmharic ? 'አደራደር (Sort By)' : 'Sort By'}</span>
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="newest">{isAmharic ? 'አዲስ የቀረቡ' : 'Newest Additions'}</option>
              <option value="price_asc">{isAmharic ? 'ዋጋ: ዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
              <option value="price_desc">{isAmharic ? 'ዋጋ: ከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
              <option value="weight_desc">{isAmharic ? 'ክብደት: ከባድ ወደ ቀላል' : 'Weight: Heaviest First'}</option>
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              {filteredGoats.length} {isAmharic ? 'ፍየሎች ተገኝተዋል' : 'Goats Match Criteria'}
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isAmharic ? 'ማጣሪያ አፅዳ' : 'Reset Filters'}</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            {isAmharic ? 'በቀጥታ ከዲሬ ዳዋ እርሻ የተዘጋጀ' : 'All goats include pre-delivery health certificate check.'}
          </div>
        </div>
      </div>

      {/* Goat Cards Grid */}
      {filteredGoats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            {isAmharic ? 'ምንም ፍየል አልተገኘም' : 'No Goats Found Matching Your Filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isAmharic ? 'እባክዎን ማጣሪያዎቹን ይቀይሩ ወይም ዳግም ያስጀምሩ።' : 'Try broadening your search query, increasing weight range, or resetting filters.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
          >
            {isAmharic ? 'ማጣሪያዎችን አፅዳ' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoats.map((goat) => {
            const primaryImg = goat.images.find((img) => img.isPrimary)?.url || goat.images[0]?.url;

            return (
              <div
                key={goat.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Image Section */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={primaryImg}
                    alt={goat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-extrabold rounded-lg shadow-sm border border-slate-700">
                      {goat.breed}
                    </span>
                    {goat.is_featured && (
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                      <Scale className="w-3 h-3" /> {goat.weight_kg} kg
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-amber-600 transition-colors">
                      {isAmharic && goat.description_am ? goat.description_am : goat.title}
                    </h3>

                    {/* Specifications Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> {goat.age_months} months
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {goat.health_status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {goat.description}
                    </p>
                  </div>

                  {/* Price and Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block">
                          {isAmharic ? 'ቋሚ ተመን (700 ብር/ኪ.ግ)' : 'Fixed 700 ETB / kg'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {goat.weight_kg} kg × 700 ETB
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 block">
                          ETB {(goat.weight_kg * 700).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectGoatDetail(goat)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>{isAmharic ? 'ዝርዝር' : 'Details'}</span>
                      </button>

                      <button
                        onClick={() => onSelectGoatOrder(goat)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isAmharic ? 'እዘዝ' : 'Order Now'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
