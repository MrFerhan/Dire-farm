import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  User, 
  Mail, 
  FileText, 
  Loader2, 
  Check, 
  Printer, 
  ShoppingBag, 
  ShieldCheck 
} from 'lucide-react';
import { Goat, Inquiry, Language } from '../types';

interface OrderInquiryModalProps {
  goat: Goat | null;
  onClose: () => void;
  onOrderSuccess: (inquiry: Inquiry) => void;
  lang: Language;
}

export const OrderInquiryModal: React.FC<OrderInquiryModalProps> = ({
  goat,
  onClose,
  onOrderSuccess,
  lang
}) => {
  const isAmharic = lang === 'am';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Default delivery date to 3 days from today
  const defaultDate = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(defaultDate);
  const [notes, setNotes] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<Inquiry | null>(null);

  if (!goat) return null;

  const validatePhone = (p: string) => {
    // Validates Ethiopian phone formats: +251 9..., +251 7..., 09..., 07...
    const clean = p.replace(/[\s-]/g, '');
    return /^(\+251|251|0)?[97]\d{8}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage(isAmharic ? 'እባክዎን ሙሉ ስምዎን ያስገቡ' : 'Please enter your full name (minimum 3 characters)');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage(
        isAmharic
          ? 'እባክዎን ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ምሳሌ: 0911234567 ወይም +251911234567)'
          : 'Please enter a valid Ethiopian phone number (e.g., 0911234567 or +251911234567)'
      );
      return;
    }

    if (!acceptTerms) {
      setErrorMessage(isAmharic ? 'እባክዎን የውል ሁኔታዎችን ይወቁ' : 'Please accept the Dire Farms terms & quality guarantee');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: fullName,
          customer_phone: phone,
          customer_email: email,
          goat_id: goat.id,
          quantity,
          preferred_delivery_date: deliveryDate,
          notes
        })
      });

      const data = await res.json();

      if (res.ok && data.inquiry) {
        setSubmittedInquiry(data.inquiry);
        onOrderSuccess(data.inquiry);
      } else {
        setErrorMessage(data.error || 'Failed to submit order. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unitPrice = goat.weight_kg * 700;
  const totalAmount = unitPrice * quantity;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100">
                {isAmharic ? 'የፍየል ማዘዣ ቅጽ' : 'Dire Farms Order & Inquiry Form'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAmharic ? 'ለእንቁጣጣሽ በዓል ቅድመ-ትዕዛዝ' : 'Enkutatash Holiday Reservation'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Goat Summary Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={goat.images[0]?.url}
              alt={goat.title}
              className="w-12 h-12 rounded-xl object-cover border border-amber-300"
            />
            <div>
              <span className="font-bold text-slate-900 block">{goat.title}</span>
              <span className="text-slate-600 font-medium">
                {goat.breed} • {goat.weight_kg} kg • {goat.health_status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-800 font-extrabold block">700 ETB / kg</span>
            <span className="font-black text-amber-900 text-sm">ETB {unitPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Form or Success View */}
        {submittedInquiry ? (
          /* SUCCESS VIEW */
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-xl">
                {isAmharic ? 'ትዕዛዝዎ በተካኬ ተመዝግቧል!' : 'Order Inquiry Received!'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {isAmharic
                  ? 'የዲሬ ፋርምስ ሽያጭ ክፍል በ24 ሰዓት ውስጥ ደውሎ ስለ አቅርቦትና ክፍያ ያረጋግጥልዎታል።'
                  : 'A Dire Farms customer representative will call your phone within 24 hours to verify delivery schedule and payment.'}
              </p>
            </div>

            {/* Slip Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between items-center border-b pb-2 border-slate-200">
                <span className="text-slate-500 font-bold">REFERENCE CODE:</span>
                <span className="font-black text-amber-700 font-mono text-sm">{submittedInquiry.reference_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{submittedInquiry.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-800">{submittedInquiry.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Delivery Date:</span>
                <span className="font-bold text-slate-800">{submittedInquiry.preferred_delivery_date}</span>
              </div>
              <div className="flex justify-between border-t pt-2 border-slate-200 font-bold">
                <span className="text-slate-700">Total Price:</span>
                <span className="text-slate-900">ETB {((submittedInquiry.goat_price_etb || goat.price_etb) * submittedInquiry.quantity).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{isAmharic ? 'ደረሰኝ አትም' : 'Print Slip'}</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                {isAmharic ? 'ዝጋ' : 'Close Window'}
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isAmharic ? 'ሙሉ ስም *' : 'Full Name *'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isAmharic ? 'ስልክ ቁጥር *' : 'Ethiopian Phone *'}</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911234567 or +251..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAmharic ? 'ኢሜይል (አማራጭ)' : 'Email Address (Optional)'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAmharic ? 'ብዛት (Quantity)' : 'Quantity (Units)'}
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {[1, 2, 3, 4, 5, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Goat' : 'Goats'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preferred Delivery Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isAmharic ? 'የሚፈለግበት ቀን' : 'Preferred Delivery Date'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Total Calculation Display */}
              <div className="p-2.5 bg-slate-900 text-white rounded-xl flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 font-bold">ESTIMATED TOTAL</span>
                <span className="text-lg font-black text-amber-400">
                  ETB {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{isAmharic ? 'የማድረሻ ቦታና ልዩ መመሪያ' : 'Delivery Address & Notes'}</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAmharic ? 'የመኖሪያ አድራሻዎን ወይም ቦታዎን ይፃፉ...' : 'Specify neighborhood, landmark, or Enkutatash delivery instructions...'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms-check"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 accent-amber-500"
              />
              <label htmlFor="terms-check" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
                I agree to Dire Farms PLC livestock sales terms and quality guarantee. Final payment confirmed upon pre-delivery inspection.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-slate-600 hover:bg-slate-100 font-bold rounded-xl"
              >
                {isAmharic ? 'ሰርዝ' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>{isAmharic ? 'ትዕዛዝ አስገባ' : 'Submit Order Inquiry'}</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
