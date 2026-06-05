import { ScrollView, StyleSheet, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ActivityItem = {
  text: string;
  sub: string;
  icon: 'favorite' | 'group' | 'star' | 'flash-on';
};

const ITEMS: ActivityItem[] = [
  { text: 'Drive a matché dans Ciné Couple', sub: 'Il y a 1 h', icon: 'favorite' },
  { text: 'Tom a rejoint Soirée Coloc', sub: 'Il y a 2 h', icon: 'group' },
  { text: 'Nouvelle session lancée', sub: 'Hier', icon: 'flash-on' },
  { text: 'Parasite élu film gagnant', sub: 'Il y a 2 j', icon: 'star' },
];

export default function ActivityTab() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Activité</Text>
      {ITEMS.map((item, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.iconWrap}>
            <MaterialIcons name={item.icon} size={18} color={colors.red} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.label}>{item.text}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: { flex: 1 },
    content: { padding: 22, gap: 10 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 14,
      padding: 15,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
    },
    textCol: { flex: 1 },
    label: { fontSize: 14, fontWeight: '700', color: colors.text },
    sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  });
}
