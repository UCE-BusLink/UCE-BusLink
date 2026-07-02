import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { useSSO } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../../lib/warmUpBrowser';

type Strategy = 'oauth_google' | 'oauth_microsoft';

export function OAuthButtons({ onError }: { onError?: (msg: string) => void }) {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState<Strategy | null>(null);

  const handle = async (strategy: Strategy) => {
    setLoading(strategy);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'ucebuslink' }),
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
        onPress={() => handle('oauth_google')}
        disabled={loading !== null}
        className="flex-row items-center justify-center gap-2 border border-gray-200 rounded-full py-3"
      >
        {loading === 'oauth_google' ? (
          <ActivityIndicator size="small" color="#0a1628" />
        ) : (
          <Text className="text-sm font-semibold text-navy-900">Continuar con Google</Text>
        )}
      </Pressable>
      <Pressable
        onPress={() => handle('oauth_microsoft')}
        disabled={loading !== null}
        className="flex-row items-center justify-center gap-2 border border-gray-200 rounded-full py-3"
      >
        {loading === 'oauth_microsoft' ? (
          <ActivityIndicator size="small" color="#0a1628" />
        ) : (
          <Text className="text-sm font-semibold text-navy-900">Continuar con Microsoft</Text>
        )}
      </Pressable>
    </View>
  );
}
