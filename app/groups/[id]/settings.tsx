import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { GENRES } from '@/constants/genres';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteGroup } from '@/lib/groups';
import { supabase } from '@/lib/supabase';
import { isGroupAdmin } from '@/lib/votes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { AgeRating, Language } from '@/types/group-form';

const AGE_RATINGS: AgeRating[] = ['Tous', '12+', '16+', '18+'];
const LANGUAGES: Language[] = ['VF', 'VOSTFR', 'VF + VOSTFR'];

const CODE_CHARS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';

/** Code d'invitation court : 6 caractères alphanumériques en majuscules. */
function randomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

type GroupSettings = {
  name: string;
  genres: string[];
  age_rating: AgeRating;
  language: Language;
  invitation_code: string;
};

export default function GroupSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);
  const insets = useSafeAreaInsets();

  const [admin, setAdmin] = useState<boolean | null>(null);
  const [name, setName] = useState<string>('');
  const [genres, setGenres] = useState<string[]>([]);
  const [ageRating, setAgeRating] = useState<AgeRating>('Tous');
  const [language, setLanguage] = useState<Language>('VF + VOSTFR');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [nameFocused, setNameFocused] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data }, isAdmin] = await Promise.all([
        supabase
          .from('groups')
          .select('name, genres, age_rating, language, invitation_code')
          .eq('id', id)
          .single(),
        isGroupAdmin(id),
      ]);
      if (!active) return;
      const group = data as unknown as GroupSettings | null;
      if (group) {
        setName(group.name);
        setGenres(group.genres ?? []);
        setAgeRating(group.age_rating);
        setLanguage(group.language);
        setInviteCode(group.invitation_code);
      }
      setAdmin(isAdmin);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  function toggleGenre(genre: string) {
    setGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre],
    );
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError('');
    const { error: err } = await supabase
      .from('groups')
      .update({ name: trimmed, genres, age_rating: ageRating, language })
      .eq('id', id);
    setSaving(false);
    if (err) {
      setError('Impossible d’enregistrer les paramètres. Réessaie.');
      return;
    }
    router.back();
  }

  async function handleCopyCode() {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRegenerate() {
    Alert.alert(
      "Régénérer le code d'invitation",
      "L'ancien code et les liens déjà partagés ne fonctionneront plus. Continuer ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Régénérer',
          style: 'destructive',
          onPress: async () => {
            setRegenerating(true);
            setError('');
            const code = randomCode();
            const { error: err } = await supabase
              .from('groups')
              .update({ invitation_code: code })
              .eq('id', id);
            setRegenerating(false);
            if (err) {
              setError('Impossible de régénérer le code. Réessaie.');
              return;
            }
            setInviteCode(code);
          },
        },
      ],
    );
  }

  function handleDelete() {
    Alert.alert(
      'Supprimer le groupe',
      'Cette action est définitive : le groupe, ses membres et tous les votes seront supprimés. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setError('');
            try {
              await deleteGroup(id);
            } catch {
              setDeleting(false);
              setError('Impossible de supprimer le groupe. Réessaie.');
              return;
            }
            router.dismissAll();
          },
        },
      ],
    );
  }

  if (loading || admin === null) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.red} />
      </ThemedView>
    );
  }

  if (!admin) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.lockIconWrap}>
          <MaterialIcons name="lock-outline" size={30} color={colors.red} />
        </View>
        <ThemedText type="subtitle">Réservé à l&apos;admin</ThemedText>
        <ThemedText style={styles.lockText}>
          Seul l&apos;administrateur du groupe peut modifier ses paramètres.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.label}>Nom du groupe</ThemedText>
          <TextInput
            style={[styles.input, nameFocused && styles.inputFocused]}
            value={name}
            onChangeText={setName}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder="Soirée Coloc"
            placeholderTextColor={colors.textFaint}
            maxLength={40}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Genres autorisés</ThemedText>
          <View style={styles.chipRow}>
            {GENRES.map(genre => {
              const on = genres.includes(genre);
              return (
                <Pressable
                  key={genre}
                  style={({ pressed }) => [
                    styles.chip,
                    on && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => toggleGenre(genre)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={genre}
                >
                  <Text style={[styles.chipText, on && styles.chipTextSelected]}>{genre}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Classification d&apos;âge</ThemedText>
          <View style={styles.segmentRow}>
            {AGE_RATINGS.map(rating => (
              <Pressable
                key={rating}
                style={[styles.segment, ageRating === rating && styles.segmentSelected]}
                onPress={() => setAgeRating(rating)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ageRating === rating }}
              >
                <Text
                  style={[styles.segmentText, ageRating === rating && styles.segmentTextSelected]}
                >
                  {rating}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Langue</ThemedText>
          <View style={styles.segmentRow}>
            {LANGUAGES.map(lang => (
              <Pressable
                key={lang}
                style={[styles.segment, language === lang && styles.segmentSelected]}
                onPress={() => setLanguage(lang)}
                accessibilityRole="radio"
                accessibilityState={{ selected: language === lang }}
              >
                <Text style={[styles.segmentText, language === lang && styles.segmentTextSelected]}>
                  {lang}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Lien d&apos;invitation</ThemedText>
          <View style={styles.codeBlock}>
            <ThemedText style={styles.code}>{inviteCode}</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              onPress={handleCopyCode}
              accessibilityRole="button"
              accessibilityLabel="Copier le code d'invitation"
            >
              <MaterialIcons
                name={copied ? 'check' : 'content-copy'}
                size={19}
                color={copied ? colors.green : colors.text}
              />
            </Pressable>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.regenBtn,
              (pressed || regenerating) && styles.regenBtnPressed,
            ]}
            onPress={handleRegenerate}
            disabled={regenerating}
            accessibilityRole="button"
            accessibilityLabel="Régénérer le code d'invitation"
            accessibilityHint="Invalide l'ancien code et les liens déjà partagés"
          >
            {regenerating ? (
              <ActivityIndicator size="small" color={colors.red} />
            ) : (
              <>
                <MaterialIcons name="autorenew" size={18} color={colors.red} />
                <Text style={styles.regenText}>Régénérer le code</Text>
              </>
            )}
          </Pressable>
          <ThemedText style={styles.hint}>
            Régénérer invalide l&apos;ancien code : les liens déjà partagés ne permettront plus de
            rejoindre le groupe.
          </ThemedText>
        </View>

        <View style={[styles.section, styles.dangerSection]}>
          <ThemedText style={[styles.label, styles.dangerLabel]}>Zone de danger</ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.deleteBtn,
              (pressed || deleting) && styles.deleteBtnPressed,
            ]}
            onPress={handleDelete}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Supprimer le groupe"
            accessibilityHint="Supprime définitivement le groupe, ses membres et ses votes"
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.red} />
            ) : (
              <>
                <MaterialIcons name="delete-outline" size={18} color={colors.red} />
                <Text style={styles.deleteText}>Supprimer le groupe</Text>
              </>
            )}
          </Pressable>
          <ThemedText style={styles.hint}>
            Le groupe sera supprimé pour tous les membres. Cette action est irréversible.
          </ThemedText>
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
            (!name.trim() || saving) && styles.saveBtnDisabled,
            pressed && name.trim().length > 0 && !saving && styles.saveBtnPressed,
          ]}
          onPress={handleSave}
          disabled={!name.trim() || saving}
          accessibilityRole="button"
          accessibilityState={{ disabled: !name.trim() || saving, busy: saving }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
      paddingHorizontal: 32,
      gap: 8,
      backgroundColor: colors.background,
    },
    lockIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
      marginBottom: 6,
    },
    lockText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    scroll: {
      padding: 22,
      gap: 22,
    },
    section: {
      gap: 10,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.surfaceBorder2,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.red,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
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
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    chipTextSelected: {
      color: colors.red,
      fontWeight: '700',
    },
    segmentRow: {
      flexDirection: 'row',
      gap: 8,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 11,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.surfaceBorder2,
    },
    segmentSelected: {
      backgroundColor: colors.redSoft,
      borderColor: colors.red,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    segmentTextSelected: {
      color: colors.red,
      fontWeight: '700',
    },
    codeBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    code: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: 4,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceBorder,
      borderWidth: 1,
      borderColor: colors.surfaceBorder2,
    },
    iconBtnPressed: {
      opacity: 0.7,
    },
    regenBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.redLine,
      backgroundColor: colors.redSoft,
      paddingVertical: 12,
    },
    regenBtnPressed: {
      opacity: 0.7,
    },
    regenText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.red,
    },
    hint: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.textFaint,
    },
    dangerSection: {
      marginTop: 4,
      paddingTop: 22,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceBorder,
    },
    dangerLabel: {
      color: colors.red,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.red,
      backgroundColor: colors.redSoft,
      paddingVertical: 13,
    },
    deleteBtnPressed: {
      opacity: 0.7,
    },
    deleteText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.red,
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
