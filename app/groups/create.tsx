import { useState } from 'react';
import {
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

import { Colors } from '@/constants/theme';
import { GENRES } from '@/constants/genres';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { AgeRating, GroupForm, Language } from '@/types/group-form';

const AGE_RATINGS: AgeRating[] = ['Tous', '12+', '16+', '18+'];
const LANGUAGES: Language[] = ['VF', 'VOSTFR', 'VF + VOSTFR'];

export default function CreateGroupScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [form, setForm] = useState<GroupForm>({
    name: '',
    genres: ['Science-fiction', 'Thriller'],
    ageRating: '16+',
    language: 'VF + VOSTFR',
  });
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    const prefix = form.name
      ? form.name.slice(0, 3).toUpperCase().replace(/\s/g, '')
      : 'MTF';
    const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
    setInviteCode(`CINE-${prefix}${suffix}`);
  }

  async function handleShare() {
    if (!inviteCode) return;
    await Share.share({ message: `Rejoins mon groupe MatchTonFilm avec le code : ${inviteCode}` });
  }

  async function handleSubmit() {
    if (!form.name || loading) return;
    setLoading(true);
    // TODO GH-4: supabase.from('groups').insert({ name: form.name, genres: form.genres, age_rating: form.ageRating, language: form.language, invite_code: inviteCode })
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Nom du groupe</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === 'name' && styles.inputWrapperFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Soirée pizza-ciné 🍕"
              placeholderTextColor={colors.textFaint}
              value={form.name}
              onChangeText={name => setForm(f => ({ ...f, name }))}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>

        <View style={[styles.field, { marginTop: 18 }]}>
          <Text style={styles.label}>Genres autorisés</Text>
          <View style={styles.chipRow}>
            {GENRES.slice(0, 10).map(g => (
              <Pressable
                key={g}
                style={({ pressed }) => [
                  styles.chip,
                  form.genres.includes(g) && styles.chipOn,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => toggleGenre(g)}
              >
                <Text style={[styles.chipText, form.genres.includes(g) && styles.chipTextOn]}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.field, { marginTop: 18 }]}>
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

        <View style={[styles.field, { marginTop: 18 }]}>
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

        <View
          style={[
            styles.surface,
            { marginTop: 22, borderColor: inviteCode ? colors.redLine : colors.surfaceBorder2 },
          ]}
        >
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
                    // TODO GH-4: expo-clipboard once installed
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

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (!form.name || loading) && styles.primaryBtnDisabled,
            pressed && !!form.name && styles.primaryBtnPressed,
          ]}
          onPress={handleSubmit}
          disabled={!form.name || loading}
        >
          <Text style={styles.primaryBtnText}>Lancer la session de swipe</Text>
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

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 24 },
    field: {},

    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 8,
      letterSpacing: 0.5,
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

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: cardBg,
      borderWidth: 1.5,
      borderColor,
    },
    chipOn: { backgroundColor: colors.red, borderColor: colors.red },
    chipPressed: { opacity: 0.7 },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    chipTextOn: { color: '#fff' },

    segmented: { flexDirection: 'row', gap: 8 },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: cardBg,
      borderWidth: 1.5,
      borderColor,
    },
    segmentOn: { backgroundColor: colors.red, borderColor: colors.red },
    segmentPressed: { opacity: 0.7 },
    segmentText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    segmentTextOn: { color: '#fff' },

    surface: {
      backgroundColor: cardBg,
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 16,
    },
    darkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.surface2,
      borderRadius: 12,
      paddingVertical: 14,
    },
    darkBtnPressed: { opacity: 0.7 },
    darkBtnText: { fontSize: 15, fontWeight: '700', color: colors.text },

    codeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badge: {
      backgroundColor: colors.green,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    codeText: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 2,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface2,
    },
    iconBtnPressed: { opacity: 0.7 },

    ghostBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor,
      paddingVertical: 12,
    },
    ghostBtnPressed: { opacity: 0.7 },
    ghostBtnText: { fontSize: 15, fontWeight: '600', color: colors.text },

    footer: {
      padding: 22,
      paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    },
    primaryBtn: {
      backgroundColor: colors.red,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    primaryBtnDisabled: { opacity: 0.5 },
    primaryBtnPressed: { opacity: 0.85 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
