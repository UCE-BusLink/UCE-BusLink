interface StatCardProps {
  label: string;
  value: string | null;
  valueClassName?: string;
}

export function StatCard({ label, value, valueClassName = 'text-navy-900' }: StatCardProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-bold ${valueClassName}`}>{value ?? '--'}</span>
    </div>
  );
}
