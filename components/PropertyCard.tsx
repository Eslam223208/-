import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IconName, MatchResult, Property } from '../lib/types';
import { useApp } from '../lib/store';
import { cardShadow, fonts, radius } from '../lib/theme';
import { formatPrice } from '../lib/format';
import { AMENITIES, TYPE_LABELS } from '../lib/data';
import MatchBar from './MatchBar';

interface Props {
  property: Property;
  onPress: () => void;
  match?: MatchResult;
}

function Spec({ icon, label, color }: { icon: IconName; label: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginLeft: 14 }}>
      <Ionicons name={icon} size={14} color={color} style={{ marginLeft: 4 }} />
      <Text style={{ fontFamily: fonts.semi, fontSize: 12, color }}>{label}</Text>
    </View>
  );
}

export default function PropertyCard({ property: p, onPress, match }: Props) {
  const { theme, isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(p.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: p.images[0] }} style={styles.image} contentFit="cover" transition={200} />
        {p.status && (
          <View style={[styles.badge, { backgroundColor: p.status === 'عاجل' ? theme.danger : theme.accent }]}>
            <Text style={styles.badgeText}>{p.status}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.heart, { backgroundColor: theme.overlay }]}
          onPress={() => toggleFavorite(p.id)}
          hitSlop={8}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? '#FF5A5F' : '#FFF'} />
        </TouchableOpacity>
        <View style={[styles.purposeTag, { backgroundColor: theme.card }]}>
          <Text style={[styles.purposeText, { color: theme.primary }]}>{p.purpose === 'sale' ? 'للبيع' : 'للايجار'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.accent }]}>{formatPrice(p.price, p.purpose === 'rent')}</Text>
          <Text style={[styles.type, { color: theme.subtext }]}>{TYPE_LABELS[p.type]}</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {p.title}
        </Text>
        <View style={styles.cityRow}>
          <Ionicons name="location-outline" size={14} color={theme.subtext} style={{ marginLeft: 3 }} />
          <Text style={[styles.city, { color: theme.subtext }]} numberOfLines={1}>
            {p.compound ? `${p.compound} • ${p.city}` : p.city}
          </Text>
        </View>

        <View style={[styles.specsRow, { borderTopColor: theme.border }]}>
          <Spec icon="resize-outline" label={`${p.area} م²`} color={theme.subtext} />
          {p.type !== 'land' && p.type !== 'commercial' && (
            <Spec icon="bed-outline" label={`${p.rooms} غرف`} color={theme.subtext} />
          )}
          {p.type !== 'land' && <Spec icon="water-outline" label={`${p.bathrooms} حمام`} color={theme.subtext} />}
          <Spec
            icon={p.delivery === 'ready' ? 'checkmark-circle-outline' : 'time-outline'}
            label={p.delivery === 'ready' ? 'جاهز' : 'تحت الإنشاء'}
            color={p.delivery === 'ready' ? theme.success : theme.subtext}
          />
        </View>

        {match && (
          <View style={{ marginTop: 12 }}>
            <MatchBar score={match.score} />
            {match.reasons.length > 0 && (
              <View style={styles.reasonsRow}>
                {match.reasons.slice(0, 2).map((r, i) => (
                  <View key={i} style={[styles.reasonChip, { backgroundColor: theme.accentSoft }]}>
                    <Text style={[styles.reasonText, { color: theme.text }]}>{r}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 180 },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#FFF', fontFamily: fonts.bold, fontSize: 11 },
  heart: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  purposeText: { fontFamily: fonts.bold, fontSize: 11 },
  body: { padding: 14 },
  priceRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontFamily: fonts.extra, fontSize: 19 },
  type: { fontFamily: fonts.semi, fontSize: 12 },
  title: { fontFamily: fonts.bold, fontSize: 16, marginTop: 4 },
  cityRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 },
  city: { fontFamily: fonts.regular, fontSize: 13, flexShrink: 1 },
  specsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  reasonsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', marginTop: 10 },
  reasonChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginLeft: 6, marginBottom: 4 },
  reasonText: { fontFamily: fonts.semi, fontSize: 11 },
});
