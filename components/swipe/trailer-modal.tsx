import { Modal, Pressable, StyleSheet, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = Readonly<{
  videoKey: string | null;
  onClose: () => void;
}>;

// L'iframe est servie depuis une page avec baseUrl YouTube : charger
// directement l'URL /embed dans la WebView part sans Referer valide et
// YouTube refuse la lecture (« Error 153 — player configuration error »).
function buildEmbedHtml(videoKey: string): string {
  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>html,body{margin:0;padding:0;background:#000;height:100%;overflow:hidden}</style>
  </head><body>
    <iframe
      width="100%" height="100%"
      src="https://www.youtube.com/embed/${videoKey}?playsinline=1&autoplay=1&rel=0"
      frameborder="0"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
    ></iframe>
  </body></html>`;
}

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
            originWhitelist={['*']}
            source={{
              html: buildEmbedHtml(videoKey),
              baseUrl: 'https://www.youtube.com',
            }}
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
