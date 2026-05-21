import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, CreditCard, Lock, Eye, EyeOff, Bus } from 'lucide-react';
import heroImg from '../../assets/hero.png';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-[55%] relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0 bg-navy-900/85" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="w-12 h-1 bg-amber-500 mb-6 rounded-full" />
          <h2 className="text-white text-4xl font-bold leading-tight max-w-sm">
            Únete a la red de transporte universitario más segura
          </h2>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm py-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Bus size={16} className="text-white" />
            </div>
            <span className="text-navy-900 font-semibold text-sm">UCE Bus-Link</span>
          </div>

          <h1 className="text-2xl font-bold text-navy-900 mb-1">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mb-7">Regístrate con tu correo institucional</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@uce.edu.ec"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ID Universitario / Matrícula
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <CreditCard size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  placeholder="UCE-2021-0000"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-navy-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Registrarse
              <span>→</span>
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Al registrarte, aceptas nuestros{' '}
            <span className="underline cursor-pointer">Términos de Servicio</span>
            {' '}y{' '}
            <span className="underline cursor-pointer">Política de Privacidad</span>
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-navy-900 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
