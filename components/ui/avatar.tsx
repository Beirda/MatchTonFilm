import { StyleSheet, Text, View } from 'react-native';

type Props = Readonly<{
  initial: string;
  color: string;
  size?: number;
  borderColor?: string;
}>;

function Avatar({ initial, color, size = 34, borderColor = '#101015' }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderColor,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  text: {
    color: '#fff',
    fontWeight: '800',
  },
});

export default Avatar;
