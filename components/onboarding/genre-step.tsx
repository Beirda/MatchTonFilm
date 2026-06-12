import { ScrollView, Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { GenrePreference } from '@/types/preferences';

// TODO GH-2 : remplacer par un appel à TMDBClient.getGenres({ language: 'fr-FR' })
export const TMDB_GENRES: GenrePreference[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Aventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comédie' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentaire' },
  { id: 18, name: 'Drame' },
  { id: 10751, name: 'Famille' },
  { id: 14, name: 'Fantaisie' },
  { id: 36, name: 'Histoire' },
  { id: 27, name: 'Horreur' },
  { id: 10402, name: 'Musique' },
  { id: 9648, name: 'Mystère' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science-Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerre' },
  { id: 37, name: 'Western' },
];

type Props = Readonly<{
  selected: GenrePreference[];
  onToggle: (genre: GenrePreference) => void;
}>;

export default function GenreStep({ selected, onToggle }: Props) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const isSelected = (id: number) => selected.some(g => g.id === id);

  return (
    <ThemedView style={styles.root}>
      <View style={styles.header}>
        <ThemedText style={styles.eyebrow}>Étape 1 / 3</ThemedText>
        <ThemedText type="title" style={styles.title}>Tes genres préférés</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choisis-en au moins 3 pour calibrer tes recommandations.
        </ThemedText>
      </View>
      <ScrollView
        contentContainerStyle={styles.chipRow}
        showsVerticalScrollIndicator={false}
      >
        {TMDB_GENRES.map(genre => (
          <Pressable
            key={genre.id}
            style={({ pressed }) => [
              styles.chip,
              isSelected(genre.id) && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
            onPress={() => onToggle(genre)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected(genre.id) }}
            accessibilityLabel={genre.name}
          >
            <ThemedText style={[styles.chipText, isSelected(genre.id) && styles.chipTextSelected]}>
              {genre.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

function makeStyles(
  colors: typeof Colors['light'] | typeof Colors['dark'],
  scheme: 'light' | 'dark'
) {
  const isDark = scheme === 'dark';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  return StyleSheet.create({
    root: { flex: 1 },
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
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 22,
      gap: 10,
      paddingBottom: 16,
    },
    chip: {
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: 999,
      backgroundColor: isDark ? colors.surface2 : colors.surface,
      borderWidth: 1,
      borderColor,
    },
    chipSelected: {
      backgroundColor: colors.redSoft,
      borderColor: isDark ? 'rgba(255,59,71,0.32)' : colors.red,
    },
    chipPressed: { opacity: 0.75 },
    chipText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
    chipTextSelected: { color: colors.text },
  });
}
