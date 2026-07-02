import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import type { AuthStackParamList } from '../../navigation/types';

const brandLogo = require('../../../assets/brand/Logo.png');

export function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  async function handleSubmit() {
    if (!isLoaded) return;
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Código incorrecto. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'No se pudo verificar el código.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}>
        <View className="w-full max-w-sm self-center">
          <View className="items-center mb-8">
            <Image source={brandLogo} className="h-20 w-36" resizeMode="contain" />
          </View>

          {pendingVerification ? (
            <>
              <Text className="text-2xl font-bold text-navy-900 mb-1">Verifica tu correo</Text>
              <Text className="text-gray-500 text-sm mb-7">
                Ingresa el código que enviamos a {email}
              </Text>

              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Código de 6 dígitos"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 text-center tracking-widest"
              />

              {error ? <Text className="text-red-500 text-xs text-center mt-3">{error}</Text> : null}

              <Pressable
                onPress={handleVerify}
                disabled={loading}
                className={`w-full bg-navy-900 py-3 rounded-xl items-center mt-4 ${loading ? 'opacity-50' : 'active:bg-navy-800'}`}
              >
                <Text className="text-white text-sm font-semibold">{loading ? 'Verificando...' : 'Verificar'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-navy-900 mb-1">Crear cuenta</Text>
              <Text className="text-gray-500 text-sm mb-7">Regístrate con tu correo institucional</Text>

              <OAuthButtons onError={setError} />

              <View className="flex-row items-center gap-3 my-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-xs text-gray-400">o con tu correo</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <View className="gap-4">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Nombres</Text>
                    <View className="relative justify-center">
                      <View className="absolute left-3 z-10">
                        <User size={16} color="#9ca3af" />
                      </View>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Juan"
                        placeholderTextColor="#9ca3af"
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-navy-900"
                      />
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Apellidos</Text>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Pérez"
                      placeholderTextColor="#9ca3af"
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm text-navy-900"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1.5">Correo institucional</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <Mail size={16} color="#9ca3af" />
                    </View>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="tu@uce.edu.ec"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1.5">Contraseña</Text>
                  <View className="relative justify-center">
                    <View className="absolute left-3 z-10">
                      <Lock size={16} color="#9ca3af" />
                    </View>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showPassword}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm text-navy-900"
                    />
                    <Pressable onPress={() => setShowPassword((v) => !v)} className="absolute right-3 z-10">
                      {showPassword ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                    </Pressable>
                  </View>
                </View>

                {error ? <Text className="text-red-500 text-xs text-center">{error}</Text> : null}

                <Pressable
                  onPress={handleSubmit}
                  disabled={loading}
                  className={`w-full bg-navy-900 py-3 rounded-xl items-center mt-2 ${loading ? 'opacity-50' : 'active:bg-navy-800'}`}
                >
                  <Text className="text-white text-sm font-semibold">{loading ? 'Creando cuenta...' : 'Registrarse →'}</Text>
                </Pressable>
              </View>

              <View className="flex-row justify-center mt-6">
                <Text className="text-sm text-gray-500">¿Ya tienes cuenta? </Text>
                <Pressable onPress={() => navigation.navigate('SignIn')}>
                  <Text className="text-sm text-navy-900 font-semibold">Inicia sesión</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
