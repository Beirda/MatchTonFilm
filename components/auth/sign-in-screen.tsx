import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';

function messageFor(raw: string): string {
  if (raw.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (raw.includes('already registered')) return 'Un compte existe déjà avec cet email.';
  if (raw.includes('Password should be')) return 'Le mot de passe doit faire au moins 6 caractères.';
  if (raw.includes('is invalid') || raw.includes('valid email')) return 'Adresse email invalide.';
  if (raw.includes('Email not confirmed')) return 'Confirme ton email avant de te connecter.';
  if (raw.includes('rate limit')) return 'Trop de tentatives. Réessaie dans quelques minutes.';
  return 'Une erreur est survenue. Réessaie.';
}

export default function SignInScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        if (!data.session) {
          setNotice('Compte créé. Vérifie tes emails pour confirmer ton inscription.');
        }
      }
    } catch (e) {
      setError(messageFor(e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(m => (m === 'login' ? 'signup' : 'login'));
    setError('');
    setNotice('');
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoMark}>
            <FontAwesome name="heart" size={26} color="#fff" />
            <View style={styles.logoMarkShine} />
          </View>
          <Text style={styles.brand}>MatchTonFilm</Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Connecte-toi pour retrouver tes groupes.'
              : 'Crée ton compte pour commencer à matcher.'}
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="toi@exemple.fr"
                  placeholderTextColor={colors.textFaint}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="next"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textFaint}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {notice ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>{notice}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && canSubmit && styles.primaryBtnPressed,
                !canSubmit && styles.primaryBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit, busy: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.switchBtn}
            onPress={switchMode}
            disabled={loading}
            accessibilityRole="button"
          >
            <Text style={styles.switchText}>
              {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
              <Text style={styles.switchTextStrong}>
                {mode === 'login' ? 'Inscris-toi' : 'Connecte-toi'}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  scheme: 'light' | 'dark'
) {
  const isDark = scheme === 'dark';
  const borderColor = colors.surfaceBorder2;

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 40,
    },

    logoMark: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: colors.red,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 20,
      shadowColor: colors.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
      overflow: 'hidden',
    },
    logoMarkShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    brand: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 32,
      lineHeight: 20,
    },

    form: { gap: 16 },
    field: { gap: 8 },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    inputWrapper: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 16 : 4,
    },
    inputWrapperFocused: { borderColor: colors.red },
    input: { fontSize: 16, color: colors.text },

    errorBox: {
      backgroundColor: colors.redSoft,
      borderRadius: 10,
      padding: 12,
    },
    errorText: { color: colors.red, fontSize: 14, textAlign: 'center' },
    noticeBox: {
      backgroundColor: isDark ? 'rgba(52,211,154,0.14)' : 'rgba(0,128,0,0.10)',
      borderRadius: 10,
      padding: 12,
    },
    noticeText: { color: colors.green, fontSize: 14, textAlign: 'center' },

    primaryBtn: {
      backgroundColor: colors.red,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 4,
    },
    primaryBtnPressed: { opacity: 0.85 },
    primaryBtnDisabled: { opacity: 0.45 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    switchBtn: { marginTop: 24, alignItems: 'center' },
    switchText: { fontSize: 14, color: colors.textMuted },
    switchTextStrong: { color: colors.red, fontWeight: '700' },
  });
}
