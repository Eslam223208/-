export interface Theme {
  dark: boolean;
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  tabBar: string;
  overlay: string;
}

export const lightTheme: Theme = {
  dark: false,
  bg: '#F4F6F9',
  card: '#FFFFFF',
  cardAlt: '#EEF2F7',
  text: '#0E2240',
  subtext: '#5B6B82',
  border: '#E3E8F0',
  primary: '#0E2A47',
  primarySoft: '#E8EEF6',
  accent: '#C9A227',
  accentSoft: '#F8F0D8',
  success: '#0E7C66',
  danger: '#C0392B',
  tabBar: '#FFFFFF',
  overlay: 'rgba(10,25,47,0.45)',
};

export const darkTheme: Theme = {
  dark: true,
  bg: '#0A1424',
  card: '#12203A',
  cardAlt: '#1A2C4C',
  text: '#F2F6FC',
  subtext: '#93A5C0',
  border: '#22365A',
  primary: '#1B3A66',
  primarySoft: '#16294A',
  accent: '#D9B44A',
  accentSoft: '#2A2A18',
  success: '#2FBF9B',
  danger: '#E06A5B',
  tabBar: '#0F1D33',
  overlay: 'rgba(0,0,0,0.55)',
};

export const fonts = {
  regular: 'Cairo_400Regular',
  semi: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extra: 'Cairo_800ExtraBold',
  black: 'Cairo_900Black',
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28 };

export const cardShadow = {
  shadowColor: '#0E2240',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
};
