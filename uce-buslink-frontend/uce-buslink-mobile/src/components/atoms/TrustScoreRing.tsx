import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface TrustScoreRingProps {
  score: number | null;
}

export function TrustScoreRing({ score }: TrustScoreRingProps) {
  const RADIUS = 45;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = score !== null
    ? CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE;

  return (
    <View className="relative w-32 h-32 mx-auto items-center justify-center">
      <Svg width={128} height={128} viewBox="0 0 128 128">
        <Circle cx={64} cy={64} r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth={12} />
        <Circle
          cx={64}
          cy={64}
          r={RADIUS}
          fill="none"
          stroke={score !== null ? '#F59E0B' : '#e5e7eb'}
          strokeWidth={12}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-2xl font-bold text-navy-900">
          {score !== null ? `${score}%` : '--'}
        </Text>
      </View>
    </View>
  );
}
