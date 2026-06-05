import { ScrollView, StyleSheet, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Avatar from '@/components/ui/avatar';

const STATS: Array<[string, string]> = [
  ['Films vus', '128'],
  ['Matchs', '34'],
  ['Groupes', '3'],
];

const ROWS = ['Genres préférés', 'Notifications', 'Compte & confidentialité', 'Aide'];

export default function ProfileTab() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar initial="L" color={colors.red} size={84} borderColor={colors.background} />
        <Text style={styles.name}>Léa Moreau</Text>
        <Text style={styles.email}>lea.moreau@email.com</Text>
      </View>

      <View style={styles.statsRow}>
        {STATS.map(([label, value]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {ROWS.map((row) => (
        <View key={row} style={styles.row}>
          <Text style={styles.rowLabel}>{row}</Text>
          <MaterialIcons name="chevron-right" size={18} color={colors.textFaint} />
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
    content: { padding: 22 },
    header: { alignItems: 'center', marginBottom: 22 },
    name: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 14 },
    email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    statValue: { fontSize: 26, fontWeight: '700', color: colors.text },
    statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceBorder,
    },
    rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  });
}
