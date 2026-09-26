import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../lib/store';
import { fonts } from '../lib/theme';
import { PROPERTIES } from '../lib/properties';
import { RootStackParamList } from '../lib/navigation';
import PropertyCard from '../components/PropertyCard';
import EmptyState from '../components/EmptyState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const { theme, favorites } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const favProps = useMemo(
    () => PROPERTIES.filter((p) => favorites.includes(p.id)),
    [favorites]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>المفضلة</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          {favProps.length > 0 ? `${favProps.length} عقار محفوظ` : 'العقارات اللي تعجبك هتظهر هنا'}
        </Text>
      </View>

      <FlatList
        data={favProps}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="مفيش مفضلات لسه"
            subtitle="دوس على القلب في أي عقار عاجبك وهنحفظهولك هنا"
            actionLabel="استكشف العقارات"
            onAction={() => navigation.navigate('Main', { screen: 'Explore', params: {} })}
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  title: { fontFamily: fonts.black, fontSize: 24 },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
});
