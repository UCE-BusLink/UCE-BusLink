import { Mail, ShieldCheck } from 'lucide-react';

interface ProfileHeroCardProps {
  fullName: string;
  email: string;
  initials: string;
  avatarUrl: string | undefined;
  roleLabel: string;
}

export function ProfileHeroCard({ fullName, email, initials, avatarUrl, roleLabel }: ProfileHeroCardProps) {
  return (
    <div className="bg-navy-900 rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center gap-5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white truncate">{fullName}</h2>
          <p className="text-white/50 text-sm flex items-center gap-1.5 mt-1">
            <Mail size={14} />
            {email || '—'}
          </p>
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-green-500/15 text-green-400 px-3 py-1 rounded-full">
            <ShieldCheck size={13} />
            {roleLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
