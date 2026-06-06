import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { GENRES } from '@/constants/genres';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import type { AgeRating, GroupForm, Language } from '@/types/group-form';

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

export default function CreateGroupScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, colorScheme);

  const [form, setForm] = useState<GroupForm>({
    name: '',
    genres: [GENRES[4], GENRES[5]],
    ageRating: '16+',
    language: 'VF + VOSTFR',
  });
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  function toggleGenre(genre: string) {
    setForm(f => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter(g => g !== genre)
        : [...f.genres, genre],
    }));
  }

  function generateCode() {
    setInviteCode(randomCode());
  }

  async function handleShare() {
    if (!inviteCode) return;
    await Share.share({ message: `Rejoins mon groupe MatchTonFilm avec le code : ${inviteCode}` });
  }

  async function handleSubmit() {
    if (!form.name.trim() || loading) return;
    setLoading(true);
    setError('');
    const code = inviteCode ?? randomCode();
    if (!inviteCode) setInviteCode(code);
    try {
      const { data, error: err } = await supabase.rpc('create_group', {
        p_name: form.name.trim(),
        p_genres: form.genres,
        p_age_rating: form.ageRating,
        p_language: form.language,
        p_code: code,
      });
      if (err) throw err;
      router.replace(`/groups/${data as string}`);
    } catch {
      setError('Impossible de créer le groupe. Réessaie.');
    } finally {
      setLoading(false);
    }
  }

  const hasCode = inviteCode !== null;
  const footerPaddingBottom = Math.max(insets.bottom, 22);

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
        {/* Nom */}
        <View style={styles.field}>
          <Text style={styles.label}>Nom du groupe</Text>
          <View style={[styles.inputWrapper, focusedField === 'name' && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.input}
              placeholder="Soirée pizza-ciné 🍕"
              placeholderTextColor={colors.textFaint}
              value={form.name}
              onChangeText={name => setForm(f => ({ ...f, name }))}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="done"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Genres */}
        <View style={styles.field}>
          <Text style={styles.label}>Genres autorisés</Text>
          <View style={styles.chipRow}>
            {GENRES.slice(0, 10).map(g => {
              const active = form.genres.includes(g);
              return (
                <Pressable
                  key={g}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipOn,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => toggleGenre(g)}
                >
                  {active && (
                    <MaterialIcons name="check" size={13} color="#fff" style={{ marginRight: 3 }} />
                  )}
                  <Text style={[styles.chipText, active && styles.chipTextOn]}>{g}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Classification d'âge */}
        <View style={styles.field}>
          <Text style={styles.label}>Classification d&apos;âge</Text>
          <View style={styles.segmented}>
            {AGE_RATINGS.map(a => (
              <Pressable
                key={a}
                style={({ pressed }) => [
                  styles.segment,
                  form.ageRating === a && styles.segmentOn,
                  pressed && styles.segmentPressed,
                ]}
                onPress={() => setForm(f => ({ ...f, ageRating: a }))}
              >
                <Text style={[styles.segmentText, form.ageRating === a && styles.segmentTextOn]}>
                  {a}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Langue */}
        <View style={styles.field}>
          <Text style={styles.label}>Langue</Text>
          <View style={styles.segmented}>
            {LANGUAGES.map(l => (
              <Pressable
                key={l}
                style={({ pressed }) => [
                  styles.segment,
                  form.language === l && styles.segmentOn,
                  pressed && styles.segmentPressed,
                ]}
                onPress={() => setForm(f => ({ ...f, language: l }))}
              >
                <Text style={[styles.segmentText, form.language === l && styles.segmentTextOn]}>
                  {l}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bloc invitation */}
        <View style={[styles.surface, hasCode ? styles.surfaceActive(isDark) : undefined]}>
          {!inviteCode ? (
            <Pressable
              style={({ pressed }) => [styles.darkBtn, pressed && styles.darkBtnPressed]}
              onPress={generateCode}
            >
              <MaterialIcons name="link" size={20} color={colors.text} />
              <Text style={styles.darkBtnText}>Générer un lien d&apos;invitation</Text>
            </Pressable>
          ) : (
            <View style={{ gap: 12 }}>
              <View style={styles.codeHeader}>
                <Text style={styles.label}>Code du groupe</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Actif</Text>
                </View>
              </View>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>{inviteCode}</Text>
                <Pressable
                  style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                  onPress={() => {
                    // TODO GH-4: expo-clipboard once installed — npx expo install expo-clipboard
                  }}
                >
                  <MaterialIcons name="content-copy" size={18} color={colors.text} />
                </Pressable>
              </View>
              <Pressable
                style={({ pressed }) => [styles.ghostBtn, pressed && styles.ghostBtnPressed]}
                onPress={handleShare}
              >
                <MaterialIcons name="share" size={19} color={colors.text} />
                <Text style={styles.ghostBtnText}>Partager le lien</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (!form.name.trim() || loading) && styles.primaryBtnDisabled,
            pressed && !!form.name.trim() && !loading && styles.primaryBtnPressed,
          ]}
          onPress={handleSubmit}
          disabled={!form.name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Lancer la session de swipe</Text>
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
  const cardBg = colors.surface;
  const borderColor = colors.surfaceBorder2;

  return {
    ...StyleSheet.create({
      root: { flex: 1, backgroundColor: colors.background },
      scroll: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 32, gap: 18 },
      field: { gap: 8 },
      divider: { height: 1, backgroundColor: colors.surfaceBorder },

      label: {
        fontSize: 12,
        fontWeight: '700' as const,
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
      },

      inputWrapper: {
        backgroundColor: cardBg,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 16 : 4,
      },
      inputWrapperFocused: { borderColor: colors.red },
      input: { fontSize: 16, color: colors.text },

      chipRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
      chip: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: cardBg,
        borderWidth: 1.5,
        borderColor,
      },
      chipOn: { backgroundColor: colors.red, borderColor: colors.red },
      chipPressed: { opacity: 0.7 },
      chipText: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
      chipTextOn: { color: '#fff' },

      segmented: { flexDirection: 'row' as const, gap: 8 },
      segment: {
        flex: 1,
        alignItems: 'center' as const,
        paddingVertical: 11,
        borderRadius: 12,
        backgroundColor: cardBg,
        borderWidth: 1.5,
        borderColor,
      },
      segmentOn: { backgroundColor: colors.red, borderColor: colors.red },
      segmentPressed: { opacity: 0.7 },
      segmentText: { fontSize: 13, fontWeight: '700' as const, color: colors.textMuted },
      segmentTextOn: { color: '#fff' },

      surface: {
        backgroundColor: cardBg,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor,
        padding: 16,
      },
      darkBtn: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: 8,
        backgroundColor: colors.surface2,
        borderRadius: 12,
        paddingVertical: 14,
      },
      darkBtnPressed: { opacity: 0.7 },
      darkBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.text },

      codeHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
      badge: {
        backgroundColor: colors.green,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      },
      badgeText: { fontSize: 11, fontWeight: '700' as const, color: '#fff', letterSpacing: 0.5 },
      codeRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
      codeText: { fontSize: 22, fontWeight: '800' as const, color: colors.text, letterSpacing: 3 },
      iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: colors.surface2,
      },
      iconBtnPressed: { opacity: 0.7 },
      ghostBtn: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor,
        paddingVertical: 12,
      },
      ghostBtnPressed: { opacity: 0.7 },
      ghostBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.text },

      footer: {
        paddingHorizontal: 22,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
      },
      primaryBtn: {
        backgroundColor: colors.red,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center' as const,
      },
      primaryBtnDisabled: { opacity: 0.45 },
      primaryBtnPressed: { opacity: 0.85 },
      primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
      errorBox: {
        backgroundColor: colors.redSoft,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
      },
      errorText: { color: colors.red, fontSize: 14, textAlign: 'center' as const },
    }),
    surfaceActive: (dark: boolean) => ({
      borderColor: colors.redLine,
      shadowColor: colors.red,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: dark ? 0.35 : 0.18,
      shadowRadius: 12,
      elevation: 6,
    }),
  };
}
