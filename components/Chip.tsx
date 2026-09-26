import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/store';
import { fonts } from '../lib/theme';
import { IconName } from '../lib/types';

interface Props {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
}

export default function Chip({ label, icon, selected, onPress }: Props) {
  const { theme } = useApp();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.accentSoft : theme.card,
          borderColor: selected ? theme.accent : theme.border,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? theme.accent : theme.subtext}
          style={{ marginLeft: 6 }}
        />
      )}
      <Text style={[styles.text, { color: selected ? theme.text : theme.subtext }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    marginLeft: 8,
    marginBottom: 8,
  },
  text: {
    fontFamily: fonts.semi,
    fontSize: 13,
  },
});
