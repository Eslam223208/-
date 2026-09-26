import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useApp } from '../lib/store';
import { fonts } from '../lib/theme';

export default function MatchBar({ score }: { score: number }) {
  const { theme } = useApp();
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(score, { duration: 900 });
  }, [score, w]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.subtext }]}>نسبة التطابق مع احتياجاتك</Text>
        <Text style={[styles.pct, { color: theme.accent }]}>{score}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.cardAlt }]}>
        <Animated.View style={[styles.fill, { backgroundColor: theme.accent }, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontFamily: fonts.semi, fontSize: 12 },
  pct: { fontFamily: fonts.extra, fontSize: 14 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
