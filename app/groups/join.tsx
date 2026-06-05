import { useRef, useState } from 'react';
import {
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
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CODE_LENGTH = 6;

export default function JoinGroupScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const refs = useRef<(TextInput | null)[]>([]);

  const isFull = code.every(c => c.length > 0);

  function setChar(index: number, value: string) {
    const char = value.toUpperCase().slice(-1);
    const next = [...code];
    next[index] = char;
    setCode(next);
    if (char && index < CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function onKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !code[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  async function handleJoin() {
    if (!isFull || loading) return;
    setLoading(true);
    const fullCode = code.join('');
    // TODO GH-4: supabase.from('groups').select('id').eq('invite_code', fullCode).single()
    console.log('Rejoindre le groupe avec le code:', fullCode);
    setLoading(false);
    router.back();
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
        <View style={styles.iconCircle}>
          <MaterialIcons name="link" size={30} color={colors.red} />
        </View>

        <Text style={styles.title}>Saisis le code d&apos;invitation</Text>
        <Text style={styles.body}>
          Demande le code à ton ami ou ouvre directement le lien qu&apos;il t&apos;a partagé.
        </Text>

        <View style={styles.codeGrid}>
          {code.map((c, i) => (
            <TextInput
              key={i}
              ref={el => {
                refs.current[i] = el;
              }}
              style={[styles.codeCell, c ? styles.codeCellFilled : undefined]}
              value={c}
              maxLength={1}
              autoCapitalize="characters"
              onChangeText={v => setChar(i, v)}
              onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
              selectionColor={colors.red}
            />
          ))}
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.ghostBtn, pressed && styles.ghostBtnPressed]}
          onPress={() => {
            // TODO GH-4: expo-clipboard paste + deep link parsing
          }}
        >
          <MaterialIcons name="content-copy" size={19} color={colors.text} />
          <Text style={styles.ghostBtnText}>Coller un lien d&apos;invitation</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            (!isFull || loading) && styles.primaryBtnDisabled,
            pressed && isFull && styles.primaryBtnPressed,
          ]}
          onPress={handleJoin}
          disabled={!isFull || loading}
        >
          <Text style={styles.primaryBtnText}>Rejoindre le groupe</Text>
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
      paddingTop: 10,
      paddingBottom: 24,
      alignItems: 'center',
    },

    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.redSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    body: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 20,
      marginBottom: 26,
    },

    codeGrid: { flexDirection: 'row', gap: 10, marginBottom: 28 },
    codeCell: {
      width: 44,
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor,
      backgroundColor: colors.surface,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    codeCellFilled: {
      borderColor: colors.red,
      backgroundColor: colors.redSoft,
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
      paddingVertical: 12,
      paddingHorizontal: 20,
      width: '100%',
      justifyContent: 'center',
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
