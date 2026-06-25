import { useState, useEffect } from 'react';
import { User, RefreshCw, Plus, X, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { fetchDrivers, createDriver, type ApiDriver } from '../../services/adminService';

const EMPTY_FORM = { nombres: '', apellidos: '', email: '', password: '', confirmPassword: '' };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordRules(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function AdminDriversPage() {
  const { getToken } = useAuth();
  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        const data = await fetchDrivers(token);
        if (!cancelled) { setDrivers(data); setError(null); }
      } catch {
        if (!cancelled) setError('No se pudieron cargar los choferes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken, trigger]);

  const rules = passwordRules(form.password);
  const emailValid = form.email === '' || EMAIL_REGEX.test(form.email);
  const passwordValid = rules.length && rules.upper && rules.lower && rules.number && rules.special;
  const confirmValid = form.confirmPassword === '' || form.confirmPassword === form.password;
  const formValid =
    form.nombres.trim() !== '' &&
    form.apellidos.trim() !== '' &&
    EMAIL_REGEX.test(form.email) &&
    passwordValid &&
    form.confirmPassword === form.password;

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setSaveError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!formValid) {
      setSaveError('Revisa los campos: correo válido y contraseña que cumpla los requisitos.');
      return;
    }
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    await createDriver(token, {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      password: form.password,
    })
      .then(() => {
        closeForm();
        setLoading(true);
        setTrigger((t) => t + 1);
      })
      .catch(() => setSaveError('No se pudo crear el chofer. Verifica los datos e intenta de nuevo.'))
      .finally(() => setSaving(false));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Choferes</h1>
          <p className="text-gray-500 text-sm mt-1">{drivers.length} choferes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); setTrigger((t) => t + 1); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Recargar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <Plus size={15} />
            Nuevo chofer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : drivers.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No hay choferes registrados.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-navy-700" />
                      </div>
                      <span className="text-sm font-semibold text-navy-900">
                        {driver.nombres} {driver.apellidos}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{driver.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-navy-900">Nuevo chofer</h2>
              <button onClick={closeForm}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="driver-nombres" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Nombres
                  </label>
                  <input
                    id="driver-nombres"
                    name="nombres"
                    required
                    type="text"
                    value={form.nombres}
                    onChange={(e) => setForm((f) => ({ ...f, nombres: e.target.value }))}
                    placeholder="Daniel"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                </div>
                <div>
                  <label htmlFor="driver-apellidos" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Apellidos
                  </label>
                  <input
                    id="driver-apellidos"
                    name="apellidos"
                    required
                    type="text"
                    value={form.apellidos}
                    onChange={(e) => setForm((f) => ({ ...f, apellidos: e.target.value }))}
                    placeholder="Pérez"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="driver-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Correo electrónico
                </label>
                <input
                  id="driver-email"
                  name="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="chofer@empresa.com"
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    emailValid ? 'border-gray-200 focus:ring-navy-900/20' : 'border-red-300 focus:ring-red-200'
                  }`}
                />
                {!emailValid && <p className="text-[11px] text-red-400 mt-1">Ingresa un correo válido.</p>}
              </div>

              <div>
                <label htmlFor="driver-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Contraseña temporal
                </label>
                <div className="relative">
                  <input
                    id="driver-password"
                    name="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password !== '' && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                    <RuleItem ok={rules.length} text="Al menos 8 caracteres" />
                    <RuleItem ok={rules.upper} text="Una mayúscula" />
                    <RuleItem ok={rules.lower} text="Una minúscula" />
                    <RuleItem ok={rules.number} text="Un número" />
                    <RuleItem ok={rules.special} text="Un carácter especial" />
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="driver-confirm" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  id="driver-confirm"
                  name="confirmPassword"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repite la contraseña"
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    confirmValid ? 'border-gray-200 focus:ring-navy-900/20' : 'border-red-300 focus:ring-red-200'
                  }`}
                />
                {!confirmValid && <p className="text-[11px] text-red-400 mt-1">Las contraseñas no coinciden.</p>}
              </div>

              {saveError && <p className="text-xs text-red-400">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !formValid}
                  className="px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Creando...' : 'Crear chofer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RuleItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      <Check size={12} className={ok ? 'opacity-100' : 'opacity-30'} />
      {text}
    </li>
  );
}
