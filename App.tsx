import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSettings } from './src/lib/useSettings';
import { colors } from './src/theme';
import CameraScreen from './src/screens/CameraScreen';
import EditScreen from './src/screens/EditScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PreviewScreen from './src/screens/PreviewScreen';

type Screen =
  | { name: 'camera' }
  | { name: 'preview'; uri: string }
  | { name: 'edit'; uri: string | null };

export default function App() {
  const { settings, update, loaded } = useSettings();
  const [screen, setScreen] = useState<Screen>({ name: 'camera' });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ink }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {!loaded ? (
          <View style={{ flex: 1, backgroundColor: colors.ink }} />
        ) : !settings.onboarded ? (
          <OnboardingScreen onDone={() => update({ onboarded: true })} />
        ) : (
          <>
            {screen.name === 'camera' && (
              <CameraScreen
                settings={settings}
                update={update}
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
          </>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
