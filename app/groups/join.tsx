import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
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
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

const CODE_LENGTH = 6;
const CODE_RE = /^[A-Z0-9]{6}$/;

/** Extrait le code d'un texte collé : lien isolé, ou message de partage complet (texte + lien). */
function parseInviteCode(text: string): string | null {
  const urlMatch = text.match(/\S*:\/\/\S+/);
  try {
    const { queryParams } = Linking.parse(urlMatch ? urlMatch[0] : text);
    const raw = queryParams?.code;
    if (typeof raw === 'string') {
      const upper = raw.toUpperCase();
      if (CODE_RE.test(upper)) return upper;
    }
  } catch {
    // pas une URL exploitable, on retente via une recherche directe ci-dessous
  }
  const codeMatch = text.match(/code=([A-Za-z0-9]{6})\b/i);
  if (codeMatch) {
    const upper = codeMatch[1].toUpperCase();
    if (CODE_RE.test(upper)) return upper;
  }
  return null;
}

export default function JoinGroupScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, colorScheme);

  const { code: linkCode } = useLocalSearchParams<{ code?: string }>();
  const isFromLink = typeof linkCode === 'string' && CODE_RE.test(linkCode.toUpperCase());

  const [code, setCode] = useState<string[]>(() =>
    isFromLink
      ? (linkCode as string).toUpperCase().split('')
      : Array(CODE_LENGTH).fill(''),
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const refs = useRef<(TextInput | null)[]>([]);

  const isFull = code.every(c => c.length > 0);

  // Auto-join une seule fois au montage si le code provient d'un lien d'invitation.
  useEffect(() => {
    if (isFromLink) {
      joinWithCode((linkCode as string).toUpperCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setChar(index: number, value: string) {
    if (value.length > 1) {
      const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH - index);
      const next = [...code];
      chars.split('').forEach((c, j) => { next[index + j] = c; });
      setCode(next);
      const lastFilled = Math.min(index + chars.length - 1, CODE_LENGTH - 1);
      if (lastFilled === CODE_LENGTH - 1) Keyboard.dismiss();
      else refs.current[lastFilled + 1]?.focus();
      return;
    }
    const char = value.toUpperCase().slice(-1);
    const next = [...code];
    next[index] = char;
    setCode(next);
    if (char && index < CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    } else if (char && index === CODE_LENGTH - 1) {
      Keyboard.dismiss();
    }
  }

  function onKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !code[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  async function joinWithCode(codeStr: string) {
    if (codeStr.length < CODE_LENGTH || loading) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase.rpc('join_group', {
        p_code: codeStr,
      });
      if (err) throw err;
      if (!data) {
        setError("Ce code d'invitation est invalide.");
        return;
      }
      router.replace(`/groups/${data as string}`);
    } catch {
      setError('Impossible de rejoindre le groupe. Réessaie.');
    } finally {
      setLoading(false);
    }
  }

  function handleJoin() {
    joinWithCode(code.join('').toUpperCase());
  }

  async function handlePasteLink() {
    setError('');
    const text = await Clipboard.getStringAsync();
    if (!text) {
      setError('Aucun contenu dans le presse-papier.');
      return;
    }
    const parsed = parseInviteCode(text);
    if (!parsed) {
      setError("Ce lien d'invitation est invalide.");
      return;
    }
    setCode(parsed.split(''));
    Keyboard.dismiss();
    await joinWithCode(parsed);
  }

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
        <View style={styles.iconCircle}>
          <MaterialIcons name="link" size={30} color={colors.red} />
        </View>

        <Text style={styles.title}>Saisis le code d&apos;invitation</Text>
        <Text style={styles.body}>
          Demande le code à ton ami ou ouvre directement le lien qu&apos;il t&apos;a partagé.
        </Text>

        {isFromLink && (
          <View style={styles.linkBanner}>
            <MaterialIcons name="check-circle" size={16} color={colors.green} />
            <Text style={styles.linkBannerText}>Code rempli depuis ton lien d&apos;invitation</Text>
          </View>
        )}

        <View style={styles.codeGrid}>
          {code.map((c, i) => (
            <TextInput
              key={i}
              ref={el => {
                refs.current[i] = el;
              }}
              style={[
                styles.codeCell,
                c ? styles.codeCellFilled : undefined,
                focusedIndex === i && styles.codeCellFocused,
              ]}
              value={c}
              maxLength={1}
              autoCapitalize="characters"
              autoFocus={i === 0 && !isFromLink}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              onChangeText={v => setChar(i, v)}
              onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
              selectionColor={colors.red}
              accessibilityLabel={`Caractère ${i + 1} sur ${CODE_LENGTH} du code`}
            />
          ))}
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.ghostBtn,
            loading && styles.ghostBtnDisabled,
            pressed && !loading && styles.ghostBtnPressed,
          ]}
          onPress={handlePasteLink}
          disabled={loading}
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
        >
          <MaterialIcons name="content-copy" size={19} color={colors.text} />
          <Text style={styles.ghostBtnText}>Coller un lien d&apos;invitation</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (!isFull || loading) && styles.primaryBtnDisabled,
            pressed && isFull && !loading && styles.primaryBtnPressed,
          ]}
          onPress={handleJoin}
          disabled={!isFull || loading}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isFull || loading, busy: loading }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Rejoindre le groupe</Text>
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
  const borderColor = colors.surfaceBorder2;

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: {
      paddingHorizontal: 22,
      paddingTop: 32,
      paddingBottom: 24,
      alignItems: 'center',
    },

    iconCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.redSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      shadowColor: colors.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 6,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
      letterSpacing: -0.3,
    },
    body: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 21,
      marginBottom: 32,
    },

    linkBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.redSoft,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
      marginBottom: 20,
    },
    linkBannerText: { fontSize: 12.5, fontWeight: '700', color: colors.text },

    codeGrid: { flexDirection: 'row', gap: 10, marginBottom: 32 },
    codeCell: {
      width: 44,
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor,
      backgroundColor: colors.surface,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    codeCellFilled: {
      borderColor: colors.red,
      backgroundColor: colors.redSoft,
      color: colors.red,
    },
    codeCellFocused: {
      borderColor: colors.red,
      borderWidth: 2,
    },

    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      marginBottom: 16,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: borderColor },
    dividerText: { fontSize: 13, fontWeight: '600', color: colors.textFaint },

    ghostBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor,
      paddingVertical: 13,
      paddingHorizontal: 20,
      width: '100%',
      justifyContent: 'center',
    },
    ghostBtnPressed: { opacity: 0.7 },
    ghostBtnDisabled: { opacity: 0.45 },
    ghostBtnText: { fontSize: 15, fontWeight: '600', color: colors.text },

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
      alignItems: 'center',
    },
    primaryBtnDisabled: { opacity: 0.45 },
    primaryBtnPressed: { opacity: 0.85 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    errorBox: {
      backgroundColor: colors.redSoft,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    errorText: { color: colors.red, fontSize: 14, textAlign: 'center' },
  });
}
