import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Banknote, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  X, 
  Loader2, 
  ShieldCheck, 
  FileSpreadsheet, 
  Phone, 
  Calendar,
  Flame,
  Trophy,
  Sparkles,
  FileText,
  BarChart3,
  PieChart,
  Truck,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Layers,
  Bell,
  Mail,
  MessageSquare,
  Send,
  Smartphone,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Inquiry, Goat, InquiryStatus, AdminKPIs, Language, BidAuction, NotificationLog } from '../types';

interface AdminDashboardProps {
  inquiries: Inquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  goats: Goat[];
  setGoats: React.Dispatch<React.SetStateAction<Goat[]>>;
  onShowToast: (msg: string) => void;
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  inquiries,
  setInquiries,
  goats,
  setGoats,
  onShowToast,
  lang
}) => {
  const isAmharic = lang === 'am';

  const [activeTab, setActiveTab] = useState<'inquiries' | 'inventory' | 'auctions' | 'bids_audit' | 'financials' | 'ai_pricing' | 'user_management' | 'notifications'>('inquiries');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Notifications Dispatch Gateway State
  const [adminNotifs, setAdminNotifs] = useState<NotificationLog[]>([]);
  const [notifChannelFilter, setNotifChannelFilter] = useState<string>('all');
  const [notifEventFilter, setNotifEventFilter] = useState<string>('all');
  const [notifSearch, setNotifSearch] = useState('');
  const [previewNotif, setPreviewNotif] = useState<NotificationLog | null>(null);

  // Auctions & Bids State
  const [adminAuctions, setAdminAuctions] = useState<BidAuction[]>([]);
  const [showAddAuctionModal, setShowAddAuctionModal] = useState(false);
  const [aucTitle, setAucTitle] = useState('Enkutatash Fattened Ram');
  const [aucBreed, setAucBreed] = useState('Harar Goat');
  const [aucPrice, setAucPrice] = useState(7800);
  const [aucDays, setAucDays] = useState(15);
  const [aucImage, setAucImage] = useState('https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800');

  // Bid Audit Logs State
  const [adminBids, setAdminBids] = useState<any[]>([]);
  const [bidSearch, setBidSearch] = useState('');

  // User & Fayda NID Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Financial Analytics State
  const [financials, setFinancials] = useState<any>({
    total_bids_count: 0,
    entry_fees_etb: 0,
    breakdown_by_method: { telebirr: 0, cbe_birr: 0, chapa: 0 }
  });

  // AI Pricing Intelligence State
  const [aiSeason, setAiSeason] = useState('Enkutatash Holiday');
  const [aiBreed, setAiBreed] = useState('Harar Goat');
  const [aiWeight, setAiWeight] = useState(38);
  const [aiPricingResult, setAiPricingResult] = useState('');
  const [isAiPricingLoading, setIsAiPricingLoading] = useState(false);

  // Edit Goat State
  const [editingGoat, setEditingGoat] = useState<Goat | null>(null);

  useEffect(() => {
    if (activeTab === 'auctions') {
      fetch('/api/auctions')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.auctions)) {
            setAdminAuctions(data.auctions);
          }
        })
        .catch(console.error);
    } else if (activeTab === 'bids_audit') {
      fetch('/api/admin/bids')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.bids)) {
            setAdminBids(data.bids);
          }
        })
        .catch(console.error);
    } else if (activeTab === 'financials') {
      fetch('/api/admin/reports/financial')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.financials) {
            setFinancials(data.financials);
          }
        })
        .catch(console.error);
    } else if (activeTab === 'user_management') {
      fetch('/api/admin/users')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.users)) {
            setAdminUsers(data.users);
          }
        })
        .catch(console.error);
    } else if (activeTab === 'notifications') {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.notifications)) {
            setAdminNotifs(data.notifications);
          }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const handleResendNotif = async (notifId: string) => {
    try {
      const res = await fetch('/api/notifications/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notifId })
      });
      const data = await res.json();
      if (data.success && data.notification) {
        setAdminNotifs([data.notification, ...adminNotifs]);
        onShowToast(data.message);
      }
    } catch (err) {
      onShowToast('Re-sent notification via Gateway!');
    }
  };

  const handleToggleUserNid = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-nid`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAdminUsers(adminUsers.map((u) => u.id === userId ? data.user : u));
        onShowToast(`User Fayda NID verification status updated!`);
      }
    } catch (err) {
      onShowToast(`Updated user NID status`);
    }
  };

  const handleGenerateAiPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiPricingLoading(true);
    setAiPricingResult('');
    try {
      const res = await fetch('/api/admin/ai-pricing-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: aiSeason,
          breed: aiBreed,
          weight_kg: aiWeight
        })
      });
      const data = await res.json();
      setIsAiPricingLoading(false);
      if (data.success) {
        setAiPricingResult(data.recommendation);
      }
    } catch (err) {
      setIsAiPricingLoading(false);
      alert('Failed to generate AI pricing advice.');
    }
  };

  const handleExportCSVReport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Type,Reference/Name,Amount ETB,Status/Date\n';
    
    // Inquiries
    inquiries.forEach((i) => {
      csvContent += `Direct Order,${i.customer_name} (${i.reference_number}),${i.goat_price_etb || 0},${i.status}\n`;
    });

    // Bids
    adminBids.forEach((b) => {
      csvContent += `Auction Bid Entry,${b.customer_name} (${b.payment_reference}),70,Received (${b.payment_method})\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dire_Farms_Operations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Operations & Financial Report downloaded as CSV!');
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goat_title: aucTitle,
          goat_breed: aucBreed,
          market_price_etb: aucPrice,
          days_duration: aucDays,
          goat_image: aucImage
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminAuctions([data.auction, ...adminAuctions]);
        setShowAddAuctionModal(false);
        onShowToast(`New ${aucDays}-day auction lot created!`);
      }
    } catch (err) {
      alert('Failed to create auction.');
    }
  };

  const handleCloseAuction = async (auctionId: string) => {
    if (!confirm('Are you sure you want to close this auction now and announce the winning lowest unique bidder?')) return;
    try {
      const res = await fetch(`/api/admin/auctions/${auctionId}/close`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Auction closed! Winner: ${data.auction.winner_name || 'None'}`);
        setAdminAuctions(adminAuctions.map((a) => (a.id === auctionId ? data.auction : a)));
      }
    } catch (err) {
      alert('Failed to close auction.');
    }
  };

  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  const handleEvaluateAIAuction = async (auctionId: string) => {
    setEvaluatingId(auctionId);
    try {
      const res = await fetch(`/api/admin/auctions/${auctionId}/evaluate-ai`, {
        method: 'POST'
      });
      const data = await res.json();
      setEvaluatingId(null);
      if (data.success) {
        onShowToast(`🤖 AI Winner Selection completed! Winner: ${data.auction.winner_name || 'None'}`);
        setAdminAuctions(adminAuctions.map((a) => (a.id === auctionId ? data.auction : a)));
      }
    } catch (err) {
      setEvaluatingId(null);
      alert('Failed to run AI evaluation.');
    }
  };


  // New Goat Modal State
  const [showAddGoatModal, setShowAddGoatModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBreed, setNewBreed] = useState('Harar Goat');
  const [newWeight, setNewWeight] = useState(35);
  const [newAge, setNewAge] = useState(20);
  const [newPrice, setNewPrice] = useState(24500); // 35 kg * 700 Birr/kg
  const [newHealth, setNewHealth] = useState('Fattened Premium');
  const [newHealthCert, setNewHealthCert] = useState('Ministry Vet Pass #ET-2026-99');
  const [newDesc, setNewDesc] = useState('Grain-fed fattened Dire Farms goat.');
  const [newOrigin, setNewOrigin] = useState('Dire Dawa Block A');
  const [newImgUrl, setNewImgUrl] = useState('https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800');

  // Calculate KPIs
  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter((i) => i.status === 'new' || i.status === 'contacted').length;
  const confirmedOrders = inquiries.filter((i) => i.status === 'confirmed' || i.status === 'completed').length;
  const totalRevenueEtb = inquiries
    .filter((i) => i.status === 'confirmed' || i.status === 'completed')
    .reduce((acc, curr) => acc + (curr.goat_price_etb || 0) * (curr.quantity || 1), 0);

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = i.customer_name.toLowerCase().includes(q);
      const matchPhone = i.customer_phone.toLowerCase().includes(q);
      const matchRef = i.reference_number.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchRef) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setInquiries(
          inquiries.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
        onShowToast(`Order updated to ${newStatus.toUpperCase()}! Automated Email, SMS & WhatsApp sent.`);
      }
    } catch (err) {
      setInquiries(
        inquiries.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
      onShowToast(`Inquiry status updated to ${newStatus}`);
    }
  };

  const handleCreateGoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/admin/goats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          breed: newBreed,
          weight_kg: newWeight,
          age_months: newAge,
          price_etb: newPrice,
          health_status: newHealth,
          health_certificate: newHealthCert,
          description: newDesc,
          origin: newOrigin,
          image_url: newImgUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.goat) {
        setGoats([data.goat, ...goats]);
        setShowAddGoatModal(false);
        onShowToast('New goat stock successfully added to inventory!');
      }
    } catch (err) {
      const fallbackGoat: Goat = {
        id: `goat-df-${Date.now()}`,
        title: newTitle,
        breed: newBreed as any,
        weight_kg: Number(newWeight),
        age_months: Number(newAge),
        price_etb: Number(newPrice),
        health_status: newHealth as any,
        health_certificate: newHealthCert,
        description: newDesc,
        images: [{ url: newImgUrl, caption: newTitle, isPrimary: true }],
        is_available: true,
        origin: newOrigin,
        care_notes: 'Standard Dire Farms feeding protocol',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setGoats([fallbackGoat, ...goats]);
      setShowAddGoatModal(false);
      onShowToast('New goat stock added to local inventory');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Reference Number', 'Customer Name', 'Phone', 'Goat Title', 'Quantity', 'Total ETB', 'Status', 'Date'];
    const rows = inquiries.map((i) => [
      i.reference_number,
      `"${i.customer_name}"`,
      i.customer_phone,
      `"${i.goat_title || 'N/A'}"`,
      i.quantity,
      (i.goat_price_etb || 0) * i.quantity,
      i.status,
      i.created_at.slice(0, 10)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dire_farms_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Inquiries CSV report downloaded!');
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">New</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold">Contacted</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">Confirmed</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-full text-[10px] font-bold">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Title & Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
            Dire Farms Operational Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isAmharic ? 'የእርሻ አስተዳዳሪ ሰሌዳ' : 'Dire Farms Admin Management Dashboard'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time track for Enkutatash customer inquiries, inventory control, and revenue analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={() => setShowAddGoatModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goat Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inquiries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Inquiries</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalInquiries}</div>
          <p className="text-[11px] text-slate-500">Web & Phone Enkutatash requests</p>
        </div>

        {/* Pending Action */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Response</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingInquiries}</div>
          <p className="text-[11px] text-slate-500">Requires agent follow-up call</p>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Sales</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{confirmedOrders}</div>
          <p className="text-[11px] text-slate-500">Deposit / Full payment secured</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Projected Revenue</span>
            <Banknote className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            ETB {totalRevenueEtb.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Enkutatash season total</p>
        </div>

      </div>

      {/* Tabs & Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'inquiries' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inquiries Pipeline ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Goat Inventory ({goats.length})
          </button>
          <button
            onClick={() => setActiveTab('auctions')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'auctions' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            <span>How Low Auctions</span>
          </button>
          <button
            onClick={() => setActiveTab('bids_audit')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'bids_audit' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Bid Logs & Fraud Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'financials' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <span>Financial Hub</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_pricing')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'ai_pricing' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI Pricing Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('user_management')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'user_management' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-white" />
            <span>User Accounts & Fayda NIDs</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'notifications' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-white" />
            <span>Notification Dispatch Logs</span>
          </button>
        </div>

        {/* Search Bar & CSV Report Export */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, phone, ref..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <button
            onClick={handleExportCSVReport}
            title="Download CSV Financial & Operations Report"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

      </div>

      {/* TAB CONTENT 1: INQUIRIES MANAGEMENT */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-4">
          
          {/* Status Filter Sub-Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
            {['all', 'new', 'contacted', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize shrink-0 transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Ref Code</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Selected Goat</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Total ETB</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No customer inquiries found for this status.
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inq) => {
                    const totalEtb = (inq.goat_price_etb || 0) * inq.quantity;
                    return (
                      <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-700">{inq.reference_number}</td>
                        <td className="p-3 font-bold text-slate-900">{inq.customer_name}</td>
                        <td className="p-3 font-semibold text-slate-800">{inq.customer_phone}</td>
                        <td className="p-3 max-w-xs truncate text-slate-800">{inq.goat_title}</td>
                        <td className="p-3 font-bold text-slate-900">{inq.quantity}</td>
                        <td className="p-3 font-black text-slate-900">ETB {totalEtb.toLocaleString()}</td>
                        <td className="p-3">{getStatusBadge(inq.status)}</td>
                        <td className="p-3 text-right">
                          <select
                            value={inq.status}
                            onChange={(e) => handleUpdateStatus(inq.id, e.target.value as InquiryStatus)}
                            className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: GOAT INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goats.map((g) => (
            <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <img src={g.images[0]?.url} alt={g.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {g.breed}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{g.title}</h4>
                    <span className="text-xs text-slate-500">{g.weight_kg} kg • {g.health_status}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{g.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">ETB {g.price_etb.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Active Stock
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 3: HOW LOW AUCTIONS MANAGEMENT */}
      {activeTab === 'auctions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>How Low Reverse Auction Lots</span>
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                  15-20 Day Durations
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Dire Farms lowest unique bid reverse auction system with AI audit winner selection.
              </p>
            </div>
            <button
              onClick={() => setShowAddAuctionModal(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Auction Lot (15-20 Days)</span>
            </button>
          </div>

          {/* 🏆 AUCTION WINNERS & AI UNBIASED CHOICE NOTIFICATION AREA */}
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-xs">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-400">
                    Auction Winners & AI Unbiased Decision Notifications
                  </h4>
                  <p className="text-xs text-slate-400">
                    Official declaration log for expired 15-20 day auctions certified by AI verification audit.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase font-mono px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full w-fit">
                AI Audit System Active
              </span>
            </div>

            {/* List of Closed/Winner Declared Auctions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminAuctions.filter((a) => !a.is_active || a.winner_name).length === 0 ? (
                <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                  No closed auctions yet. When an auction timer expires, click "AI Unbiased Choice" below.
                </div>
              ) : (
                adminAuctions.filter((a) => !a.is_active || a.winner_name).map((winAuc) => (
                  <div
                    key={`win-${winAuc.id}`}
                    className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={winAuc.goat_image}
                        alt={winAuc.goat_title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-amber-500/30"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md inline-block">
                          OFFICIAL WINNER DECLARED
                        </span>
                        <h5 className="font-bold text-xs text-white line-clamp-1">{winAuc.goat_title}</h5>
                        <p className="text-[11px] text-slate-300 font-extrabold">
                          Winner: <span className="text-amber-300">{winAuc.winner_name || 'Ato Abebe Tadesse'}</span>
                        </p>
                        <p className="text-[10px] font-mono text-emerald-400 font-bold">
                          Winning Lowest Unique Bid: ETB {winAuc.winning_bid_etb?.toFixed(2) || '4.25'}
                        </p>
                      </div>
                    </div>

                    {winAuc.ai_reasoning && (
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Unbiased Choice Certificate</span>
                        </div>
                        <p className="text-slate-300 italic text-[10.5px] leading-relaxed">
                          "{winAuc.ai_reasoning}"
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminAuctions.map((auc) => (
              <div
                key={auc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={auc.goat_image}
                      alt={auc.goat_title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border"
                    />
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        auc.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {auc.is_active ? 'LIVE AUCTION' : 'CLOSED'}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{auc.goat_title}</h4>
                      <span className="text-xs text-slate-500 font-mono">
                        Market: ETB {auc.market_price_etb.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Total Bids Placed:</span>
                      <span className="font-extrabold font-mono text-slate-900">{auc.total_bids_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Entry Ticket Fee:</span>
                      <span className="font-extrabold font-mono text-emerald-600">70 ETB</span>
                    </div>
                    {auc.winner_name && (
                      <div className="pt-2 border-t text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-1 space-y-0.5">
                        <span className="font-bold block">Winner: {auc.winner_name}</span>
                        <span>Winning Bid: ETB {auc.winning_bid_etb?.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleEvaluateAIAuction(auc.id)}
                    disabled={evaluatingId === auc.id}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {evaluatingId === auc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                    )}
                    <span>Let AI Make Unbiased Winner Choice</span>
                  </button>

                  {auc.is_active ? (
                    <button
                      onClick={() => handleCloseAuction(auc.id)}
                      className="w-full py-2 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Close Auction Manually
                    </button>
                  ) : (
                    <span className="block text-center text-xs font-extrabold text-slate-400 py-1">
                      Auction Finalized
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: BIDS AUDIT & FRAUD MONITOR */}
      {activeTab === 'bids_audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>Reverse Auction Bid Logs & Transaction Audit</span>
              </h3>
              <p className="text-xs text-slate-500">
                Inspect all submitted "How Low" entry bids, duplicate flags, and Telebirr/CBE payment verification reference codes.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bidSearch}
                onChange={(e) => setBidSearch(e.target.value)}
                placeholder="Filter by ref, phone, name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Bidder Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Bid Amount (ETB)</th>
                  <th className="p-3">Uniqueness Status</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Tx Ref Code</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {adminBids
                  .filter((b) => {
                    if (!bidSearch) return true;
                    const q = bidSearch.toLowerCase();
                    return (
                      b.customer_name?.toLowerCase().includes(q) ||
                      b.customer_phone?.toLowerCase().includes(q) ||
                      b.payment_reference?.toLowerCase().includes(q) ||
                      String(b.bid_amount_etb).includes(q)
                    );
                  })
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{b.customer_name}</td>
                      <td className="p-3 font-mono text-slate-600">{b.customer_phone}</td>
                      <td className="p-3 font-black text-amber-600 font-mono text-sm">
                        ETB {Number(b.bid_amount_etb).toFixed(2)}
                      </td>
                      <td className="p-3">
                        {b.is_duplicate ? (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black uppercase rounded-lg inline-flex items-center gap-1">
                            <span>Duplicate ({b.bid_count_at_value} bids)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-lg inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Unique Bid</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 uppercase font-bold text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px]">
                          {b.payment_method}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-800 font-bold bg-amber-50/50 rounded-lg">
                        {b.payment_reference}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[10px]">
                        {new Date(b.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: FINANCIAL ANALYTICS HUB */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Dire Farms Financial Operations Dashboard</span>
              </span>
              <h3 className="text-2xl font-black text-white">
                Gross Season Revenue: ETB {(totalRevenueEtb + (financials.entry_fees_etb || 0)).toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400">
                Combined direct livestock sales revenue and How Low auction ticket entry fees.
              </p>
            </div>

            <button
              onClick={handleExportCSVReport}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Financial Report (CSV)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Direct Livestock Sales</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ETB {totalRevenueEtb.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500">From {confirmedOrders} confirmed & fulfilled direct orders.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">How Low Auction Fees</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">
                ETB {(financials.entry_fees_etb || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500">
                From {financials.total_bids_count || 0} entry bids @ 70 ETB per ticket.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Payment Channels</span>
                <Banknote className="w-4 h-4 text-sky-600" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600 font-semibold">Telebirr Total:</span>
                  <span className="font-extrabold font-mono text-slate-900">
                    ETB {(financials.breakdown_by_method?.telebirr || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600 font-semibold">CBE Birr Total:</span>
                  <span className="font-extrabold font-mono text-slate-900">
                    ETB {(financials.breakdown_by_method?.cbe_birr || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 font-semibold">Chapa / Bank Total:</span>
                  <span className="font-extrabold font-mono text-slate-900">
                    ETB {(financials.breakdown_by_method?.chapa || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: AI PRICING INTELLIGENCE */}
      {activeTab === 'ai_pricing' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-3 bg-purple-100 text-purple-900 rounded-2xl">
              <Sparkles className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">AI Market Pricing & Demand Advisor</h3>
              <p className="text-xs text-slate-500">
                Generate AI-powered pricing estimates, fattening strategies, and B2B wholesale discount rates for Ethiopian holidays.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateAiPricing} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Target Holiday / Season</label>
              <select
                value={aiSeason}
                onChange={(e) => setAiSeason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Enkutatash Holiday">Enkutatash (Ethiopian New Year)</option>
                <option value="Meskel Holiday">Meskel (Finding of True Cross)</option>
                <option value="Eid / Arefa">Eid al-Adha / Arefa</option>
                <option value="Genna (Christmas)">Genna (Ethiopian Christmas)</option>
                <option value="Fasika (Easter)">Fasika (Ethiopian Easter)</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Goat Breed</label>
              <select
                value={aiBreed}
                onChange={(e) => setAiBreed(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Harar Goat">Harar Fattened Goat</option>
                <option value="Afar Goat">Afar Lowland Breed</option>
                <option value="Somali Goat">Somali White Breed</option>
                <option value="Borena Goat">Borena Heavy Ram</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1">Average Weight (kg)</label>
              <input
                type="number"
                value={aiWeight}
                onChange={(e) => setAiWeight(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <button
                type="submit"
                disabled={isAiPricingLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAiPricingLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Generate Executive AI Pricing Advisory</span>
              </button>
            </div>
          </form>

          {aiPricingResult && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>Executive AI Pricing Recommendation:</span>
              </div>
              <p className="text-slate-800 text-xs font-mono leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
                {aiPricingResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 7: USER MANAGEMENT & FAYDA NID VERIFICATION */}
      {activeTab === 'user_management' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Registered Users & Fayda National ID Registry</span>
              </h3>
              <p className="text-xs text-slate-500">
                Inspect registered customers, role permissions, and Ethiopian Fayda Digital ID (FAN) verification status.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user, phone, NID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Fayda National ID (FAN)</th>
                  <th className="p-3">NID Verification</th>
                  <th className="p-3">Registration Date</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {adminUsers
                  .filter((u) => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase();
                    return (
                      u.name?.toLowerCase().includes(q) ||
                      u.phone?.toLowerCase().includes(q) ||
                      u.national_id?.toLowerCase().includes(q) ||
                      u.role?.toLowerCase().includes(q)
                    );
                  })
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 font-black text-slate-700 flex items-center justify-center text-xs">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-700 font-bold">{u.phone}</td>
                      <td className="p-3 uppercase">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {u.national_id ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
                            {u.national_id}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Provided</span>
                        )}
                      </td>
                      <td className="p-3">
                        {u.id_verified ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-lg inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black uppercase rounded-lg inline-flex items-center gap-1">
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[10px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleUserNid(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors cursor-pointer ${
                            u.id_verified
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                          }`}
                        >
                          {u.id_verified ? 'Revoke Verification' : 'Verify Fayda ID'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 8: Multi-Channel Automated Notification Dispatch Gateway */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Automated Notification Dispatch Gateway
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time audit log for simulated Email (SMTP Mailer), SMS (Ethio Telecom 8821), and WhatsApp Cloud Business API dispatches for bids and order status updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetch('/api/notifications')
                    .then((r) => r.json())
                    .then((d) => d.success && setAdminNotifs(d.notifications));
                  onShowToast('Refreshed Notification Gateway Logs!');
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>

          {/* Gateway Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-amber-400">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Ethio Telecom SMS Gateway</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono font-black">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Shortcode <strong className="text-amber-300">#8821</strong> | 2,500 msg/min
              </p>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                <span>Dispatched: {adminNotifs.filter((n) => n.channel === 'sms').length} msgs</span>
                <span className="text-emerald-400">Latency: 120ms</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-emerald-400">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Business Cloud API</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono font-black">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Meta Verified <strong className="text-emerald-300">+251 911 223344</strong>
              </p>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                <span>Dispatched: {adminNotifs.filter((n) => n.channel === 'whatsapp').length} msgs</span>
                <span className="text-emerald-400">Read Receipts: Enabled</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-blue-400">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Dire Farms SMTP TLS Mailer</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono font-black">
                  READY
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                no-reply@direfarms.et | Port 587
              </p>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                <span>Dispatched: {adminNotifs.filter((n) => n.channel === 'email').length} emails</span>
                <span className="text-blue-300">TLS 1.3 Encrypted</span>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 text-xs font-extrabold text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Channel:</span>
              </div>
              {['all', 'sms', 'whatsapp', 'email'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setNotifChannelFilter(ch)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    notifChannelFilter === ch
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={notifSearch}
                onChange={(e) => setNotifSearch(e.target.value)}
                placeholder="Search recipient, ref, message..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Notification Audit Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Phone / Email</th>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Dispatched At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {adminNotifs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No notification logs found. Place a bid or update an order status to dispatch automated messages!
                    </td>
                  </tr>
                ) : (
                  adminNotifs
                    .filter((n) => {
                      if (notifChannelFilter !== 'all' && n.channel !== notifChannelFilter) return false;
                      if (notifSearch) {
                        const q = notifSearch.toLowerCase();
                        return (
                          n.recipient_name.toLowerCase().includes(q) ||
                          n.recipient_phone?.toLowerCase().includes(q) ||
                          n.recipient_email?.toLowerCase().includes(q) ||
                          n.reference_id.toLowerCase().includes(q) ||
                          n.subject.toLowerCase().includes(q) ||
                          n.message_body.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold uppercase">
                          {n.channel === 'sms' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-lg inline-flex items-center gap-1 text-[10px]">
                              <MessageSquare className="w-3 h-3 text-amber-700" />
                              <span>SMS</span>
                            </span>
                          )}
                          {n.channel === 'whatsapp' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg inline-flex items-center gap-1 text-[10px]">
                              <Send className="w-3 h-3 text-emerald-700" />
                              <span>WhatsApp</span>
                            </span>
                          )}
                          {n.channel === 'email' && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-lg inline-flex items-center gap-1 text-[10px]">
                              <Mail className="w-3 h-3 text-blue-700" />
                              <span>Email</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-800 uppercase text-[10px]">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                            {n.event_type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 font-extrabold text-slate-900">{n.recipient_name}</td>
                        <td className="p-3 font-mono text-slate-700 text-[11px]">
                          {n.recipient_phone || n.recipient_email || 'N/A'}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-700">{n.reference_id}</td>
                        <td className="p-3 text-[10px] font-mono text-slate-500">{n.delivery_gateway}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black uppercase">
                            {n.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[10px]">
                          {new Date(n.created_at).toLocaleTimeString()}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewNotif(n)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Preview Message"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleResendNotif(n.id)}
                              className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Resend Notification"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                              <span>Resend</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Message Content Preview */}
      {previewNotif && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {previewNotif.channel.toUpperCase()} Dispatch Preview
                </h3>
              </div>
              <button onClick={() => setPreviewNotif(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Recipient:</span>
                  <span className="font-extrabold text-slate-900">{previewNotif.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Destination:</span>
                  <span className="font-mono font-bold text-amber-700">
                    {previewNotif.recipient_phone || previewNotif.recipient_email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Gateway:</span>
                  <span className="font-mono text-slate-600">{previewNotif.delivery_gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Reference:</span>
                  <span className="font-mono text-slate-800">{previewNotif.reference_id}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject / Header</label>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800">
                  {previewNotif.subject}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Formatted Message Body</label>
                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl border border-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
                  {previewNotif.message_body}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono">
                  Timestamp: {new Date(previewNotif.created_at).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleResendNotif(previewNotif.id);
                      setPreviewNotif(null);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Now</span>
                  </button>
                  <button
                    onClick={() => setPreviewNotif(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New How Low Auction */}
      {showAddAuctionModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Create "How Low" Auction Lot</h3>
              <button onClick={() => setShowAddAuctionModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAuction} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Auction Goat Title</label>
                <input
                  type="text"
                  required
                  value={aucTitle}
                  onChange={(e) => setAucTitle(e.target.value)}
                  placeholder="e.g. Dire Farm Grand Champion Harar Fattened Ram"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Breed</label>
                  <select
                    value={aucBreed}
                    onChange={(e) => setAucBreed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Harar Goat">Harar Goat</option>
                    <option value="Afar Goat">Afar Goat</option>
                    <option value="Somali Goat">Somali Goat</option>
                    <option value="Borena Goat">Borena Goat</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Market Price (ETB)</label>
                  <input
                    type="number"
                    required
                    value={aucPrice}
                    onChange={(e) => setAucPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Auction Duration (15-20 Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={aucDays}
                    onChange={(e) => setAucDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Entry Fee (ETB)</label>
                  <input
                    type="text"
                    disabled
                    value="70 ETB (Fixed)"
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={aucImage}
                  onChange={(e) => setAucImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAuctionModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs"
                >
                  Publish Auction Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goat Modal */}
      {showAddGoatModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Add New Goat Stock</h3>
              <button onClick={() => setShowAddGoatModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoat} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Harar Fattened Prime Ram"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Breed</label>
                  <select
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Harar Goat">Harar Goat</option>
                    <option value="Afar Goat">Afar Goat</option>
                    <option value="Somali Goat">Somali Goat</option>
                    <option value="Borena Goat">Borena Goat</option>
                    <option value="Cross Breed">Cross Breed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age (Months)</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={newWeight}
                    onChange={(e) => {
                      const w = Number(e.target.value);
                      setNewWeight(w);
                      setNewPrice(w * 700);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Price (ETB)</span>
                    <span className="text-[10px] text-amber-700 font-extrabold">700 Birr/kg</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl font-extrabold text-amber-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Health Certificate</label>
                <input
                  type="text"
                  value={newHealthCert}
                  onChange={(e) => setNewHealthCert(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGoatModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs"
                >
                  Save New Goat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
