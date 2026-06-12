import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { getUserGenres, saveUserGenres } from '@/services/preferences';
import type { GenrePreference } from '@/types/preferences';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TMDB_GENRES } from '@/components/onboarding/genre-step';

export default function ProfileGenresScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();

  const [selected, setSelected] = useState<GenrePreference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getUserGenres(userId).then(genres => {
      if (active) {
        setSelected(genres);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const isSelected = (id: number) => selected.some(g => g.id === id);

  function toggle(genre: GenrePreference) {
    setSelected(prev =>
      prev.some(g => g.id === genre.id)
        ? prev.filter(g => g.id !== genre.id)
        : [...prev, genre],
    );
  }

  async function handleSave() {
    if (!userId || selected.length === 0 || saving) return;
    setSaving(true);
    setError('');
    try {
      await saveUserGenres(userId, selected);
      router.back();
    } catch {
      setError('Impossible d’enregistrer tes genres. Réessaie.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.red} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.subtitle}>
          Tes recommandations s&apos;adaptent aux genres choisis. Sélectionnes-en au moins un.
        </ThemedText>
        <View style={styles.chipRow}>
          {TMDB_GENRES.map(genre => (
            <Pressable
              key={genre.id}
              style={({ pressed }) => [
                styles.chip,
                isSelected(genre.id) && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
              onPress={() => toggle(genre)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected(genre.id) }}
              accessibilityLabel={genre.name}
            >
              <ThemedText
                style={[styles.chipText, isSelected(genre.id) && styles.chipTextSelected]}
              >
                {genre.name}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 22) }]}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            (selected.length === 0 || saving) && styles.saveBtnDisabled,
            pressed && selected.length > 0 && !saving && styles.saveBtnPressed,
          ]}
          onPress={handleSave}
          disabled={selected.length === 0 || saving}
          accessibilityRole="button"
          accessibilityState={{ disabled: selected.length === 0 || saving, busy: saving }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              Enregistrer{selected.length > 0 ? ` (${selected.length})` : ''}
            </Text>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      padding: 22,
      gap: 18,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.surfaceBorder2,
    },
    chipSelected: {
      backgroundColor: colors.redSoft,
      borderColor: colors.red,
    },
    chipPressed: {
      opacity: 0.8,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
    },
    chipTextSelected: {
      color: colors.red,
      fontWeight: '700',
    },
    footer: {
      paddingHorizontal: 22,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceBorder,
    },
    errorBox: {
      backgroundColor: colors.redSoft,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    errorText: {
      color: colors.red,
      fontSize: 14,
      textAlign: 'center',
    },
    saveBtn: {
      backgroundColor: colors.red,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveBtnDisabled: {
      opacity: 0.45,
    },
    saveBtnPressed: {
      opacity: 0.85,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
