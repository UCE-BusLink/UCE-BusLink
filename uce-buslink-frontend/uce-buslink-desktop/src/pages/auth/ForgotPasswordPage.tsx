import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignIn, useClerk } from '@clerk/clerk-react';
import { Eye, EyeOff } from 'lucide-react';
import heroImg from '../../assets/brand/FacePage.webp';
import brandLogo from '../../assets/brand/Logo.png';

export function ForgotPasswordPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const clerk = useClerk();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await signIn.create({ identifier: email, password: currentPassword });
      if (result.status !== 'complete' || !result.createdSessionId) {
        setError('No se pudo verificar tu contraseña actual.');
        return;
      }
      await setActive({ session: result.createdSessionId });
      await clerk.user?.updatePassword({ newPassword });
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message;
      setError(message || 'Correo o contraseña actual incorrectos.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div
        className="hidden lg:flex lg:w-[55%] relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0 bg-navy-900/85" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="w-12 h-1 bg-amber-500 mb-6 rounded-full" />
          <h2 className="text-white text-4xl font-bold leading-tight max-w-sm">
            Transporte nocturno seguro para la comunidad UCE
          </h2>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <img src={brandLogo} alt="UCE Bus-Link" className="h-24 w-auto object-contain" />
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-1 text-center">Cambiar contraseña</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Ingresa tu correo y tu contraseña actual (o la temporal asignada por el administrador) para establecer una nueva.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
                placeholder="usuario@uce.edu.ec"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !isLoaded}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl h-11 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Cambiando contraseña...' : 'Cambiar contraseña e ingresar'}
            </button>

            <p className="text-center text-sm text-gray-500 pt-2">
              <Link to="/login" className="text-navy-900 font-semibold hover:text-navy-700">
                Volver a inicio de sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
