import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/store';
import { fonts } from '../lib/theme';

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, action, onAction }: Props) {
  const { theme } = useApp();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} style={styles.action} hitSlop={8}>
          <Text style={[styles.actionText, { color: theme.accent }]}>{action}</Text>
          <Ionicons name="chevron-back" size={14} color={theme.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  title: { fontFamily: fonts.extra, fontSize: 18 },
  action: { flexDirection: 'row-reverse', alignItems: 'center' },
  actionText: { fontFamily: fonts.semi, fontSize: 13, marginLeft: 2 },
});
