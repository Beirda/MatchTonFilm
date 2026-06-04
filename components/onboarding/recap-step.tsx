import { ScrollView, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { FilmPreference, GenrePreference } from '@/types/preferences';

type Props = Readonly<{
  genres: GenrePreference[];
  films: FilmPreference[];
}>;

export default function RecapStep({ genres, films }: Props) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.eyebrow}>Étape 3 / 3</ThemedText>
          <ThemedText type="title" style={styles.title}>Tout est prêt ✓</ThemedText>
          <ThemedText style={styles.subtitle}>
            On a ce qu'il faut pour te proposer les bons films.
          </ThemedText>
        </View>

        {/* Récap genres */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardLabel}>Genres sélectionnés</ThemedText>
            <ThemedText style={styles.cardCount}>{genres.length}</ThemedText>
          </View>
          <View style={styles.chipRow}>
            {genres.slice(0, 6).map(genre => (
              <View key={genre.id} style={styles.chip}>
                <ThemedText style={styles.chipText}>{genre.name}</ThemedText>
              </View>
            ))}
            {genres.length > 6 && (
              <View style={styles.chip}>
                <ThemedText style={styles.chipText}>+{genres.length - 6}</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Récap films */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardLabel}>Films aimés</ThemedText>
            <ThemedText style={styles.cardCount}>{films.length}</ThemedText>
          </View>
          {/* TODO GH-2 : afficher les miniatures des affiches sélectionnées */}
          <ThemedText style={styles.placeholderText}>
            {films.length === 0
              ? 'Aucun film sélectionné.'
              : `${films.length} film${films.length > 1 ? 's' : ''} mémorisé${films.length > 1 ? 's' : ''}.`}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function makeStyles(
  colors: typeof Colors['light'] | typeof Colors['dark'],
  scheme: 'light' | 'dark'
) {
  const isDark = scheme === 'dark';
  const cardBg = isDark ? colors.surface : colors.surface;
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingBottom: 16 },
    header: { paddingHorizontal: 22, paddingBottom: 20, gap: 8 },
    eyebrow: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: colors.red,
    },
    title: { fontSize: 28, fontWeight: '700', lineHeight: 32, color: colors.text },
    subtitle: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
    card: {
      marginHorizontal: 22,
      backgroundColor: cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor,
      padding: 18,
      gap: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
    cardCount: { fontSize: 14, fontWeight: '800', color: colors.text },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,59,71,0.32)' : colors.red,
    },
    chipText: { fontSize: 12, fontWeight: '700', color: colors.text },
    placeholderText: { fontSize: 14, color: colors.textFaint },
  });
}
