import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../lib/store';
import { cardShadow, fonts, radius } from '../lib/theme';
import { PROPERTIES } from '../lib/properties';
import { AMENITIES, TYPE_LABELS } from '../lib/data';
import { formatPrice } from '../lib/format';
import { RootStackParamList } from '../lib/navigation';
import { IconName } from '../lib/types';
import { analyzeNeeds } from '../lib/matching';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import MatchBar from '../components/MatchBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Stepper({
  label,
  value,
  display,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const { theme } = useApp();
  return (
    <View style={styles.stepper}>
      <Text style={[styles.stepperLabel, { color: theme.subtext }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: theme.cardAlt }]}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Ionicons name="remove" size={18} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.stepValue, { color: theme.text }]}>{display}</Text>
        <TouchableOpacity
          style={[styles.stepBtn, { backgroundColor: theme.cardAlt }]}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Ionicons name="add" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PropertyDetailsScreen() {
  const { theme, isFavorite, toggleFavorite, needs } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'PropertyDetails'>>();
  const { width } = useWindowDimensions();

  const property = useMemo(() => PROPERTIES.find((p) => p.id === route.params.id), [route.params.id]);
  const [imgIndex, setImgIndex] = useState(0);
  const [downPct, setDownPct] = useState(30);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(20);

  const similar = useMemo(() => {
    if (!property) return [];
    return PROPERTIES.filter(
      (p) => p.id !== property.id && (p.type === property.type || p.city === property.city)
    ).slice(0, 3);
  }, [property]);

  const match = useMemo(() => {
    if (!property || !needs) return null;
    const results = analyzeNeeds(needs, [property]);
    return results.length ? results[0] : null;
  }, [property, needs]);

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <EmptyState icon="alert-circle" title="العقار مش موجود" subtitle="ممكن يكون اتشال من القائمة" />
      </View>
    );
  }

  const p = property;
  const fav = isFavorite(p.id);

  // حاسبة التمويل العقاري
  const loan = p.price * (1 - downPct / 100);
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const callAgent = () => {
    Linking.openURL(`tel:${p.agent.phone}`).catch(() =>
      Alert.alert('تعذر الاتصال', 'برجاء تصل بالرقم يدوي')
    );
  };
  const whatsapp = () => {
    Linking.openURL(`https://wa.me/20${p.agent.phone.replace(/^0/, '')}`).catch(() =>
      Alert.alert('تعذر الفتح', 'برجاء تتواصل عبر الاتصال')
    );
  };
  const share = () => {
    Share.share({
      message: `${p.title}\n${formatPrice(p.price, p.purpose === 'rent')}\n${p.city}`,
    }).catch(() => {});
  };

  const specItems: { icon: IconName; label: string }[] = [
    { icon: 'resize-outline', label: `${p.area} م²` },
    { icon: 'bed-outline', label: p.rooms > 0 ? `${p.rooms} غرف` : TYPE_LABELS[p.type] },
    { icon: 'water-outline', label: p.bathrooms > 0 ? `${p.bathrooms} حمام` : p.finishing },
    { icon: p.delivery === 'ready' ? 'checkmark-circle-outline' : 'time-outline', label: p.delivery === 'ready' ? 'جاهز' : 'تحت الإنشاء' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* المعرض */}
        <View>
          <FlatList
            horizontal
            pagingEnabled
            data={p.images}
            keyExtractor={(u) => u}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height: 300 }} contentFit="cover" transition={200} />
            )}
          />
          <LinearGradient
            colors={['rgba(10,25,47,0.55)', 'transparent']}
            style={styles.topGradient}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={[styles.roundBtn, { top: insets.top + 10, right: 16, backgroundColor: theme.overlay }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-forward" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ position: 'absolute', top: insets.top + 10, left: 16, flexDirection: 'row-reverse' }}>
            <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.overlay, marginLeft: 8 }]} onPress={share}>
              <Ionicons name="share-social-outline" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roundBtn, { backgroundColor: theme.overlay }]} onPress={() => toggleFavorite(p.id)}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? '#FF5A5F' : '#FFF'} />
            </TouchableOpacity>
          </View>
          <View style={styles.dots}>
            {p.images.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === imgIndex ? '#FFF' : 'rgba(255,255,255,0.4)' }]} />
            ))}
          </View>
        </View>

        <View style={{ padding: 20 }}>
          {/* السعر والعنوان */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.accent }]}>{formatPrice(p.price, p.purpose === 'rent')}</Text>
            <View style={[styles.purposeTag, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.purposeText, { color: theme.primary }]}>{p.purpose === 'sale' ? 'للبيع' : 'للايجار'}</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{p.title}</Text>
          <View style={styles.cityRow}>
            <Ionicons name="location-outline" size={15} color={theme.subtext} style={{ marginLeft: 4 }} />
            <Text style={[styles.cityText, { color: theme.subtext }]}>
              {p.compound ? `${p.compound} • ` : ''}{p.city}
            </Text>
          </View>

          {/* المواصفات */}
          <View style={[styles.specsCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
            {specItems.map((s, i) => (
              <View key={i} style={styles.specItem}>
                <View style={[styles.specIcon, { backgroundColor: theme.accentSoft }]}>
                  <Ionicons name={s.icon} size={18} color={theme.accent} />
                </View>
                <Text style={[styles.specLabel, { color: theme.text }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* نتيجة تحليل الاحتياجات */}
          {match && (
            <View style={[styles.matchCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
              <MatchBar score={match.score} />
              {match.reasons.length > 0 && (
                <View style={styles.reasonsRow}>
                  {match.reasons.slice(0, 3).map((r, i) => (
                    <View key={i} style={[styles.reasonChip, { backgroundColor: theme.accentSoft }]}>
                      <Text style={[styles.reasonText, { color: theme.text }]}>{r}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* الوصف */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>وصف العقار</Text>
          <Text style={[styles.description, { color: theme.subtext }]}>{p.description}</Text>

          {/* أبرز المميزات */}
          <View style={styles.featuresRow}>
            {p.features.map((f, i) => (
              <View key={i} style={[styles.featureChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="checkmark-circle" size={14} color={theme.success} style={{ marginLeft: 5 }} />
                <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
              </View>
            ))}
          </View>

          {/* وسائل الراحة */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>وسائل الراحة</Text>
          <View style={styles.amenGrid}>
            {p.amenities.map((a) => (
              <View key={a} style={[styles.amenItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name={AMENITIES[a].icon as IconName} size={16} color={theme.accent} style={{ marginLeft: 6 }} />
                <Text style={[styles.amenText, { color: theme.text }]}>{AMENITIES[a].label}</Text>
              </View>
            ))}
            {p.amenities.length === 0 && (
              <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: theme.subtext }}>أرض خام — بدون وسائل راحة</Text>
            )}
          </View>

          {/* نظام الدفع */}
          {p.paymentPlan && (
            <View style={[styles.planCard, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="wallet-outline" size={20} color={theme.primary} style={{ marginLeft: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.planTitle, { color: theme.primary }]}>نظام الدفع</Text>
                <Text style={[styles.planText, { color: theme.primary }]}>{p.paymentPlan}</Text>
              </View>
            </View>
          )}

          {/* حاسبة التمويل العقاري */}
          {p.purpose === 'sale' && p.type !== 'land' && (
            <View style={[styles.calcCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
              <View style={styles.calcHeader}>
                <Ionicons name="calculator" size={18} color={theme.accent} style={{ marginLeft: 8 }} />
                <Text style={[styles.calcTitle, { color: theme.text }]}>حاسبة التمويل العقاري</Text>
              </View>
              <Stepper label="الدفعة المقدمة" value={downPct} display={`${downPct}%`} onChange={setDownPct} min={0} max={90} step={5} />
              <Stepper label="مدة التمويل" value={years} display={`${years} سنوات`} onChange={setYears} min={1} max={20} step={1} />
              <Stepper label="نسبة الفائدة السنوية" value={rate} display={`${rate}%`} onChange={setRate} min={5} max={30} step={0.5} />
              <View style={[styles.monthlyBox, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.monthlyLabel, { color: theme.subtext }]}>الدفعة الشهرية التقريبية</Text>
                <Text style={[styles.monthlyValue, { color: theme.accent }]}>
                  {Math.round(monthly).toLocaleString('en-US')} ج.م
                </Text>
              </View>
            </View>
          )}

          {/* بيانات الوسيط */}
          <View style={[styles.agentCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
            <View style={[styles.agentAvatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.agentInitial}>{p.agent.name.replace('مهندس ', '').charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.agentName, { color: theme.text }]}>{p.agent.name}</Text>
              <Text style={[styles.agentCompany, { color: theme.subtext }]}>{p.agent.company}</Text>
              <View style={styles.agentMeta}>
                <Ionicons name="star" size={13} color={theme.accent} />
                <Text style={[styles.agentMetaText, { color: theme.subtext }]}>
                  {p.agent.rating} • {p.agent.deals} صفقة
                </Text>
              </View>
            </View>
            <View style={styles.agentBtns}>
              <TouchableOpacity style={[styles.agentBtn, { backgroundColor: theme.accent }]} onPress={callAgent}>
                <Ionicons name="call" size={18} color="#0E2240" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.agentBtn, { backgroundColor: '#25D366' }]} onPress={whatsapp}>
                <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* عقارات مشابهة */}
          {similar.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>عقارات مشابهة</Text>
              {similar.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  activeOpacity={0.85}
                  style={[styles.simCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => navigation.replace('PropertyDetails', { id: s.id })}
                >
                  <Image source={{ uri: s.images[0] }} style={styles.simImage} contentFit="cover" transition={200} />
                  <View style={{ flex: 1, padding: 10 }}>
                    <Text style={[styles.simPrice, { color: theme.accent }]} numberOfLines={1}>
                      {formatPrice(s.price, s.purpose === 'rent')}
                    </Text>
                    <Text style={[styles.simTitle, { color: theme.text }]} numberOfLines={1}>
                      {s.title}
                    </Text>
                    <Text style={[styles.simCity, { color: theme.subtext }]} numberOfLines={1}>
                      {s.city} • {s.area} م²
                    </Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color={theme.subtext} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* شريط التواصل السفلي */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={[styles.bottomPrice, { color: theme.accent }]}>{formatPrice(p.price, p.purpose === 'rent')}</Text>
          <Text style={[styles.bottomType, { color: theme.subtext }]}>{p.finishing}</Text>
        </View>
        <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: theme.accent }]} onPress={callAgent} activeOpacity={0.85}>
          <Ionicons name="call" size={18} color="#0E2240" style={{ marginLeft: 8 }} />
          <Text style={styles.ctaText}>تواصل مع المعلن</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 90 },
  roundBtn: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row-reverse',
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginHorizontal: 3 },
  priceRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontFamily: fonts.black, fontSize: 24 },
  purposeTag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  purposeText: { fontFamily: fonts.bold, fontSize: 12 },
  title: { fontFamily: fonts.extra, fontSize: 19, marginTop: 8, lineHeight: 26 },
  cityRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 6 },
  cityText: { fontFamily: fonts.regular, fontSize: 14 },
  specsCard: {
    flexDirection: 'row-reverse',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  specItem: { alignItems: 'center', flex: 1 },
  specIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  specLabel: { fontFamily: fonts.semi, fontSize: 12, textAlign: 'center' },
  matchCard: { borderRadius: radius.lg, borderWidth: 1, padding: 14, marginTop: 14 },
  reasonsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginTop: 10 },
  reasonChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginLeft: 6, marginBottom: 4 },
  reasonText: { fontFamily: fonts.semi, fontSize: 11 },
  sectionTitle: { fontFamily: fonts.extra, fontSize: 17, marginTop: 20, marginBottom: 10 },
  description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 24 },
  featuresRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginTop: 12 },
  featureChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: 8,
    marginBottom: 8,
  },
  featureText: { fontFamily: fonts.semi, fontSize: 12 },
  amenGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap' },
  amenItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginLeft: 8,
    marginBottom: 8,
  },
  amenText: { fontFamily: fonts.semi, fontSize: 12 },
  planCard: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: radius.md, padding: 14, marginTop: 16 },
  planTitle: { fontFamily: fonts.bold, fontSize: 13, marginBottom: 2 },
  planText: { fontFamily: fonts.semi, fontSize: 13 },
  calcCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginTop: 20 },
  calcHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 14 },
  calcTitle: { fontFamily: fonts.extra, fontSize: 16 },
  stepper: { marginBottom: 12 },
  stepperLabel: { fontFamily: fonts.semi, fontSize: 13, marginBottom: 8 },
  stepperControls: { flexDirection: 'row-reverse', alignItems: 'center' },
  stepBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontFamily: fonts.extra, fontSize: 15, marginHorizontal: 14, minWidth: 70, textAlign: 'center' },
  monthlyBox: { borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: 6 },
  monthlyLabel: { fontFamily: fonts.semi, fontSize: 12 },
  monthlyValue: { fontFamily: fonts.black, fontSize: 22, marginTop: 4 },
  agentCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    marginTop: 20,
  },
  agentAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  agentInitial: { color: '#D9B44A', fontFamily: fonts.black, fontSize: 20 },
  agentName: { fontFamily: fonts.bold, fontSize: 15 },
  agentCompany: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  agentMeta: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 },
  agentMetaText: { fontFamily: fonts.semi, fontSize: 12, marginLeft: 4 },
  agentBtns: { flexDirection: 'row-reverse' },
  agentBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  simCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  simImage: { width: 90, height: 80 },
  simPrice: { fontFamily: fonts.extra, fontSize: 14 },
  simTitle: { fontFamily: fonts.bold, fontSize: 13, marginTop: 2 },
  simCity: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomPrice: { fontFamily: fonts.black, fontSize: 18 },
  bottomType: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  ctaBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  ctaText: { color: '#0E2240', fontFamily: fonts.extra, fontSize: 14 },
});
