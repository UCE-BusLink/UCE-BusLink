import { View, Text, Pressable, Image, ImageBackground, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GraduationCap, ArrowRight, Shield, Cpu, ListChecks } from 'lucide-react-native';
import type { AuthStackParamList } from '../../navigation/types';

const logoHorizontal = require('../../../assets/brand/LogoHorizontal.png');
const heroBg = require('../../../assets/brand/FacePage.webp');

const FEATURES = [
  {
    icon: Shield,
    title: 'Seguridad',
    text: 'Acceso exclusivo para estudiantes y docentes verificados. Viaja con tranquilidad en horarios nocturnos.',
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.15)',
  },
  {
    icon: Cpu,
    title: 'Inteligencia',
    text: 'Rastreo en tiempo real, estimación de llegada precisa y notificaciones automáticas sobre tu ruta.',
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.15)',
  },
  {
    icon: ListChecks,
    title: 'Organización',
    text: 'Reserva tu asiento con anticipación. Adiós a las filas interminables y la incertidumbre de cupo.',
    color: '#34d399',
    bg: 'rgba(16,185,129,0.15)',
  },
];

export function LandingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <ScrollView className="flex-1 bg-navy-950" contentContainerStyle={{ paddingBottom: 32 }}>
      <ImageBackground source={heroBg} className="min-h-[560px]" resizeMode="cover">
        <View className="absolute inset-0 bg-navy-950/80" />
        <View className="relative px-6 pt-14">
          <View className="flex-row items-center justify-between mb-10">
            <Image source={logoHorizontal} className="h-10 w-40" resizeMode="contain" />
            <Pressable
              onPress={() => navigation.navigate('SignIn')}
              className="bg-white/10 border border-white/15 px-5 py-2.5 rounded-xl"
            >
              <Text className="text-sm font-semibold text-white">Iniciar sesión</Text>
            </Pressable>
          </View>

          <View className="mt-6">
            <View className="flex-row self-start items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15">
              <GraduationCap size={16} color="#22d3ee" />
              <Text className="text-xs font-medium text-slate-100">Exclusivo comunidad UCE</Text>
            </View>

            <Text className="mt-7 text-4xl font-bold text-white leading-tight">
              Transporte Universitario{'\n'}
              <Text className="text-cyan-400">Inteligente</Text>
            </Text>

            <Text className="mt-5 text-xl font-medium text-slate-100">
              El transporte universitario más seguro, inteligente y organizado.
            </Text>

            <Text className="mt-4 text-base text-slate-300 leading-relaxed">
              Asegura tu asiento, conoce tu ruta y viaja seguro. La plataforma oficial para la gestión
              eficiente del transporte en la UCE.
            </Text>

            <Pressable
              onPress={() => navigation.navigate('SignIn')}
              className="mt-8 flex-row items-center justify-center gap-2 rounded-full bg-cyan-500 px-10 py-4"
            >
              <Text className="font-semibold text-white text-lg">Comenzar ahora</Text>
              <ArrowRight size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      <View className="px-6 py-16">
        <View className="items-center mb-10">
          <View className="bg-cyan-400 px-5 py-1.5 rounded-lg">
            <Text className="text-navy-950 font-bold text-base">Por qué elegir UCE Bus-Link</Text>
          </View>
        </View>

        <View className="gap-4">
          {FEATURES.map((feature) => (
            <View key={feature.title} className="rounded-2xl bg-navy-900/40 border border-white/10 p-7">
              <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: feature.bg }}>
                <feature.icon size={22} color={feature.color} />
              </View>
              <Text className="mt-5 text-xl font-semibold text-white">{feature.title}</Text>
              <Text className="mt-3 text-sm text-slate-400 leading-relaxed">{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="border-t border-white/10 px-6 py-8 items-center">
        <Image source={logoHorizontal} className="h-8 w-32 opacity-80" resizeMode="contain" />
        <Text className="text-xs text-slate-500 mt-3 text-center">
          © {new Date().getFullYear()} UCE Bus-Link · Diseñado para la comunidad universitaria.
        </Text>
      </View>
    </ScrollView>
  );
}
