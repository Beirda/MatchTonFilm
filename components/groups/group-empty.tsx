import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS: { icon: 'group-add' | 'link' | 'favorite'; title: string; body: string }[] = [
  {
    icon: 'group-add',
    title: 'Crée ton groupe',
    body: "Choisis les genres, la classification d'âge et la langue.",
  },
  {
    icon: 'link',
    title: 'Invite tes amis',
    body: "Partage le code ou le lien d'invitation en un tap.",
  },
  {
    icon: 'favorite',
    title: 'Swipez, matchez',
    body: 'Chacun vote, le film gagnant s’impose de lui-même.',
  },
];

type Props = Readonly<{
  onCreatePress: () => void;
  onJoinPress: () => void;
}>;

function GroupEmpty({ onCreatePress, onJoinPress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <FontAwesome name="film" size={32} color={colors.red} />
        </View>
        <Text style={styles.title}>{"Aucun groupe… pour l'instant"}</Text>
        <Text style={styles.body}>
          Crée ton premier groupe et invite tes amis pour lancer une soirée ciné sans débat.
        </Text>
      </View>

      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <Animated.View
            key={step.title}
            entering={FadeInDown.delay(i * 80).springify()}
            style={styles.stepCard}
          >
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{i + 1}</Text>
            </View>
            <View style={styles.stepIconWrap}>
              <MaterialIcons name={step.icon} size={20} color={colors.red} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>{step.body}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={onCreatePress}
        >
          <FontAwesome name="plus" size={18} color="#fff" />
          <Text style={styles.btnText}>Créer un groupe</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.joinBtn, pressed && styles.joinBtnPressed]}
          onPress={onJoinPress}
        >
          <FontAwesome name="link" size={16} color={colors.text} />
          <Text style={styles.joinBtnText}>J&apos;ai un code d&apos;invitation</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  scheme: 'light' | 'dark',
) {
  const isDark = scheme === 'dark';
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 30,
      gap: 26,
    },
    hero: {
      alignItems: 'center',
    },
    iconWrap: {
      width: 84,
      height: 84,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
      shadowColor: colors.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.18,
      shadowRadius: 18,
      elevation: 6,
    },
    title: {
      fontSize: 23,
      fontWeight: '800',
      color: colors.text,
      marginTop: 18,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: 300,
      marginTop: 8,
    },
    steps: {
      gap: 10,
    },
    stepCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 16,
      padding: 14,
    },
    stepBadge: {
      position: 'absolute',
      top: -7,
      left: -7,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.red,
      zIndex: 2,
    },
    stepBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
    },
    stepIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
    },
    stepText: {
      flex: 1,
      gap: 2,
    },
    stepTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    stepBody: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
    },
    actions: {
      alignItems: 'center',
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.red,
      borderRadius: 999,
      paddingVertical: 16,
      alignSelf: 'stretch',
      shadowColor: colors.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
    btnPressed: {
      opacity: 0.85,
    },
    btnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    joinBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder2,
      borderRadius: 999,
      paddingVertical: 14,
      alignSelf: 'stretch',
      marginTop: 12,
    },
    joinBtnPressed: {
      opacity: 0.7,
    },
    joinBtnText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}

export default GroupEmpty;
