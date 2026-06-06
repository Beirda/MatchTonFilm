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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import PosterMarquee from '@/components/auth/poster-marquee';

// Palette cinématographique de la maquette (auth = dark only).
const C = {
  bg: '#0a0a0d',
  surface: '#16161d',
  stroke: 'rgba(255,255,255,0.11)',
  text: '#f6f6f9',
  textMuted: '#b6b6c2',
  textFaint: '#76767f',
  red: '#ff3b47',
  redBright: '#ff5d67',
  redDeep: '#c4121f',
  redSoft: 'rgba(255,59,71,0.14)',
  redLine: 'rgba(255,59,71,0.32)',
  green: '#34d39a',
};

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
    <View style={styles.root}>
      <PosterMarquee />

      {/* Voile dégradé pour la lisibilité */}
      <LinearGradient
        colors={['rgba(10,10,13,0.55)', 'rgba(10,10,13,0.2)', 'rgba(10,10,13,0.86)', C.bg]}
        locations={[0, 0.3, 0.62, 0.86]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', C.redSoft]}
        style={styles.glow}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.spacer} />

            {/* Logo lockup */}
            <View style={styles.logoRow}>
              <LinearGradient
                colors={[C.redBright, C.redDeep]}
                style={styles.logoMark}
              >
                <FontAwesome name="heart" size={17} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>
                MATCH<Text style={{ color: C.red }}>TON</Text>FILM
              </Text>
            </View>

            {/* Accroche */}
            <Text style={styles.headline}>
              Arrête de débattre.{'\n'}
              <Text style={{ color: C.red }}>Swipez.</Text>
            </Text>
            <Text style={styles.body}>
              Le film parfait pour ce soir, choisi par tout le groupe en moins de cinq minutes.
            </Text>

            {/* Formulaire */}
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                  placeholder="toi@exemple.fr"
                  placeholderTextColor={C.textFaint}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mot de passe</Text>
                <TextInput
                  style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                  placeholder="••••••••"
                  placeholderTextColor={C.textFaint}
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
                onPress={handleSubmit}
                disabled={!canSubmit}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit, busy: loading }}
                style={({ pressed }) => [pressed && canSubmit && styles.primaryPressed]}
              >
                <LinearGradient
                  colors={[C.redBright, C.red]}
                  style={[styles.primaryBtn, !canSubmit && styles.primaryDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryText}>
                      {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                    </Text>
                  )}
                </LinearGradient>
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
                <Text style={styles.switchStrong}>
                  {mode === 'login' ? 'Inscris-toi' : 'Connecte-toi'}
                </Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  glow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 28 },
  spacer: { flex: 1, minHeight: 40 },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  logoText: { color: C.text, fontSize: 16, fontWeight: '800', letterSpacing: 2 },

  headline: {
    color: C.text,
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -1,
  },
  body: {
    color: C.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 320,
  },

  form: { gap: 14, marginTop: 28 },
  field: { gap: 8 },
  label: { color: C.textMuted, fontSize: 13, fontWeight: '700' },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 15 : 10,
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
  },
  inputFocused: { borderColor: C.redLine, backgroundColor: '#1a1a22' },

  errorBox: { backgroundColor: C.redSoft, borderRadius: 12, padding: 12 },
  errorText: { color: C.redBright, fontSize: 14, textAlign: 'center' },
  noticeBox: { backgroundColor: 'rgba(52,211,154,0.14)', borderRadius: 12, padding: 12 },
  noticeText: { color: C.green, fontSize: 14, textAlign: 'center' },

  primaryBtn: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: C.red,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  primaryPressed: { transform: [{ scale: 0.985 }] },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  switchBtn: { marginTop: 22, alignItems: 'center' },
  switchText: { color: C.textMuted, fontSize: 15 },
  switchStrong: { color: C.red, fontWeight: '700' },
});
