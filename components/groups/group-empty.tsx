import { Pressable, StyleSheet, Text, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = Readonly<{
  onCreatePress: () => void;
}>;

function GroupEmpty({ onCreatePress }: Props) {
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
  });
}

export default GroupEmpty;
