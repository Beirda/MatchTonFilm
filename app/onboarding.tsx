import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import GenreStep from '@/components/onboarding/genre-step';
import FilmStep from '@/components/onboarding/film-step';
import RecapStep from '@/components/onboarding/recap-step';
import { saveUserPreferences } from '@/services/preferences';
import type { FilmPreference, GenrePreference } from '@/types/preferences';

const STEPS = ['genres', 'films', 'recap'] as const;
type Step = (typeof STEPS)[number];

const MIN_GENRES = 3;
const MIN_FILMS = 1;

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [step, setStep] = useState<number>(0);
  const [selectedGenres, setSelectedGenres] = useState<GenrePreference[]>([]);
  const [selectedFilms, setSelectedFilms] = useState<FilmPreference[]>([]);
  const [saving, setSaving] = useState(false);

  const currentStep: Step = STEPS[step];

  const canContinue =
    currentStep === 'genres'
      ? selectedGenres.length >= MIN_GENRES
      : currentStep === 'films'
        ? selectedFilms.length >= MIN_FILMS
        : true;

  /** Ajoute ou retire un genre de la sélection. */
  function toggleGenre(genre: GenrePreference) {
    setSelectedGenres(prev =>
      prev.some(g => g.id === genre.id)
        ? prev.filter(g => g.id !== genre.id)
        : [...prev, genre]
    );
  }

  /** Ajoute ou retire un film de la sélection. */
  function toggleFilm(film: FilmPreference) {
    setSelectedFilms(prev =>
      prev.some(f => f.tmdbId === film.tmdbId)
        ? prev.filter(f => f.tmdbId !== film.tmdbId)
        : [...prev, film]
    );
  }

  /**
   * Avance à l'étape suivante ou, à la dernière étape, sauvegarde les
   * préférences via `saveUserPreferences` et navigue vers les groupes.
   */
  async function handleContinue() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      return;
    }
    // Dernière étape : sauvegarder et naviguer
    setSaving(true);
    try {
      // TODO GH-2 : récupérer le vrai userId depuis la session Supabase
      await saveUserPreferences({ userId: 'todo-user-id', genres: selectedGenres, films: selectedFilms });
      router.replace('/(tabs)');
    } catch {
      // TODO GH-2 : afficher une erreur à l'utilisateur
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1);
  }

  const remainingLabel =
    currentStep === 'genres'
      ? `Encore ${MIN_GENRES - selectedGenres.length} à choisir`
      : `Encore ${MIN_FILMS - selectedFilms.length} à choisir`;

  return (
    <SafeAreaView style={styles.root}>
      {/* En-tête : retour + indicateur d'étapes */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={handleBack}
          disabled={step === 0}
          accessibilityLabel="Retour"
        >
          <ThemedText style={[styles.backChevron, step === 0 && styles.invisible]}>‹</ThemedText>
        </Pressable>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= step && styles.dotActive, i === step && styles.dotCurrent]}
            />
          ))}
        </View>

        <View style={styles.backBtn} />
      </View>

      {/* Contenu de l'étape courante */}
      {currentStep === 'genres' && (
        <GenreStep selected={selectedGenres} onToggle={toggleGenre} />
      )}
      {currentStep === 'films' && (
        <FilmStep genres={selectedGenres} selected={selectedFilms} onToggle={toggleFilm} />
      )}
      {currentStep === 'recap' && (
        <RecapStep genres={selectedGenres} films={selectedFilms} />
      )}

      {/* Bouton principal */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && styles.continueBtnPressed,
            (!canContinue || saving) && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue || saving}
        >
          <ThemedText style={styles.continueBtnText}>
            {saving
              ? 'Enregistrement…'
              : currentStep === 'recap'
                ? 'Découvrir mes groupes'
                : canContinue
                  ? 'Continuer'
                  : remainingLabel}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(
  colors: typeof Colors['light'] | typeof Colors['dark'],
  scheme: 'light' | 'dark'
) {
  const isDark = scheme === 'dark';
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 22,
      paddingVertical: 12,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    backBtnPressed: { opacity: 0.5 },
    backChevron: { fontSize: 30, color: colors.text, lineHeight: 36 },
    invisible: { opacity: 0 },
    dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
    },
    dotActive: { backgroundColor: colors.red },
    dotCurrent: { width: 22 },
    footer: { paddingHorizontal: 22, paddingBottom: 12 },
    continueBtn: {
      backgroundColor: colors.tint,
      borderRadius: 999,
      paddingVertical: 16,
      alignItems: 'center',
    },
    continueBtnPressed: { opacity: 0.85 },
    continueBtnDisabled: { opacity: 0.4 },
    continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
