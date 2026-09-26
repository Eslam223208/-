import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/store';
import { fonts } from '../lib/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  const { theme } = useApp();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={42} color={theme.accent} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.subtext }]}>{subtitle}</Text>}
      {actionLabel && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontFamily: fonts.extra, fontSize: 18, textAlign: 'center' },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  btn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#0E2240', fontFamily: fonts.bold, fontSize: 14 },
});
