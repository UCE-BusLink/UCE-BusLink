interface LegendItemProps {
  color: string;
  label: string;
}

export function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
