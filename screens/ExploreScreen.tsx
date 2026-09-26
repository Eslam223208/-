import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/store';
import { cardShadow, fonts, radius } from '../lib/theme';
import { PROPERTIES } from '../lib/properties';
import { AMENITIES, CITIES, TYPE_ICONS, TYPE_LABELS } from '../lib/data';
import { AmenityKey, IconName, PropertyType } from '../lib/types';
import { MainTabParamList, RootStackParamList } from '../lib/navigation';
import PropertyCard from '../components/PropertyCard';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RoomsFilter = number | null;

const SORTS = [
  { key: 'new', label: 'الأحدث' },
  { key: 'priceAsc', label: 'الأقل سعرًا' },
  { key: 'priceDesc', label: 'الأعلى سعرًا' },
  { key: 'areaDesc', label: 'الأكثر مساحة' },
] as const;

export default function ExploreScreen() {
  const { theme } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<MainTabParamList, 'Explore'>>();

  const [search, setSearch] = useState('');
  const [purpose, setPurpose] = useState<'all' | 'sale' | 'rent'>('all');
  const [types, setTypes] = useState<PropertyType[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [rooms, setRooms] = useState<RoomsFilter>(null);
  const [amenities, setAmenities] = useState<AmenityKey[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');
  const [sort, setSort] = useState<(typeof SORTS)[number]['key']>('new');
  const [showFilters, setShowFilters] = useState(false);

  // تزامن مع الفلاتر القادمة من الشاشة الرئيسية
  useEffect(() => {
    const pt = route.params?.presetType;
    const pp = route.params?.presetPurpose;
    if (pt && pt !== 'rent') setTypes([pt as PropertyType]);
    if (pp === 'rent') setPurpose('rent');
  }, [route.params]);

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const filtered = useMemo(() => {
    let list = [...PROPERTIES];
    if (purpose !== 'all') list = list.filter((p) => p.purpose === purpose);
    if (types.length) list = list.filter((p) => types.includes(p.type));
    if (cities.length) list = list.filter((p) => cities.includes(p.city));
    if (rooms !== null) list = list.filter((p) => (rooms === 4 ? p.rooms >= 4 : p.rooms === rooms));
    if (amenities.length) list = list.filter((p) => amenities.every((a) => p.amenities.includes(a)));
    const pMin = parseFloat(priceMin) || 0;
    const pMax = parseFloat(priceMax) || Number.POSITIVE_INFINITY;
    if (pMin > 0 || pMax !== Number.POSITIVE_INFINITY) list = list.filter((p) => p.price >= pMin && p.price <= pMax);
    const aMin = parseFloat(areaMin) || 0;
    const aMax = parseFloat(areaMax) || Number.POSITIVE_INFINITY;
    if (aMin > 0 || aMax !== Number.POSITIVE_INFINITY) list = list.filter((p) => p.area >= aMin && p.area <= aMax);
    if (search.trim()) {
      const q = search.trim();
      list = list.filter(
        (p) => p.title.includes(q) || p.city.includes(q) || (p.compound || '').includes(q)
      );
    }
    switch (sort) {
      case 'priceAsc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'areaDesc':
        list.sort((a, b) => b.area - a.area);
        break;
      default:
        list.reverse();
    }
    return list;
  }, [purpose, types, cities, rooms, amenities, priceMin, priceMax, areaMin, areaMax, search, sort]);

  const activeFilters =
    types.length +
    cities.length +
    amenities.length +
    (rooms !== null ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0) +
    (areaMin || areaMax ? 1 : 0);

  const resetFilters = () => {
    setTypes([]);
    setCities([]);
    setRooms(null);
    setAmenities([]);
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
  };

  const filterModal = (
    <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowFilters(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>الفلاتر</Text>
              <TouchableOpacity onPress={resetFilters} hitSlop={8}>
                <Text style={{ fontFamily: fonts.semi, fontSize: 13, color: theme.accent }}>إعادة ضبط</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
              {/* الغرض */}
              <Text style={[styles.filterLabel, { color: theme.subtext }]}>الغرض</Text>
              <View style={styles.chipsWrap}>
                {(['all', 'sale', 'rent'] as const).map((k) => (
                  <Chip
                    key={k}
                    label={k === 'all' ? 'الكل' : k === 'sale' ? 'للبيع' : 'للايجار'}
                    selected={purpose === k}
                    onPress={() => setPurpose(k)}
                  />
                ))}
              </View>

              {/* نوع العقار */}
              <Text style={[styles.filterLabel, { color: theme.subtext }]}>نوع العقار</Text>
              <View style={styles.chipsWrap}>
                {(Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => (
                  <Chip
                    key={t}
                    label={TYPE_LABELS[t]}
                    icon={TYPE_ICONS[t] as IconName}
                    selected={types.includes(t)}
                    onPress={() => toggle(types, t, setTypes)}
                  />
                ))}
              </View>

              {/* المنطقة */}
              <Text style={[styles.filterLabel, { color: theme.subtext }]}>المنطقة</Text>
              <View style={styles.chipsWrap}>
                {CITIES.map((c) => (
                  <Chip key={c} label={c} selected={cities.includes(c)} onPress={() => toggle(cities, c, setCities)} />
                ))}
              </View>

              {/* الغرف */}
              <Text style={[styles.filterLabel, { color: theme.subtext }]}>عدد الغرف</Text>
              <View style={styles.chipsWrap}>
                {[1, 2, 3, 4].map((r) => (
                  <Chip
                    key={r}
                    label={r === 4 ? '4 غرف أو أكثر' : `${r} ${r === 1 ? 'غرفة' : 'غرف'}`}
                    selected={rooms === r}
                    onPress={() => setRooms(rooms === r ? null : r)}
                  />
                ))}
              </View>

              {/* السعر */}
              <Text style={[styles.filterLabel, { color: theme.subtext }]}>السعر (ج.م)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.cardAlt, color: theme.text, borderColor: theme.border }]}
                  placeholder="الحد الأدنى"
                  placeholderTextColor={theme.subtext}
                  keyboardType="numeric"
                  value={priceMin}
                  onChangeText={setPriceMin}
                />
                <Text style={{ color: theme.subtext, fontFamily: fonts.semi, marginHorizontal: 8 }}>:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.cardAlt, color: theme.text, borderColor: theme.border }]}
                  placeholder="الحد الأقصى"
                  placeholderTextColor={theme.subtext}
                  keyboardType="numeric"
                  value={priceMax}
                  onChangeText={setPriceMax}
                />
              </View>

              {/* المساحة */}
              <Text style={[styles.filterLabel, { color: theme.subtext }]}>المساحة (م²)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.cardAlt, color: theme.text, borderColor: theme.border }]}
                  placeholder="الحد الأدنى"
                  placeholderTextColor={theme.subtext}
                  keyboardType="numeric"
                  value={areaMin}
                  onChangeText={setAreaMin}
                />
                <Text style={{ color: theme.subtext, fontFamily: fonts.semi, marginHorizontal: 8 }}>:</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.cardAlt, color: theme.text, borderColor: theme.border }]}
                  placeholder="الحد الأقصى"
                  placeholderTextColor={theme.subtext}
                  keyboardType="numeric"
                  value={areaMax}
                  onChangeText={setAreaMax}
                />
              </View>

              {/* وسائل الراحة */}
              <Text style={[styles.filterLabel, { color: theme.subtext }]}>وسائل الراحة</Text>
              <View style={styles.chipsWrap}>
                {Object.entries(AMENITIES).map(([k, v]) => (
                  <Chip
                    key={k}
                    label={v.label}
                    selected={amenities.includes(k as AmenityKey)}
                    onPress={() => toggle(amenities, k as AmenityKey, setAmenities)}
                  />
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.applyBtn, { backgroundColor: theme.accent }]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyBtnText}>عرض النتائج{activeFilters > 0 ? ` (${activeFilters})` : ''}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      {/* الهيدر */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>استكشف العقارات</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>{filtered.length} عقار متاح</Text>
      </View>

      {/* البحث */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.subtext} style={{ marginLeft: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="ابحث بالمنطقة أو اسم الكمبوند"
            placeholderTextColor={theme.subtext}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.subtext} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: activeFilters > 0 ? theme.accent : theme.card, borderColor: theme.border }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color={activeFilters > 0 ? '#0E2240' : theme.text} />
          {activeFilters > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilters}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* الترتيب */}
      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setSort(s.key)}
            style={[
              styles.sortChip,
              {
                backgroundColor: sort === s.key ? theme.primary : theme.card,
                borderColor: sort === s.key ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={[styles.sortText, { color: sort === s.key ? '#FFF' : theme.subtext }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filterModal}

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="مفيش عقارات مطابقة"
            subtitle="جرب تعديل الفلاتر أو البحث بكلمة تانية"
            actionLabel="مسح الفلاتر"
            onAction={() => {
              resetFilters();
              setSearch('');
              setPurpose('all');
            }}
          />
        }
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetails', { id: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  title: { fontFamily: fonts.black, fontSize: 24 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  searchRow: { flexDirection: 'row-reverse', paddingHorizontal: 20, marginBottom: 10 },
  searchBar: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, paddingVertical: 0 },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: '#FFF', fontFamily: fonts.bold, fontSize: 10 },
  sortRow: { flexDirection: 'row-reverse', paddingHorizontal: 20, marginBottom: 12 },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 8,
  },
  sortText: { fontFamily: fonts.semi, fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    maxHeight: '82%',
  },
  sheetHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: { fontFamily: fonts.extra, fontSize: 18 },
  filterLabel: { fontFamily: fonts.bold, fontSize: 13, marginBottom: 8, marginTop: 6 },
  chipsWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginBottom: 6 },
  inputRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 },
  input: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.semi,
    fontSize: 14,
    textAlign: 'right',
  },
  applyBtn: { borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  applyBtnText: { color: '#0E2240', fontFamily: fonts.extra, fontSize: 15 },
});
