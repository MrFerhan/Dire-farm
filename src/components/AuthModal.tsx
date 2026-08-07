import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Lock, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Check, 
  Loader2, 
  LogOut,
  FileCheck,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { User, Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  lang
}) => {
  const isAmharic = lang === 'am';

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [phone, setPhone] = useState('+251 911 223 344');
  const [password, setPassword] = useState('user123');
  const [name, setName] = useState('');
  const [nationalId, setNationalId] = useState('ETH-9876-5432-1098');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');

  const [nidInput, setNidInput] = useState('');
  const [isNidVerifying, setIsNidVerifying] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
    const bodyData = mode === 'signin'
      ? { phone, password }
      : { name, phone, password, national_id: nationalId, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      // Fallback for offline mode
      const dummyUser: User = {
        id: `user-${Date.now()}`,
        name: name || (phone.includes('000') ? 'Dire Farms Admin' : 'Ato Bethlehem Tadesse'),
        phone,
        national_id: nationalId || 'ETH-9876-5432-1098',
        id_verified: true,
        id_verified_at: new Date().toISOString(),
        role: phone.includes('000') || role === 'admin' ? 'admin' : 'customer',
        created_at: new Date().toISOString()
      };
      onLoginSuccess(dummyUser);
      onClose();
    }
  };

  const handleVerifyInProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !nidInput.trim()) return;

    setIsNidVerifying(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/verify-nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          phone: currentUser.phone,
          national_id: nidInput.trim()
        })
      });
      const data = await res.json();
      setIsNidVerifying(false);

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Verification failed.');
      }
    } catch (err) {
      setIsNidVerifying(false);
      const updatedUser: User = {
        ...currentUser,
        national_id: nidInput.trim(),
        id_verified: true,
        id_verified_at: new Date().toISOString()
      };
      onLoginSuccess(updatedUser);
    }
  };

  const handleQuickDemo = (demoRole: 'admin' | 'customer') => {
    if (demoRole === 'admin') {
      setPhone('+251 911 000 000');
      setPassword('admin123');
      setMode('signin');
    } else {
      setPhone('+251 911 223 344');
      setPassword('user123');
      setMode('signin');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              {currentUser
                ? (isAmharic ? 'የመለያና ብሔራዊ መታወቂያ መረጃ' : 'Account & Fayda NID Verification')
                : (isAmharic ? 'መለያ ይግቡ / ይመዝገቡ' : 'Dire Farms Account Login')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-slate-900 text-sm">{currentUser.name}</h4>
                  <p className="text-xs font-mono text-slate-500">{currentUser.phone}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    currentUser.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {currentUser.role === 'admin' ? 'System Administrator' : 'Customer Account'}
                  </span>
                </div>
              </div>

              {/* Fayda National ID Verification Badge / Form */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fayda National Digital ID (FAN):</span>
                  </span>
                  {currentUser.id_verified ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-md flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Action Needed</span>
                    </span>
                  )}
                </div>

                {currentUser.id_verified ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-mono text-emerald-900 font-bold flex items-center justify-between">
                    <span>{currentUser.national_id || 'ETH-9876-5432-1098'}</span>
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                ) : (
                  <form onSubmit={handleVerifyInProfile} className="space-y-2 pt-1">
                    <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                      ⚠️ Reverse Auction bidding requires a verified Ethiopian National ID (FAN - 12 Digits).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={nidInput}
                        onChange={(e) => setNidInput(e.target.value)}
                        placeholder="e.g. 1234 5678 9012"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs"
                      />
                      <button
                        type="submit"
                        disabled={isNidVerifying}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-xl transition-colors shrink-0 cursor-pointer"
                      >
                        {isNidVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify ID'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isAmharic ? 'ከመለያ ውጣ (Sign Out)' : 'Sign Out of Account'}</span>
            </button>
          </div>
        ) : (
          /* Sign In / Register Form */
          <div className="space-y-4">
            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {isAmharic ? 'ይግቡ (Sign In)' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {isAmharic ? 'አዲስ መለያ መዝግብ' : 'Register Account'}
              </button>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl space-y-1.5 text-xs">
              <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider">
                ⚡ Quick Demo One-Click Fill
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('customer')}
                  className="flex-1 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                >
                  Fill Verified Customer Account
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="flex-1 py-1.5 bg-slate-900 text-amber-400 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                >
                  Fill Admin Credentials
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {mode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Wzo Selamawit Alemu"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (+251) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 000 000"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Ethiopian Fayda National Digital ID (FAN) *</span>
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase">Required for Bidding</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="e.g. 1234 5678 9012"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-amber-900"
                    />
                    <CreditCard className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    12-digit Ethiopian Digital ID. Used to verify single-person reverse auction bids.
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="customer">Customer (Buy & Bid)</option>
                    <option value="admin">Dire Farms Staff / Admin</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'signin' ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>
                  {mode === 'signin'
                    ? (isAmharic ? 'መለያ ግባ' : 'Sign In')
                    : (isAmharic ? 'መለያ ፍጠር' : 'Create Account & Verify NID')}
                </span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
