import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  // 問題：語言會是固定的，好像不能自動偵測
  // 問題：會一直自己中斷
  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    console.log('result:', event.results[0]?.transcript);
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.log('error code:', event.error, 'error message:', event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Permissions not granted', result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: 'zh-TW',
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
      requiresOnDeviceRecognition: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.transcriptWrapper}
          contentContainerStyle={styles.transcriptContainer}
        >
          <Text style={styles.transcriptText}>{transcript || '點擊下方按鈕開始錄音'}</Text>
        </ScrollView>

        <View style={styles.controls}>
          {!recognizing ? (
            <Button title="開始錄音" onPress={handleStart} color="#2563eb" />
          ) : (
            <Button
              title="停止錄音"
              onPress={() => ExpoSpeechRecognitionModule.stop()}
              color="#dc2626"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  transcriptWrapper: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  transcriptContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  transcriptText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    color: '#1f2937',
  },
  controls: {
    width: '100%',
    paddingTop: 24,
  },
});
