import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useApp } from '../lib/store';
import { cardShadow, fonts, radius } from '../lib/theme';
import { CITIES, AMENITIES, TYPE_LABELS, TYPE_ICONS, QUIZ_PRIORITIES } from '../lib/data';
import { AmenityKey, PropertyType, Timeline, Payment, UserNeeds } from '../lib/types';
import { RootStackParamList } from '../lib/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Option {
  value: any;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint?: string;
}

interface Step {
  key: string;
  title: string;
  subtitle: string;
  type: 'single' | 'multi';
  required?: boolean;
  options: Option[];
}

const SALE_BUDGET: Option[] = [
  { value: [0, 2_000_000], label: 'أقل من 2 مليون', icon: 'cash-outline' },
  { value: [2_000_000, 4_000_000], label: 'من 2 لـ 4 مليون', icon: 'cash-outline' },
  { value: [4_000_000, 8_000_000], label: 'من 4 لـ 8 مليون', icon: 'cash-outline' },
  { value: [8_000_000, 15_000_000], label: 'من 8 لـ 15 مليون', icon: 'cash-outline' },
  { value: [15_000_000, Number.POSITIVE_INFINITY], label: 'أكثر من 15 مليون', icon: 'cash-outline' },
];

const RENT_BUDGET: Option[] = [
  { value: [0, 5000], label: 'أقل من 5 آلاف ج.م/شهر', icon: 'cash-outline' },
  { value: [5000, 10000], label: 'من 5 لـ 10 آلاف', icon: 'cash-outline' },
  { value: [10000, 20000], label: 'من 10 لـ 20 ألف', icon: 'cash-outline' },
  { value: [20000, Number.POSITIVE_INFINITY], label: 'أكثر من 20 ألف', icon: 'cash-outline' },
];

const AREA_RANGES: Option[] = [
  { value: [0, 100], label: 'أقل من 100 م²', icon: 'resize-outline' },
  { value: [100, 150], label: 'من 100 لـ 150 م²', icon: 'resize-outline' },
  { value: [150, 220], label: 'من 150 لـ 220 م²', icon: 'resize-outline' },
  { value: [220, 350], label: 'من 220 لـ 350 م²', icon: 'resize-outline' },
  { value: [350, Number.POSITIVE_INFINITY], label: 'أكثر من 350 م²', icon: 'resize-outline' },
];

const ROOM_OPTIONS: Option[] = [
  { value: 1, label: 'غرفة', icon: 'bed-outline' },
  { value: 2, label: 'غرفتين', icon: 'bed-outline' },
  { value: 3, label: '3 غرف', icon: 'bed-outline' },
  { value: 4, label: '4 غرف أو أكثر', icon: 'bed-outline' },
  { value: null, label: 'لا يهمني', icon: 'infinite-outline' },
];

const TIMELINE_OPTIONS: Option[] = [
  { value: 'immediate', label: 'فوري — جاهز للتسليم', icon: 'flash-outline' },
  { value: '3months', label: 'خلال 3 أشهر', icon: 'time-outline' },
  { value: '1year', label: 'خلال سنة', icon: 'calendar-outline' },
  { value: 'construction', label: 'أقبل عقار تحت الإنشاء', icon: 'construct-outline' },
];

const PAYMENT_OPTIONS: Option[] = [
  { value: 'cash', label: 'دفع كاش', icon: 'cash-outline' },
  { value: 'installments', label: 'تقسيط من المطور', icon: 'card-outline' },
  { value: 'mortgage', label: 'قرض عقاري بنكي', icon: 'wallet-outline' },
  { value: 'mixed', label: 'مزيج بينهم', icon: 'layers-outline' },
];

