export type Language = 'en' | 'am';

export type GoatBreed = 'Harar Goat' | 'Afar Goat' | 'Somali Goat' | 'Borena Goat' | 'Cross Breed';

export type HealthStatus = 'Vaccinated & Healthy' | 'Vet Certified' | 'Fattened Premium';

export interface GoatImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface Goat {
  id: string;
  breed: GoatBreed;
  title: string;
  weight_kg: number;
  age_months: number;
  price_etb: number;
  health_status: HealthStatus;
  health_certificate?: string;
  description: string;
  description_am?: string;
  images: GoatImage[];
  is_available: boolean;
  origin: string;
  care_notes: string;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface Inquiry {
  id: string;
  reference_number: string; // e.g. DF-20260911-001
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  goat_id: string;
  goat_title?: string;
  goat_price_etb?: number;
  quantity: number;
  preferred_delivery_date: string;
  notes?: string;
  status: InquiryStatus;
  internal_notes?: string;
  created_at: string;
  responded_at?: string;
  completed_at?: string;
}

export interface FilterOptions {
  breed: string;
  weightRange: [number, number];
  priceRange: [number, number];
  healthStatus: string;
  sortBy: 'price_asc' | 'price_desc' | 'weight_desc' | 'newest';
  searchQuery: string;
}

export interface AdminKPIs {
  totalInquiries: number;
  pendingInquiries: number;
  confirmedOrders: number;
  totalRevenueEtb: number;
  availableGoatsCount: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  national_id?: string; // Ethiopian Fayda Digital ID / FAN
  id_verified: boolean;
  id_verified_at?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface BidPlacement {
  id: string;
  auction_id: string;
  customer_name: string;
  customer_phone: string;
  bid_amount_etb: number;
  payment_method: 'telebirr' | 'cbe_birr' | 'chapa';
  payment_reference: string;
  created_at: string;
  status_hint?: 'lowest_unique' | 'unique_higher' | 'duplicate';
}

export interface NotificationLog {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  event_type: 'bid_placed' | 'order_status_updated' | 'new_order' | 'b2b_quote';
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  subject: string;
  message_body: string;
  delivery_gateway: string; // e.g. "Ethio Telecom SMS Gateway", "WhatsApp Business API", "Dire Farms SMTP Mailer"
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  reference_id: string; // Order ref or Bid ID
  created_at: string;
}

export interface BidAuction {
  id: string;
  goat_id: string;
  goat_title: string;
  goat_image: string;
  goat_breed: string;
  market_price_etb: number;
  entry_fee_etb: number; // 70 ETB
  start_date: string;
  end_date: string; // 15-20 days countdown
  is_active: boolean;
  total_bids_count: number;
  winner_name?: string;
  winner_phone?: string;
  winning_bid_etb?: number;
  ai_reasoning?: string;
  auto_closed_at?: string;
  description?: string;
}
