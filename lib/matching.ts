import { MatchResult, Property, UserNeeds } from './types';

/**
 * محرك تحليل الاحتياجات العقارية
 * بيقارن ملف احتياجات المستخدم بكل عقار وبيحسب نسبة تطابق (0-100)
 * مع أسباب واضحة لكل نتيجة
 */
export function analyzeNeeds(needs: UserNeeds, all: Property[]): MatchResult[] {
  const results: MatchResult[] = [];

  for (const p of all) {
    // فلاتر حاسمة: هدف الشراء/الإيجار ونوع العقار
    if (needs.goal === 'rent' && p.purpose !== 'rent') continue;
    if (needs.goal !== 'rent' && p.purpose !== 'sale') continue;
    if (needs.goal === 'build' && p.type !== 'land') continue;
    if (needs.goal !== 'build' && p.type === 'land') continue;

    let score = 0;
    const reasons: string[] = [];

    // الميزانية (30 نقطة)
    if (p.price >= needs.budgetMin && p.price <= needs.budgetMax) {
      score += 30;
      reasons.push('ضمن ميزانيتك المحددة');
    } else if (p.price < needs.budgetMin) {
      score += 24;
      reasons.push('أقل من ميزانيتك — فرصة توفير');
    } else if (p.price <= needs.budgetMax * 1.15) {
      score += 18;
      reasons.push('قريب من الحد الأقصى لميزانيتك');
    } else {
      score += 5;
    }

    // نوع العقار (20 نقطة)
    if (needs.types.length === 0) {
      score += 14;
    } else if (needs.types.includes(p.type)) {
      score += 20;
      reasons.push('من نوع العقار اللي حددته');
    } else {
      score += 4;
    }

    // الموقع (15 نقطة)
    if (needs.cities.length === 0) {
      score += 8;
    } else if (needs.cities.includes(p.city)) {
      score += 15;
      reasons.push(`يقع في ${p.city} من مناطقك المفضلة`);
    }

    // المساحة (12 نقطة)
    const noAreaPref = needs.areaMin === 0 && needs.areaMax === Number.POSITIVE_INFINITY;
    if (noAreaPref) {
      score += 7;
    } else if (p.area >= needs.areaMin && p.area <= needs.areaMax) {
      score += 12;
      reasons.push(`مساحته ${p.area} م² ضمن النطاق المطلوب`);
    } else if (p.area >= needs.areaMin * 0.8 && p.area <= needs.areaMax * 1.25) {
      score += 6;
    }

    // عدد الغرف (8 نقاط)
    const neutralType = p.type === 'land' || p.type === 'commercial' || p.type === 'office';
    if (needs.rooms === null || neutralType) {
      score += 5;
    } else if (needs.rooms === 4 ? p.rooms >= 4 : p.rooms === needs.rooms) {
      score += 8;
      reasons.push(`عدد الغرف (${p.rooms}) مطابق لطلبك`);
    }

    // وسائل الراحة (10 نقاط)
    if (needs.amenities.length === 0) {
      score += 5;
    } else {
      const overlap = needs.amenities.filter((a) => p.amenities.includes(a)).length;
      score += Math.round((overlap / needs.amenities.length) * 10);
      if (overlap > 0) reasons.push(`يوفر ${overlap} من وسائل الراحة الأساسية اللي طلبتها`);
    }

    // طريقة الدفع (5 نقاط)
    if (needs.payment === 'cash') {
      score += 5;
    } else if (needs.payment === 'mixed') {
      score += p.paymentPlan ? 4 : 3;
    } else {
      if (p.paymentPlan) {
        score += 5;
        reasons.push('متاح بنظام التقسيط المناسب لك');
      } else {
        score += 2;
      }
    }

    // موعد الاستلام (تعديلات)
    if (needs.timeline === 'immediate') {
      if (p.delivery === 'ready') {
        score += 3;
        reasons.push('جاهز للتسليم الفوري');
      } else {
        score -= 4;
      }
    } else if (needs.timeline === 'construction') {
      if (p.delivery === 'under-construction') {
        score += 2;
        reasons.push('تحت الإنشاء بأسعار أفضل');
      }
    } else if (p.delivery === 'ready') {
      score += 1;
    }

    score = Math.max(5, Math.min(100, Math.round(score)));
    results.push({ property: p, score, reasons });
  }

  return results.sort((a, b) => b.score - a.score);
}
