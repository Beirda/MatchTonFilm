import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import ActivityTab from '@/components/groups/activity-tab';
import ProfileTab from '@/components/groups/profile-tab';
import GroupsList from '@/components/groups';

type Tab = 'home' | 'activity' | 'profile';

const NAV_ITEMS: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Groupes' },
  { key: 'activity', label: 'Activité' },
  { key: 'profile', label: 'Profil' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bonjour,';
  if (h >= 12 && h < 18) return 'Bon après-midi,';
  return 'Bonsoir,';
}

function NavIcon({ name, color }: { name: Tab; color: string }) {
  const size = 23;
  if (name === 'home') return <MaterialIcons name="home" size={size} color={color} />;
  if (name === 'activity') return <MaterialIcons name="flash-on" size={size} color={color} />;
  return <MaterialIcons name="person" size={size} color={color} />;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);
  const insets = useSafeAreaInsets();
  const { email } = useAuth();
  const [tab, setTab] = useState<Tab>('home');

  const displayName = email ? email.split('@')[0] : 'Vous';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
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

      {tab === 'home' && (
        <GroupsList
          onCreatePress={() => router.push('/groups/create')}
          onJoinPress={() => router.push('/groups/join')}
        />
      )}
      {tab === 'activity' && <ActivityTab />}
      {tab === 'profile' && <ProfileTab />}

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {NAV_ITEMS.map(({ key, label }) => (
          <Pressable key={key} style={styles.navItem} onPress={() => setTab(key)}>
            <NavIcon name={key} color={tab === key ? colors.red : colors.textFaint} />
            <Text style={[styles.navLabel, tab === key && { color: colors.red }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 22,
      paddingTop: 8,
      paddingBottom: 6,
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
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceBorder,
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    navLabel: {
      fontSize: 10.5,
      fontWeight: '700',
      letterSpacing: 0.3,
      color: colors.textFaint,
    },
  });
}
