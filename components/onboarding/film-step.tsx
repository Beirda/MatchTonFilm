import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { FilmPreference } from '@/types/preferences';

type Props = Readonly<{
  selected: FilmPreference[];
  onToggle: (film: FilmPreference) => void;
}>;

export default function FilmStep({ selected: _selected, onToggle: _onToggle }: Props) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [query, setQuery] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView style={styles.inner}>
        <View style={styles.header}>
          <ThemedText style={styles.eyebrow}>Étape 2 / 3</ThemedText>
          <ThemedText type="title" style={styles.title}>Des films que tu adores</ThemedText>
          <ThemedText style={styles.subtitle}>
            Choisis-en au moins 1 — on adaptera tes recommandations.
          </ThemedText>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un film…"
            placeholderTextColor={colors.textFaint}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
        </View>

        {/* TODO GH-2 : grille de films populaires + résultats de recherche TMDB */}
        <ScrollView contentContainerStyle={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            La grille de films TMDB apparaîtra ici.
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(
  colors: typeof Colors['light'] | typeof Colors['dark'],
  scheme: 'light' | 'dark'
) {
  const isDark = scheme === 'dark';
  return StyleSheet.create({
    root: { flex: 1 },
    inner: { flex: 1 },
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
    searchWrapper: {
      marginHorizontal: 22,
      marginBottom: 16,
      backgroundColor: isDark ? colors.surface2 : colors.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 16 : 4,
    },
    searchInput: {
      fontSize: 16,
      color: colors.text,
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    placeholderText: { color: colors.textFaint, fontSize: 14, textAlign: 'center' },
  });
}
