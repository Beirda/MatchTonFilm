import { Modal, Pressable, StyleSheet, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = Readonly<{
  videoKey: string | null;
  onClose: () => void;
}>;

export default function TrailerModal({ videoKey, onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <Modal visible={videoKey !== null} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer la bande-annonce"
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </Pressable>
        {videoKey && (
          <WebView
            style={styles.webview}
            source={{ uri: `https://www.youtube.com/embed/${videoKey}?playsinline=1` }}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </View>
    </Modal>
  );
}

function makeStyles(
  _colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
    },
    webview: {
      flex: 1,
      backgroundColor: '#000',
    },
    closeBtn: {
      position: 'absolute',
      top: 56,
      right: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    closeBtnPressed: {
      opacity: 0.7,
    },
  });
}
