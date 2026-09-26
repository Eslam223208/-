import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useApp } from '../lib/store';
import { cardShadow, fonts, radius } from '../lib/theme';
import { PROPERTIES } from '../lib/properties';
import { RootStackParamList } from '../lib/navigation';
import PropertyCard from '../components/PropertyCard';
import SectionHeader from '../components/SectionHeader';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { key: 'all', label: 'الكل', icon: 'grid-outline' as const },
  { key: 'apartment', label: 'شقق', icon: 'business-outline' as const },
  { key: 'villa', label: 'فلل', icon: 'home-outline' as const },
  { key: 'townhouse', label: 'تاون هاوس', icon: 'home' as const },
  { key: 'land', label: 'أراضي', icon: 'map-outline' as const },
  { key: 'commercial', label: 'تجاري', icon: 'storefront-outline' as const },
  { key: 'office', label: 'إداري', icon: 'briefcase-outline' as const },
  { key: 'rent', label: 'للايجار', icon: 'key-outline' as const },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 18) return 'طاب يومك';
  return 'مساء الخير';
}

export default function HomeScreen() {
  const { theme, needs } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [refreshing, setRefreshing] = useState(false);

  const featured = useMemo(() => PROPERTIES.filter((p) => p.status === 'مميز'), []);
  const latest = useMemo(() => [...PROPERTIES].reverse().slice(0, 6), []);
  const citiesCount = useMemo(() => new Set(PROPERTIES.map((p) => p.city)).size, []);
  const avgMeter = useMemo(() => {
    const sale = PROPERTIES.filter((p) => p.purpose === 'sale' && p.area > 0);
    const avg = sale.reduce((s, p) => s + p.price / p.area, 0) / sale.length;
    return Math.round(avg).toLocaleString('en-US');
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const openCategory = (key: string) => {
    if (key === 'all') {
      navigation.navigate('Main', { screen: 'Explore', params: {} });
    } else if (key === 'rent') {
      navigation.navigate('Main', { screen: 'Explore', params: { presetPurpose: 'rent' } });
    } else {
      navigation.navigate('Main', { screen: 'Explore', params: { presetType: key } });
    }
  };

  const header = (
    <View>
      {/* شريط البحث */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Main', { screen: 'Explore', params: {} })}
        style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <Ionicons name="search" size={20} color={theme.subtext} style={{ marginLeft: 8 }} />
        <Text style={[styles.searchText, { color: theme.subtext }]}>ابحث بالمنطقة أو اسم الكمبوند...</Text>
      </TouchableOpacity>

      {/* إحصائيات */}
      <View style={styles.statsRow}>
        {[
          { icon: 'layers-outline' as const, label: 'عقار متاح', value: String(PROPERTIES.length) },
          { icon: 'map-outline' as const, label: 'منطقة تغطية', value: String(citiesCount) },
          { icon: 'trending-up-outline' as const, label: 'متوسط سعر المتر', value: `${avgMeter}` },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
            <View style={[styles.statIcon, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name={s.icon} size={18} color={theme.accent} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* بطاقة تحليل الاحتياجات */}
      <LinearGradient
        colors={theme.dark ? ['#1B3A66', '#0E2A47'] : ['#0E2A47', '#1B4079']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={12} color="#0E2240" />
          <Text style={styles.heroBadgeText}>تحليل احتياجات ذكي</Text>
        </View>
        <Text style={styles.heroTitle}>لاقي عقارك المثالي{'\n'}في 3 خطوات بس</Text>
        <Text style={styles.heroSub}>
          أجاوب على 10 أسئلة احترافية وهنرشحلك عقارات مطابقة لملفك بالظبط
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.heroBtn}
          onPress={() => (needs ? navigation.navigate('Main', { screen: 'Analysis' }) : navigation.navigate('Quiz'))}
        >
          <Text style={styles.heroBtnText}>{needs ? 'شوف نتائج تحليلك' : 'ابدأ تحليل احتياجاتك'}</Text>
          <Ionicons name="arrow-back" size={18} color="#0E2240" />
        </TouchableOpacity>
      </LinearGradient>

      {/* التصنيفات */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openCategory(item.key)}
            style={[styles.catCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.catIcon, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name={item.icon} size={20} color={theme.accent} />
            </View>
            <Text style={[styles.catLabel, { color: theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* عقارات مميزة */}
      <View style={{ paddingHorizontal: 20 }}>
        <SectionHeader title="عقارات مميزة" action="شوف الكل" onAction={() => navigation.navigate('Main', { screen: 'Explore', params: {} })} />
      </View>
      <FlatList
        horizontal
        data={featured}
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('PropertyDetails', { id: item.id })}
            style={[styles.featuredCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}
          >
            <Image source={{ uri: item.images[0] }} style={styles.featuredImage} contentFit="cover" transition={200} />
            <View style={[styles.featuredBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.featuredBadgeText}>{item.status}</Text>
            </View>
            <View style={{ padding: 12 }}>
              <Text style={[styles.featuredPrice, { color: theme.accent }]} numberOfLines={1}>
                {item.purpose === 'rent' ? `${item.price.toLocaleString('en-US')} ج.م/شهر` : `${(item.price / 1000000).toFixed(1)} مليون ج.م`}
              </Text>
              <Text style={[styles.featuredTitle, { color: theme.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.featuredCity, { color: theme.subtext }]} numberOfLines={1}>
                {item.compound ? `${item.compound} • ` : ''}{item.city}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <SectionHeader title="أحدث الإضافات" />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      {/* الهيدر */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.subtext }]}>{greeting()}</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>عقاري</Text>
        </View>
        <View style={[styles.logoBadge, { backgroundColor: theme.accent }]}>
          <Ionicons name="home" size={22} color="#0E2240" />
        </View>
      </View>

      <FlatList
        data={latest}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetails', { id: item.id })} />
        )}
      />
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
  greeting: { fontFamily: fonts.semi, fontSize: 13 },
  headerTitle: { fontFamily: fonts.black, fontSize: 26, marginTop: 2 },
  logoBadge: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
  },
  searchText: { fontFamily: fonts.regular, fontSize: 14, flex: 1 },
  statsRow: { flexDirection: 'row-reverse', marginBottom: 16 },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontFamily: fonts.extra, fontSize: 16 },
  statLabel: { fontFamily: fonts.regular, fontSize: 11, marginTop: 2 },
  hero: { borderRadius: radius.xl, padding: 20, marginBottom: 18, overflow: 'hidden' },
  heroBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#D9B44A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroBadgeText: { fontFamily: fonts.bold, fontSize: 11, color: '#0E2240', marginLeft: 4 },
  heroTitle: { fontFamily: fonts.black, fontSize: 22, color: '#FFFFFF', lineHeight: 30 },
  heroSub: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8, lineHeight: 20 },
  heroBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#D9B44A',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: 16,
  },
  heroBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#0E2240', marginLeft: 6 },
  catCard: {
    width: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 14,
  },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  catLabel: { fontFamily: fonts.semi, fontSize: 12 },
  featuredCard: { width: 240, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', marginLeft: 14, marginBottom: 16 },
  featuredImage: { width: '100%', height: 130 },
  featuredBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  featuredBadgeText: { color: '#FFF', fontFamily: fonts.bold, fontSize: 10 },
  featuredPrice: { fontFamily: fonts.extra, fontSize: 16 },
  featuredTitle: { fontFamily: fonts.bold, fontSize: 13, marginTop: 4 },
  featuredCity: { fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
});
