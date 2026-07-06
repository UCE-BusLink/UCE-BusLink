import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { useOAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../../lib/warmUpBrowser';

type Strategy = 'oauth_microsoft';

const MicrosoftLogo = () => (
  <View style={{ width: 18, height: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
    <View style={{ width: 8, height: 8, backgroundColor: '#f25022' }} />
    <View style={{ width: 8, height: 8, backgroundColor: '#7fba00' }} />
    <View style={{ width: 8, height: 8, backgroundColor: '#00a4ef' }} />
    <View style={{ width: 8, height: 8, backgroundColor: '#ffb900' }} />
  </View>
);

export function OAuthButtons({ onError }: { onError?: (msg: string) => void }) {
  useWarmUpBrowser();
  const { startOAuthFlow: startMicrosoftFlow } = useOAuth({ strategy: 'oauth_microsoft' });
  const [loading, setLoading] = useState<Strategy | null>(null);

  const handle = async (strategy: Strategy) => {
    setLoading(strategy);
    try {
      const { createdSessionId, setActive } = await startMicrosoftFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'ucebuslink' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      onError?.(err?.errors?.[0]?.message ?? 'No se pudo iniciar sesión con el proveedor.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View className="gap-3">
      <Pressable
        onPress={() => handle('oauth_microsoft')}
        disabled={loading !== null}
        className="flex-row items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 bg-white active:bg-gray-50"
      >
        {loading === 'oauth_microsoft' ? (
          <ActivityIndicator size="small" color="#0a1628" />
        ) : (
          <>
            <MicrosoftLogo />
            <Text className="text-sm font-semibold text-navy-900">Continuar con Microsoft</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
