import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    textMuted: '#687076',
    textFaint: '#9BA1A6',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surface2: '#F1F3F5',
    surface3: '#E8EAED',
    tint: '#FF3B47',
    red: '#FF3B47',
    redBright: '#FF5D67',
    redDeep: '#C4121F',
    redSoft: 'rgba(255, 59, 71, 0.10)',
    gold: '#E8A020',
    green: '#008000',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#FF3B47',
  },
  dark: {
    text: '#F6F6F9',
    textMuted: '#B6B6C2',
    textFaint: '#76767F',
    background: '#0A0A0D',
    surface: '#101015',
    surface2: '#16161D',
    surface3: '#1D1D26',
    tint: '#FF3B47',
    red: '#FF3B47',
    redBright: '#FF5D67',
    redDeep: '#C4121F',
    redSoft: 'rgba(255, 59, 71, 0.14)',
    gold: '#F4C95D',
    green: '#34D39A',
    icon: '#76767F',
    tabIconDefault: '#76767F',
    tabIconSelected: '#FF3B47',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
