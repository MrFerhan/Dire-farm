import { Goat, Inquiry } from '../types';

export const INITIAL_GOATS: Goat[] = [
  {
    id: 'goat-df-101',
    title: 'Harar Fattened Champion Goat - Extra Large',
    breed: 'Harar Goat',
    weight_kg: 38,
    age_months: 22,
    price_etb: 26600, // 38 kg * 700 Birr/kg
    health_status: 'Fattened Premium',
    health_certificate: 'Ministry of Agriculture Vet Cert #ET-HAR-8892',
    description: 'Specially grain-fed Harar highland goat. Outstanding muscle mass and premium fat layering for ceremonial Enkutatash holiday feasts.',
    description_am: 'ለእንቁጣጣሽ በዓል የተዘጋጀ ወፍራም የሐረር ፍየል። የጤና ምስክር ወረቀት ያለው፣ ከፍተኛ ሥጋ ያለው።',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
        caption: 'Front profile of Harar Champion',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?auto=format&fit=crop&q=80&w=800',
        caption: 'Farm grazing in Dire Dawa pasture'
      }
    ],
    is_available: true,
    is_featured: true,
    origin: 'Dire Dawa Model Farm - Block A',
    care_notes: 'Vaccinated against PPR and CPPP. Fed organic maize, sesame cake, and natural highland pasture.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'goat-df-102',
    title: 'Afar Purebred Ceremonial Ram Goat',
    breed: 'Afar Goat',
    weight_kg: 32,
    age_months: 18,
    price_etb: 22400, // 32 kg * 700 Birr/kg
    health_status: 'Vaccinated & Healthy',
    health_certificate: 'Afar Regional Livestock Health Pass #AF-2026-104',
    description: 'Hardy Afar breed known for tender, flavorful meat. Perfectly fattened over 90 days with supervised nutritional intake.',
    description_am: 'ጥራት ያለው የአፋር ፍየል፣ የተመጣጠነ ምግብ ያገኘና ሙሉ በሙሉ ጤናማ።',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80&w=800',
        caption: 'Afar Purebred Goat',
        isPrimary: true
      }
    ],
    is_available: true,
    is_featured: true,
    origin: 'Dire Dawa Pasture Hub',
    care_notes: 'Fully dewormed, tick-treated, and rabies vaccinated.',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'goat-df-103',
    title: 'Somali White Long-Legged Fattened Goat',
    breed: 'Somali Goat',
    weight_kg: 42,
    age_months: 26,
    price_etb: 29400, // 42 kg * 700 Birr/kg
    health_status: 'Vet Certified',
    health_certificate: 'National Vet Inspection Cert #ETH-SOM-4401',
    description: 'Heavyweight Somali breed goat with high dressing percentage. Ideal for large family gatherings and commercial hospitality orders.',
    description_am: 'ትልቅና ወፍራም የሶማሌ ፍየል፣ ለትልቅ ቤተሰብና ለሆቴሎች ተመራጭ።',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=800',
        caption: 'Somali Heavyweight',
        isPrimary: true
      }
    ],
    is_available: true,
    is_featured: true,
    origin: 'Eastern Valleys Feeding Lot',
    care_notes: 'High energy diet of alfalfa, sorghum bran, and clean spring water.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'goat-df-104',
    title: 'Borena Prime Medium Family Goat',
    breed: 'Borena Goat',
    weight_kg: 27,
    age_months: 15,
    price_etb: 18900, // 27 kg * 700 Birr/kg
    health_status: 'Vaccinated & Healthy',
    health_certificate: 'Oromia Pastoral Bureau Health Cert #OR-9921',
    description: 'Compact, active Borena goat yielding sweet, low-fat meat. Excellent budget choice for small urban households.',
    description_am: 'ምርጥ የቦረና ፍየል፣ ለመካከለኛ ቤተሰብ በዓል ፍጹም ተስማሚ።',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
        caption: 'Borena Medium Goat',
        isPrimary: true
      }
    ],
    is_available: true,
    is_featured: false,
    origin: 'Dire Farms Feedlot B',
    care_notes: 'Standard 60-day fattening protocol complete.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'goat-df-105',
    title: 'Harar Cross Premium Feast Goat',
    breed: 'Cross Breed',
    weight_kg: 35,
    age_months: 20,
    price_etb: 24500, // 35 kg * 700 Birr/kg
    health_status: 'Fattened Premium',
    health_certificate: 'Dire Dawa Agriculture Office Cert #DD-3320',
    description: 'Cross-bred for optimal meat tenderization and fat distribution. A customer favorite for Ethiopian New Year celebrations.',
    description_am: 'ልዩ የሐረር ክሮስ ፍየል፣ ለበዓል ድግስ የተዘጋጀ።',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800',
        caption: 'Harar Cross Goat',
        isPrimary: true
      }
    ],
    is_available: true,
    is_featured: false,
    origin: 'Dire Farms Block C',
    care_notes: 'Complete vaccination record available upon request.',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1001',
    reference_number: 'DF-20260911-001',
    customer_name: 'Abebe Kebede',
    customer_phone: '+251911234567',
    customer_email: 'abebe.k@example.com',
    goat_id: 'goat-df-101',
    goat_title: 'Harar Fattened Champion Goat - Extra Large',
    goat_price_etb: 26600,
    quantity: 1,
    preferred_delivery_date: '2026-09-09',
    notes: 'Please arrange delivery to Bole area, Addis Ababa before Enkutatash eve.',
    status: 'confirmed',
    internal_notes: 'Customer confirmed via phone. Deposit received via CBE Birr.',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    responded_at: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: 'inq-1002',
    reference_number: 'DF-20260911-002',
    customer_name: 'Tiringo Abebe (Ras Hotel)',
    customer_phone: '+251922889900',
    customer_email: 'fnb@rashotel.com.et',
    goat_id: 'goat-df-103',
    goat_title: 'Somali White Long-Legged Fattened Goat',
    goat_price_etb: 29400,
    quantity: 4,
    preferred_delivery_date: '2026-09-08',
    notes: 'B2B order for New Year banquet menu. Need health certificates attached.',
    status: 'contacted',
    internal_notes: 'Sent corporate quotation email with 5% bulk discount.',
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    responded_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'inq-1003',
    reference_number: 'DF-20260911-003',
    customer_name: 'Mulugeta Tadesse',
    customer_phone: '+251930554433',
    customer_email: 'mulugeta@gmail.com',
    goat_id: 'goat-df-102',
    goat_title: 'Afar Purebred Ceremonial Ram Goat',
    goat_price_etb: 22400,
    quantity: 1,
    preferred_delivery_date: '2026-09-10',
    notes: 'Is pickup available directly at Dire Dawa farm depot?',
    status: 'new',
    internal_notes: 'New web inquiry. Requires agent response.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];
