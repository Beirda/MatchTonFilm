import { StyleSheet, Text, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bonjour,';
  if (h >= 12 && h < 18) return 'Bon après-midi,';
  return 'Bonsoir,';
}

/**
 * En-tête commun aux onglets (logo + salutation personnalisée).
 * Gère lui-même le safe area haut pour que chaque écran d'onglet l'inclue
 * sans dupliquer la logique d'insets.
 */
export default function AppHeader() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { email } = useAuth();

  const displayName = email ? email.split('@')[0] : 'Vous';

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.logoRow}>
        <View style={styles.logoMarkShadow}>
          <View style={styles.logoMark}>
            <FontAwesome name="heart" size={16} color="#fff" />
            <View style={styles.logoMarkShine} />
          </View>
        </View>
        <View style={styles.greetingCol}>
          <Text style={styles.greetingSmall}>{greeting()}</Text>
          <Text style={styles.greetingName}>{displayName}</Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors: (typeof Colors)['light'] | (typeof Colors)['dark']) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 22,
      paddingBottom: 6,
      backgroundColor: colors.background,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logoMarkShadow: {
      shadowColor: colors.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 14,
      elevation: 8,
      borderRadius: 12,
    },
    logoMark: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.red,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoMarkShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    greetingCol: {
      gap: 0,
    },
    greetingSmall: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    greetingName: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
  });
}
