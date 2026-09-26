import { AmenityKey, Goal, Payment, PropertyType, Timeline } from './types';

export const CITIES = [
  'القاهرة الجديدة',
  'التجمع الخامس',
  'الشيخ زايد',
  'مدينة السادس من أكتوبر',
  'المعادي',
  'مدينة نصر',
  'الزمالك',
  'العاصمة الإدارية الجديدة',
  'الإسكندرية',
  'الساحل الشمالي',
  'العين السخنة',
];

export const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'شقة سكنية',
  villa: 'فيلا مستقلة',
  townhouse: 'تاون هاوس',
  land: 'أرض سكنية',
  commercial: 'محل تجاري',
  office: 'مكتب إداري',
};

export const TYPE_ICONS: Record<PropertyType, string> = {
  apartment: 'business-outline',
  villa: 'home-outline',
  townhouse: 'home',
  land: 'map-outline',
  commercial: 'storefront-outline',
  office: 'briefcase-outline',
};

export const GOAL_LABELS: Record<string, string> = {
  buy: 'شراء للسكن',
  invest: 'شراء للاستثمار',
  rent: 'إيجار للسكن',
  build: 'شراء أرض للبناء',
};

export const TIMELINE_LABELS: Record<string, string> = {
  immediate: 'فوري (جاهز للتسليم)',
  '3months': 'خلال 3 أشهر',
  '1year': 'خلال سنة',
  construction: 'أقبل عقار تحت الإنشاء',
};

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'دفع كاش',
  installments: 'تقسيط من المطور',
  mortgage: 'قرض عقاري بنكي',
  mixed: 'مزيج بينهم',
};

export const AMENITIES: Record<AmenityKey, { label: string; icon: string }> = {
  parking: { label: 'مواقف سيارات', icon: 'car' },
  pool: { label: 'حمام سباحة', icon: 'water' },
  gym: { label: 'نادي صحي', icon: 'barbell' },
  security: { label: 'حراسة 24 ساعة', icon: 'shield-checkmark' },
  elevator: { label: 'مصعد', icon: 'swap-vertical' },
  garden: { label: 'حديقة', icon: 'leaf' },
  view: { label: 'إطلالة مميزة', icon: 'sunny' },
  kids: { label: 'ملعب أطفال', icon: 'happy' },
  mall: { label: 'منطقة تجارية', icon: 'cart' },
  ac: { label: 'تكييف مركزي', icon: 'snow' },
  furnished: { label: 'مفروش', icon: 'bed' },
  smartHome: { label: 'منزل ذكي', icon: 'hardware-chip' },
  storage: { label: 'مستودع', icon: 'cube' },
  concierge: { label: 'كونسيرج', icon: 'key' },
  tennis: { label: 'ملعب تنس', icon: 'tennisball' },
  clubhouse: { label: 'نادي اجتماعي', icon: 'people' },
};

export const QUIZ_PRIORITIES = [
  'قرب من مكان العمل',
  'الهدوء والخصوصية',
  'عائد استثماري مرتفع',
  'قرب من المدارس',
  'قرب من مراكز تجارية',
  'إطلالة مميزة',
  'مجتمع سكني متكامل',
  'خدمات طبية قريبة',
];
