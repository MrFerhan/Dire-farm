import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GoatCatalogue } from './components/GoatCatalogue';
import { GoatDetailModal } from './components/GoatDetailModal';
import { OrderInquiryModal } from './components/OrderInquiryModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AIGoatAdvisor } from './components/AIGoatAdvisor';
import { HowLowAuctionView } from './components/HowLowAuctionView';
import { B2BHealthModal } from './components/B2BHealthModal';
import { AuthModal } from './components/AuthModal';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';

import { Goat, Inquiry, Language, User } from './types';
import { INITIAL_GOATS, INITIAL_INQUIRIES } from './data/initialData';

export default function App() {
  const [currentView, setCurrentView] = useState<'marketplace' | 'advisor' | 'how_low' | 'admin'>('marketplace');
  const [lang, setLang] = useState<Language>('en');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('df_user');
    return saved ? JSON.parse(saved) : {
      id: 'user-cust-1',
      name: 'Ato Bethlehem Tadesse',
      phone: '+251911223344',
      role: 'customer',
      created_at: new Date().toISOString()
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('df_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('df_user');
    }
  }, [currentUser]);

  // Goats Inventory State
  const [goats, setGoats] = useState<Goat[]>(() => {
    const saved = localStorage.getItem('df_goats');
    return saved ? JSON.parse(saved) : INITIAL_GOATS;
  });

  // Customer Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('df_inquiries');
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });

  // Selected Goats for Modals
  const [selectedDetailGoat, setSelectedDetailGoat] = useState<Goat | null>(null);
  const [selectedOrderGoat, setSelectedOrderGoat] = useState<Goat | null>(null);

  // B2B & Health Verification Modal State
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [b2bTab, setB2BTab] = useState<'b2b' | 'verify'>('b2b');

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('df_goats', JSON.stringify(goats));
  }, [goats]);

  useEffect(() => {
    localStorage.setItem('df_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // Fetch initial stock from server API if online
  useEffect(() => {
    fetch('/api/goats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.goats) && data.goats.length > 0) {
          setGoats(data.goats);
        }
      })
      .catch((err) => console.log('Loaded stock from local cache:', err));

    fetch('/api/admin/inquiries')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.inquiries) && data.inquiries.length > 0) {
          setInquiries(data.inquiries);
        }
      })
      .catch((err) => console.log('Loaded inquiries from local cache:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOrderSuccess = (newInquiry: Inquiry) => {
    setInquiries([newInquiry, ...inquiries]);
    showToast(`Order #${newInquiry.reference_number} submitted!`);
  };

  const handleScrollToCatalogue = () => {
    setCurrentView('marketplace');
    setTimeout(() => {
      const elem = document.getElementById('catalogue-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleOpenB2B = (tab: 'b2b' | 'verify' = 'b2b') => {
    setB2BTab(tab);
    setIsB2BModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        lang={lang}
        setLang={setLang}
        inquiryCount={inquiries.filter((i) => i.status === 'new').length}
        onOpenB2BModal={handleOpenB2B}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentView === 'marketplace' && (
          <>
            <HeroSection
              onBrowseCatalogue={handleScrollToCatalogue}
              onOpenAdvisor={() => setCurrentView('advisor')}
              onOpenHowLow={() => setCurrentView('how_low')}
              onOpenB2BModal={handleOpenB2B}
              lang={lang}
            />

            <GoatCatalogue
              goats={goats}
              onSelectGoatDetail={(goat) => setSelectedDetailGoat(goat)}
              onSelectGoatOrder={(goat) => setSelectedOrderGoat(goat)}
              lang={lang}
            />

            <FAQSection
              lang={lang}
              onOpenAdvisor={() => setCurrentView('advisor')}
              onOpenB2BModal={handleOpenB2B}
            />
          </>
        )}

        {currentView === 'how_low' && (
          <HowLowAuctionView
            onShowToast={showToast}
            lang={lang}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'advisor' && (
          <AIGoatAdvisor
            goats={goats}
            onSelectGoatForOrder={(goat) => setSelectedOrderGoat(goat)}
            lang={lang}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            inquiries={inquiries}
            setInquiries={setInquiries}
            goats={goats}
            setGoats={setGoats}
            onShowToast={showToast}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <Footer lang={lang} onOpenB2BModal={handleOpenB2B} />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          showToast(`Welcome back, ${u.name}!`);
        }}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Signed out of account.');
        }}
        lang={lang}
      />

      <GoatDetailModal
        goat={selectedDetailGoat}
        onClose={() => setSelectedDetailGoat(null)}
        onOrderNow={(goat) => setSelectedOrderGoat(goat)}
        lang={lang}
      />

      <OrderInquiryModal
        goat={selectedOrderGoat}
        onClose={() => setSelectedOrderGoat(null)}
        onOrderSuccess={handleOrderSuccess}
        lang={lang}
      />

      <B2BHealthModal
        isOpen={isB2BModalOpen}
        onClose={() => setIsB2BModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        initialTab={b2bTab}
        lang={lang}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl border border-slate-800 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-slate-100">{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
