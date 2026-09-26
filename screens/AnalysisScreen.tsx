import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../lib/store';
import { cardShadow, fonts, radius } from '../lib/theme';
import { PROPERTIES } from '../lib/properties';
import { AMENITIES, GOAL_LABELS, PAYMENT_LABELS, TIMELINE_LABELS, TYPE_LABELS } from '../lib/data';
import { formatPrice } from '../lib/format';
import { analyzeNeeds } from '../lib/matching';
import { RootStackParamList } from '../lib/navigation';
import { IconName } from '../lib/types';
import PropertyCard from '../components/PropertyCard';
import SectionHeader from '../components/SectionHeader';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  const { theme } = useApp();
  return (
    <View style={[styles.profileRow, { borderBottomColor: theme.border }]}>
      <View style={[styles.profileIcon, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={16} color={theme.accent} />
      </View>
      <Text style={[styles.profileLabel, { color: theme.subtext }]}>{label}</Text>
      <Text style={[styles.profileValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

export default function AnalysisScreen() {
  const { theme, needs, clearNeeds } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const results = useMemo(() => (needs ? analyzeNeeds(needs, PROPERTIES) : []), [needs]);
  const topMatches = useMemo(() => results.filter((r) => r.score >= 30).slice(0, 8), [results]);

  if (!needs) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>تحليل الاحتياجات</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={theme.dark ? ['#1B3A66', '#0E2A47'] : ['#0E2A47', '#1B4079']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.introHero}
          >
            <View style={styles.introIcon}>
              <Ionicons name="analytics" size={34} color="#0E2240" />
            </View>
            <Text style={styles.introTitle}>حلل احتياجاتك العقارية</Text>
            <Text style={styles.introSub}>
              بنسألك 10 أسئلة احترافية بغطي كل جوانب بحثك، وبنرشحلك العقارات الأقرب لملفك الشخصي
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.introBtn}
              onPress={() => navigation.navigate('Quiz')}
            >
              <Text style={styles.introBtnText}>ابدأ التحليل</Text>
              <Ionicons name="arrow-back" size={18} color="#0E2240" />
            </TouchableOpacity>
          </LinearGradient>

          <Text style={[styles.howTitle, { color: theme.text }]}>إزاي بنحلل احتياجاتك؟</Text>
          {[
            { icon: 'clipboard-outline' as const, title: '10 أسئلة احترافية', sub: 'من الهدف والميزانية لوسائل الراحة وأولوياتك' },
            { icon: 'finger-print-outline' as const, title: 'ملف احتياجات شخصي', sub: 'بنبني ملفك العقاري من إجاباتك ونحفظه ليك' },
            { icon: 'ribbon-outline' as const, title: 'ترشيحات دقيقة', sub: 'بنرتب العقارات بنسبة تطابق مع أسباب واضحة' },
          ].map((s, i) => (
            <View key={i} style={[styles.howCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
              <View style={[styles.howIcon, { backgroundColor: theme.accentSoft }]}>
                <Ionicons name={s.icon} size={20} color={theme.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.howCardTitle, { color: theme.text }]}>{s.title}</Text>
                <Text style={[styles.howCardSub, { color: theme.subtext }]}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>تحليل الاحتياجات</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>ملفك العقاري ونتائج التطابق</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Quiz')}
        >
          <Ionicons name="refresh" size={18} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* ملف الاحتياجات */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name="person" size={22} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: theme.text }]}>ملف احتياجاتك</Text>
              <Text style={[styles.profileGoal, { color: theme.accent }]}>{GOAL_LABELS[needs.goal]}</Text>
            </View>
            <TouchableOpacity onPress={clearNeeds} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </TouchableOpacity>
          </View>

          <ProfileRow icon="wallet-outline" label="الميزانية" value={`${formatPrice(needs.budgetMin)} - ${needs.budgetMax === Number.POSITIVE_INFINITY ? 'أعلى' : formatPrice(needs.budgetMax)}`} />
          <ProfileRow
            icon="grid-outline"
            label="نوع العقار"
            value={needs.types.length ? needs.types.map((t) => TYPE_LABELS[t]).join('، ') : 'غير محدد'}
          />
          <ProfileRow icon="map-outline" label="المناطق" value={needs.cities.length ? needs.cities.join('، ') : 'كل المناطق'} />
          <ProfileRow
            icon="resize-outline"
            label="المساحة"
            value={needs.areaMax === Number.POSITIVE_INFINITY ? `أكثر من ${needs.areaMin} م²` : `${needs.areaMin} - ${needs.areaMax} م²`}
          />
          <ProfileRow
            icon="bed-outline"
            label="الغرف"
            value={needs.rooms === null ? 'لا يهمني' : needs.rooms === 4 ? '4 غرف أو أكثر' : `${needs.rooms} ${needs.rooms === 1 ? 'غرفة' : 'غرف'}`}
          />
          <ProfileRow
            icon="sparkles-outline"
            label="وسائل الراحة"
            value={needs.amenities.length ? needs.amenities.map((a) => AMENITIES[a].label).join('، ') : 'غير محددة'}
          />
          <ProfileRow icon="time-outline" label="موعد الاستلام" value={TIMELINE_LABELS[needs.timeline]} />
          <ProfileRow icon="card-outline" label="طريقة الدفع" value={PAYMENT_LABELS[needs.payment]} />
          <ProfileRow
            icon="flag-outline"
            label="الأولويات"
            value={needs.priorities.length ? needs.priorities.join('، ') : '—'}
          />
        </View>

        {/* النتائج */}
        <View style={{ marginTop: 20 }}>
          <SectionHeader title={`أفضل التطابقات (${topMatches.length})`} />
          {topMatches.length === 0 && (
            <View style={[styles.noMatch, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="search" size={30} color={theme.subtext} />
              <Text style={{ fontFamily: fonts.semi, fontSize: 14, color: theme.subtext, marginTop: 8, textAlign: 'center' }}>
                مفيش عقارات مطابقة لمعاييرك دلوقتي — جرب توسع الميزانية أو المناطق
              </Text>
            </View>
          )}
          {topMatches.map((m) => (
            <PropertyCard
              key={m.property.id}
              property={m.property}
              match={m}
              onPress={() => (navigation as any).navigate('PropertyDetails', { id: m.property.id })}
            />
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.rerunBtn, { backgroundColor: theme.accent }]}
          onPress={() => navigation.navigate('Quiz')}
        >
          <Ionicons name="refresh" size={18} color="#0E2240" style={{ marginLeft: 8 }} />
          <Text style={styles.rerunText}>أعد تحليل احتياجاتك</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: { fontFamily: fonts.black, fontSize: 24 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introHero: { borderRadius: radius.xl, padding: 24, alignItems: 'center' },
  introIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#D9B44A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: { fontFamily: fonts.black, fontSize: 20, color: '#FFF', textAlign: 'center' },
  introSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  introBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#D9B44A',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: radius.md,
    marginTop: 20,
  },
  introBtnText: { fontFamily: fonts.extra, fontSize: 15, color: '#0E2240', marginLeft: 6 },
  howTitle: { fontFamily: fonts.extra, fontSize: 17, marginTop: 24, marginBottom: 12 },
  howCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  howIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  howCardTitle: { fontFamily: fonts.bold, fontSize: 15 },
  howCardSub: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  profileCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16 },
  profileHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 12 },
  profileAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  profileName: { fontFamily: fonts.extra, fontSize: 16 },
  profileGoal: { fontFamily: fonts.bold, fontSize: 13, marginTop: 2 },
  profileRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  profileIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  profileLabel: { fontFamily: fonts.semi, fontSize: 13, width: 92 },
  profileValue: { fontFamily: fonts.bold, fontSize: 13, flex: 1, textAlign: 'right' },
  noMatch: { borderRadius: radius.lg, borderWidth: 1, padding: 24, alignItems: 'center' },
  rerunBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: 8,
  },
  rerunText: { fontFamily: fonts.extra, fontSize: 15, color: '#0E2240' },
});
