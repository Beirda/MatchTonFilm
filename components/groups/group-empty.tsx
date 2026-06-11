import { Pressable, StyleSheet, Text, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = Readonly<{
  onCreatePress: () => void;
  onJoinPress: () => void;
}>;

function GroupEmpty({ onCreatePress, onJoinPress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <FontAwesome name="users" size={34} color={colors.red} />
      </View>
      <Text style={styles.title}>{"Aucun groupe… pour l'instant"}</Text>
      <Text style={styles.body}>
        Crée ton premier groupe et invite tes amis pour lancer une session.
      </Text>
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
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 30,
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
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginTop: 18,
      textAlign: 'center',
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: 280,
      marginTop: 8,
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.red,
      borderRadius: 999,
      paddingVertical: 16,
      paddingHorizontal: 28,
      marginTop: 22,
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
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder2,
      borderRadius: 999,
      paddingVertical: 14,
      paddingHorizontal: 28,
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
