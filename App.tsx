import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CameraScreen from './src/screens/CameraScreen';
import EditScreen from './src/screens/EditScreen';
import PreviewScreen from './src/screens/PreviewScreen';

type Screen =
  | { name: 'camera' }
  | { name: 'preview'; uri: string }
  | { name: 'edit'; uri: string | null };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'camera' });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {screen.name === 'camera' && (
          <CameraScreen
            onCaptured={(uri) => setScreen({ name: 'preview', uri })}
            onPickForEdit={(uri) => setScreen({ name: 'edit', uri })}
          />
        )}
        {screen.name === 'preview' && (
          <PreviewScreen
            uri={screen.uri}
            onRetake={() => setScreen({ name: 'camera' })}
            onEdit={(uri) => setScreen({ name: 'edit', uri })}
          />
        )}
        {screen.name === 'edit' && (
          <EditScreen uri={screen.uri} onBack={() => setScreen({ name: 'camera' })} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
