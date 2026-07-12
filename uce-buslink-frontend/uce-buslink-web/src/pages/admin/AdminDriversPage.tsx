import React, { useState, useEffect, useMemo } from 'react';
import { User, RefreshCw, Plus, X, Eye, EyeOff, Check, Search, ChevronLeft, ChevronRight, Briefcase, Clock, Route } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { fetchDrivers, createDriver, fetchTrips, type ApiDriver, type ApiTrip } from '../../services/adminService';
import { useRoutes } from '../../hooks/useRoutes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { driverFormSchema } from '../../schemas/driver.schema';
import { getFieldErrors } from '../../schemas/common';

const EMPTY_FORM = { nombres: '', apellidos: '', email: '', password: '', confirmPassword: '', cedula: '', telefono: '' };
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
  const { routes } = useRoutes();

  // const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  // const [trips, setTrips] = useState<ApiTrip[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading: loadingDrivers, error: errorDrivers, refetch: refetchDrivers } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('Sin token');
      return await fetchDrivers(token);
    }
  });

  const { data: trips = [], isLoading: loadingTrips, refetch: refetchTrips } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('Sin token');
      return await fetchTrips(token).catch(() => []);
    }
  });

  const loading = loadingDrivers || loadingTrips;
  const error = errorDrivers instanceof Error ? errorDrivers.message : (errorDrivers ? 'Error' : null);

  const createMutation = useMutation({
    mutationKey: ['createDriver'],
    mutationFn: async (payload: any) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('Sin token');
      await createDriver(token, payload);
      return payload;
    },
    onMutate: async (newDriver) => {
      await queryClient.cancelQueries({ queryKey: ['admin-drivers'] });
      const previousDrivers = queryClient.getQueryData<ApiDriver[]>(['admin-drivers']);
      queryClient.setQueryData<ApiDriver[]>(['admin-drivers'], (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          firstName: newDriver.nombres,
          lastName: newDriver.apellidos,
          email: newDriver.email,
          documentNumber: newDriver.cedula,
          phone: newDriver.telefono
        } as ApiDriver
      ]);
      return { previousDrivers };
    },
    onError: (err, newDriver, context) => {
      if (context?.previousDrivers) {
        queryClient.setQueryData(['admin-drivers'], context.previousDrivers);
      }
      setSaveError('No se pudo crear el chofer. Verifica los datos e intenta de nuevo.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
    },
  });

  // Derived filtered & paginated data
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d: any) => {
      const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
      const email = d.email.toLowerCase();
      const s = search.toLowerCase();
      return fullName.includes(s) || email.includes(s);
    });
  }, [drivers, search]);

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const currentDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(start, start + itemsPerPage);
  }, [filteredDrivers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Form Validation
  const rules = passwordRules(form.password);
  const emailValid = form.email === '' || EMAIL_REGEX.test(form.email);
  const passwordValid = rules.length && rules.upper && rules.lower && rules.number && rules.special;
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
    setFieldErrors({});
  }

  // Auto-generar correo y contraseña
  useEffect(() => {
    if (showForm) {
      const nombreLimpio = form.nombres.trim().split(' ')[0] || '';
      const apellidoLimpio = form.apellidos.trim().split(' ')[0] || '';

      if (nombreLimpio || apellidoLimpio) {
        let baseEmail = `${nombreLimpio.toLowerCase()}_${apellidoLimpio.toLowerCase()}_driver@uce.buslink.com`;

        let counter = 1;
        let finalEmail = baseEmail;
        while (drivers.some((d: any) => d.email === finalEmail)) {
          finalEmail = `${nombreLimpio.toLowerCase()}_${apellidoLimpio.toLowerCase()}_driver${counter}@uce.buslink.com`;
          counter++;
        }

        const capitalizedNombre = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
        const capitalizedApellido = apellidoLimpio.charAt(0).toUpperCase() + apellidoLimpio.slice(1).toLowerCase();
        const generatedPassword = `${capitalizedNombre}${capitalizedApellido}2026*`;

        setForm(prev => ({
          ...prev,
          email: finalEmail,
          password: generatedPassword,
          confirmPassword: generatedPassword
        }));
      } else {
        setForm(prev => ({ ...prev, email: '', password: '', confirmPassword: '' }));
      }
    }
  }, [form.nombres, form.apellidos, showForm, drivers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    const result = driverFormSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      setSaveError('Revisa los campos: correo válido y contraseña que cumpla los requisitos.');
      return;
    }
    setFieldErrors({});

    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    createMutation.mutate({
      nombres: result.data.nombres,
      apellidos: result.data.apellidos,
      email: result.data.email,
      password: result.data.password,
      cedula: result.data.cedula,
      telefono: result.data.telefono,
    }, {
      onSuccess: () => {
        closeForm();
      },
      onSettled: () => {
        setSaving(false);
      }
    });
  }

  // Helper to get ALL active assignments
  function getDriverAssignments(driverId: string) {
    const activeTrips = trips.filter((t: any) => t.driverId === driverId && (t.state === 'SCHEDULED' || t.state === 'IN_PROGRESS'));
    if (activeTrips.length === 0) return [];

    return activeTrips.map((trip: any) => {
      const route = routes.find(r => r.id === trip.routeId);
      return {
        trip,
        route,
        timeFormatted: dayjs(trip.departureTime).format('HH:mm')
      };
    });
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Choferes del Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">{drivers.length} choferes corporativos registrados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { refetchDrivers(); refetchTrips(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Recargar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nuevo chofer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Barra de Búsqueda */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            />
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          ) : currentDrivers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No se encontraron choferes con estos filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-6 py-4">Chofer</th>
                    <th className="px-6 py-4">Asignación Rápida</th>
                    <th className="px-6 py-4 hidden md:table-cell">Cédula</th>
                    <th className="px-6 py-4 hidden md:table-cell">Correo</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Teléfono</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentDrivers.map((driver: any) => {
                    const assignments = getDriverAssignments(driver.id);
                    const hasAssignments = assignments.length > 0;
                    const primaryAssignment = hasAssignments ? assignments[0] : null;
                    const isExpanded = expandedDriverId === driver.id;

                    return (
                      <React.Fragment key={driver.id}>
                        <tr
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedDriverId(isExpanded ? null : driver.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0 text-navy-700">
                                <User size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-navy-900">{driver.firstName} {driver.lastName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {primaryAssignment ? (
                              <div className="inline-flex flex-col gap-1.5 p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50 min-w-[180px]">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                    <Briefcase size={12} className="text-emerald-600" />
                                    {primaryAssignment.trip.state === 'IN_PROGRESS' ? 'En Ruta' : 'Asignado'}
                                  </div>
                                  {assignments.length > 1 && (
                                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-md">+{assignments.length - 1}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                                  <span className="flex items-center gap-1"><Route size={12} /> {primaryAssignment.route?.name || 'Ruta'}</span>
                                  <span className="flex items-center gap-1"><Clock size={12} /> {primaryAssignment.timeFormatted}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Check size={12} /> Disponible (Sin viajes asignados)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell text-xs text-gray-600 font-medium">
                            {driver.documentNumber || '—'}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell text-xs text-gray-600 font-medium">
                            {driver.email}
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell text-xs text-gray-600 font-medium">
                            {driver.phone || '—'}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <td colSpan={5} className="px-6 py-4">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                  <Briefcase size={14} /> Detalle de Asignaciones ({assignments.length})
                                </h4>
                                {hasAssignments ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {assignments.map((asg: any) => (
                                      <div key={asg.trip.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-navy-800 flex items-center gap-1">
                                            <Route size={12} /> {asg.route?.name || 'Desconocida'}
                                          </span>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${asg.trip.state === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {asg.trip.state === 'IN_PROGRESS' ? 'EN CURSO' : 'PROGRAMADO'}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-600">
                                          <span className="flex items-center gap-1"><Clock size={12} /> Hora: {asg.timeFormatted}</span>
                                          <span className="font-mono text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">Placa ID: {asg.trip.busId.substring(0, 6).toUpperCase()}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">El chofer no tiene viajes programados en este momento.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-medium text-gray-500">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-lg text-navy-900">Nuevo chofer</h2>
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
                  {fieldErrors.nombres && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.nombres}</p>}
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
                  {fieldErrors.apellidos && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.apellidos}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="driver-cedula" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Cédula
                  </label>
                  <input
                    id="driver-cedula"
                    name="cedula"
                    required
                    type="text"
                    value={form.cedula}
                    onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))}
                    placeholder="17xxxxxxxx"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.cedula && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.cedula}</p>}
                </div>
                <div>
                  <label htmlFor="driver-telefono" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Teléfono
                  </label>
                  <input
                    id="driver-telefono"
                    name="telefono"
                    required
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                    placeholder="099xxxxxxx"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.telefono && <p className="text-[11px] text-red-400 mt-1">{fieldErrors.telefono}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="driver-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Correo electrónico (Automático)
                </label>
                <input
                  id="driver-email"
                  name="email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                {!emailValid && <p className="text-[11px] text-red-400 mt-1">Ingresa un correo válido.</p>}
              </div>

              <div>
                <label htmlFor="driver-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Contraseña temporal (Automática)
                </label>
                <div className="relative">
                  <input
                    id="driver-password"
                    name="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

              <div className="hidden">
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
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  readOnly
                />
              </div>

              {saveError && <p className="text-xs text-red-400">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-4">
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
                  className="px-5 py-2 bg-navy-900 text-white text-sm font-bold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Registrando...' : 'Registrar chofer'}
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
    <li className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
      <Check size={12} className={ok ? 'opacity-100' : 'opacity-30'} />
      {text}
    </li>
  );
}