export default function QuizScreen() {
  const { theme, saveNeeds, needs } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [analyzing, setAnalyzing] = useState(false);

  const isRent = answers.goal === 'rent';

  const steps: Step[] = useMemo(
    () => [
      {
        key: 'goal',
        title: 'ما هدفك من البحث؟',
        subtitle: 'الخطوة الأولى لفهم احتياجاتك بدقة',
        type: 'single',
        required: true,
        options: [
          { value: 'buy', label: 'شراء للسكن', icon: 'home-outline', hint: 'بتبحث عن عقار تعيش فيه أنت أو عائلتك' },
          { value: 'invest', label: 'شراء للاستثمار', icon: 'trending-up-outline', hint: 'بتدور على عائد تأجيري أو زيادة في القيمة' },
          { value: 'rent', label: 'إيجار للسكن', icon: 'key-outline', hint: 'عايز تأجر شقة أو فيلا' },
          { value: 'build', label: 'شراء أرض للبناء', icon: 'construct-outline', hint: 'عايز تبني على أرض بالتقسيط' },
        ],
      },
      {
        key: 'types',
        title: 'نوع العقار اللي يناسبك؟',
        subtitle: 'اختار نوع أو أكثر',
        type: 'multi',
        options: (Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => ({
          value: t,
          label: TYPE_LABELS[t],
          icon: TYPE_ICONS[t] as keyof typeof Ionicons.glyphMap,
        })),
      },
      {
        key: 'budget',
        title: 'ما هي ميزانيتك؟',
        subtitle: isRent ? 'حدد إيجارك الشهري' : 'حدد حدود سعرك',
        type: 'single',
        required: true,
        options: isRent ? RENT_BUDGET : SALE_BUDGET,
      },
      {
        key: 'cities',
        title: 'المناطق المفضلة لك',
        subtitle: 'اختار منطقة أو أكثر',
        type: 'multi',
        options: CITIES.map((c) => ({ value: c, label: c, icon: 'location-outline' as const })),
      },
      {
        key: 'area',
        title: 'المساحة المطلوبة',
        subtitle: 'بالمتر المربع',
        type: 'single',
        options: AREA_RANGES.map((o) => ({ ...o, value: o.value })),
      },
      {
        key: 'rooms',
        title: 'عدد الغرف',
        subtitle: 'كم غرفة نوم تحتاج؟',
        type: 'single',
        options: ROOM_OPTIONS,
      },
      {
        key: 'amenities',
        title: 'وسائل الراحة الأساسية',
        subtitle: 'اختار اللي مش مستغني عنه',
        type: 'multi',
        options: Object.entries(AMENITIES).map(([k, v]) => ({
          value: k,
          label: v.label,
          icon: v.icon as keyof typeof Ionicons.glyphMap,
        })),
      },
      {
        key: 'timeline',
        title: 'متى تحب تستلم العقار؟',
        subtitle: 'ده بيأثر على اختيار العقارات الجاهزة أو تحت الإنشاء',
        type: 'single',
        options: TIMELINE_OPTIONS,
      },
      {
        key: 'payment',
        title: 'طريقة الدفع المفضلة',
        subtitle: 'اختار الأنسب لوضعك المالي',
        type: 'single',
        options: PAYMENT_OPTIONS,
      },
      {
        key: 'priorities',
        title: 'أولوياتك الشخصية',
        subtitle: 'اختار اللي يهمك أكتر',
        type: 'multi',
        options: QUIZ_PRIORITIES.map((p) => ({
          value: p,
          label: p,
          icon: 'flag-outline' as const,
        })),
      },
    ],
    [isRent]
  );

  const step = steps[index];
  const current = answers[step.key];
  const isAnswered = step.type === 'multi' ? Array.isArray(current) && current.length > 0 : current !== undefined && current !== null;
  const canNext = !step.required || isAnswered;

  const toggle = (value: any) => {
    const arr: any[] = Array.isArray(current) ? current : [];
    setAnswers({ ...answers, [step.key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] });
  };

  const finish = () => {
    const budget = answers.budget || [0, Number.POSITIVE_INFINITY];
    const area = answers.area || [0, Number.POSITIVE_INFINITY];
    const needs: UserNeeds = {
      goal: answers.goal || 'buy',
      types: Array.isArray(answers.types) ? answers.types : [],
      budgetMin: budget[0],
      budgetMax: budget[1],
      cities: Array.isArray(answers.cities) ? answers.cities : [],
      areaMin: area[0],
      areaMax: area[1],
      rooms: answers.rooms ?? null,
      amenities: Array.isArray(answers.amenities) ? answers.amenities : [],
      timeline: answers.timeline || 'immediate',
      payment: answers.payment || 'installments',
      priorities: Array.isArray(answers.priorities) ? answers.priorities : [],
    };
    saveNeeds(needs);
    setAnalyzing(true);
    setTimeout(() => {
      navigation.navigate('Main', { screen: 'Analysis' });
    }, 1800);
  };

  const next = () => {
    if (index < steps.length - 1) setIndex(index + 1);
    else finish();
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
    else navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top + 8 }]}>
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={[styles.headerBtn, { backgroundColor: theme.card, borderColor: theme.border }]} hitSlop={8}>
          <Ionicons name={index === 0 ? 'close' : 'chevron-forward'} size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.stepCounter, { color: theme.subtext }]}>
            خطوة {index + 1} من {steps.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* شريط التقدم */}
      <View style={[styles.progressTrack, { backgroundColor: theme.cardAlt }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${((index + 1) / steps.length) * 100}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Animated.View key={`title-${index}`} entering={FadeIn.duration(300)}>
          <Text style={[styles.question, { color: theme.text }]}>{step.title}</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>{step.subtitle}</Text>
        </Animated.View>

        <View style={{ marginTop: 20 }}>
          {step.options.map((opt, i) => {
            const selected = step.type === 'multi' ? Array.isArray(current) && current.includes(opt.value) : current === opt.value;
            return (
              <Animated.View key={String(opt.value)} entering={FadeInDown.delay(i * 50).duration(350)}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => (step.type === 'multi' ? toggle(opt.value) : setAnswers({ ...answers, [step.key]: opt.value }))}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? theme.accentSoft : theme.card,
                      borderColor: selected ? theme.accent : theme.border,
                    },
                    cardShadow,
                  ]}
                >
                  <View style={[styles.optionIcon, { backgroundColor: selected ? theme.accent : theme.cardAlt }]}>
                    <Ionicons name={opt.icon} size={20} color={selected ? '#FFF' : theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionLabel, { color: theme.text }]}>{opt.label}</Text>
                    {opt.hint && <Text style={[styles.optionHint, { color: theme.subtext }]}>{opt.hint}</Text>}
                  </View>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={selected ? theme.accent : theme.border}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* أزرار التنقل */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + 12 }]}>
        {index > 0 && (
          <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={() => setIndex(index - 1)}>
            <Ionicons name="chevron-forward" size={18} color={theme.text} />
            <Text style={[styles.backText, { color: theme.text }]}>رجوع</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canNext}
          onPress={next}
          style={[styles.nextBtn, { backgroundColor: canNext ? theme.accent : theme.cardAlt, flex: 1 }]}
        >
          <Text style={[styles.nextText, { color: canNext ? '#0E2240' : theme.subtext }]}>
            {index === steps.length - 1 ? 'إنهاء التحليل' : 'الخطوة الجاية'}
          </Text>
          <Ionicons name="arrow-back" size={18} color={canNext ? '#0E2240' : theme.subtext} />
        </TouchableOpacity>
      </View>

      {/* شاشة التحليل */}
      {analyzing && (
        <View style={[styles.analyzing, { backgroundColor: theme.bg }]}>
          <View style={[styles.analyzingIcon, { backgroundColor: theme.accentSoft }]}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
          <Text style={[styles.analyzingTitle, { color: theme.text }]}>جارٍ تحليل احتياجاتك...</Text>
          <Text style={[styles.analyzingSub, { color: theme.subtext }]}>
            بنقارن ملفك بأفضل العقارات المتاحة
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCounter: { fontFamily: fonts.semi, fontSize: 13 },
  progressTrack: { height: 6, marginHorizontal: 20, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  question: { fontFamily: fonts.black, fontSize: 22, lineHeight: 30 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, marginTop: 6 },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  optionIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  optionLabel: { fontFamily: fonts.bold, fontSize: 15 },
  optionHint: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  backBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginLeft: 10,
  },
  backText: { fontFamily: fonts.bold, fontSize: 14, marginLeft: 4 },
  nextBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  nextText: { fontFamily: fonts.extra, fontSize: 15, marginLeft: 6 },
  analyzing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  analyzingIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  analyzingTitle: { fontFamily: fonts.extra, fontSize: 18 },
  analyzingSub: { fontFamily: fonts.regular, fontSize: 14, marginTop: 8, textAlign: 'center' },
});
