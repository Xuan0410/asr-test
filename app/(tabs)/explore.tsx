import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// If your RN packager is not enable package exports support, use whisper.rn/src/realtime-transcription
import { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { initWhisper } from 'whisper.rn/index.js';
import { AudioPcmStreamAdapter } from 'whisper.rn/realtime-transcription/adapters/AudioPcmStreamAdapter.js';
import { RealtimeTranscriber } from 'whisper.rn/realtime-transcription/index.js';

export default function TabTwoScreen() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriber, setTranscriber] = useState<RealtimeTranscriber | null>(null);

  useEffect(() => {
    if (!transcriber) {
      (async () => {
        // Dependencies
        const whisperContext = await initWhisper({
          filePath: require('../../assets/ggml-base.bin'),
        });

        // const vadContext = await initWhisperVad({
        //   filePath: require('../../assets/ggml-silero-v5.1.2.bin'),
        //   useGpu: true,
        //   nThreads: 4,
        // });
        const audioStream = new AudioPcmStreamAdapter(); // requires @fugood/react-native-audio-pcm-stream
        // Create transcriber
        const transcriber = new RealtimeTranscriber(
          { whisperContext, audioStream, fs: RNFS },
          {
            audioSliceSec: 60,
            autoSliceOnSpeechEnd: true,
            transcribeOptions: { language: 'zh' },
          },
          {
            onTranscribe: (event) => {
              console.log('Transcription:', event.data?.result);
              setTranscript(event.data?.result ?? '');
            },
            onVad: (event) => console.log('VAD:', event.type, event.confidence),
            onStatusChange: (isActive) => {
              console.log('Status:', isActive ? 'ACTIVE' : 'INACTIVE');
              if (!isActive) setRecognizing(false);
            },
            onError: (error) => console.error('Error:', error),
          },
        );
        setTranscriber(transcriber);
      })();
    }
  }, []);

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
            <Button
              title="開始錄音"
              onPress={async () => {
                await transcriber?.start();
                setTranscript('');
                setRecognizing(true);
              }}
              color="#2563eb"
            />
          ) : (
            <Button
              title="停止錄音"
              onPress={async () => {
                await transcriber?.stop();
                setRecognizing(false);
              }}
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
