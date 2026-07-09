import { useState, useEffect, useMemo } from 'react';
import { Truck, RefreshCw, CheckCircle, Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight, Briefcase, Clock, Route, Search } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  fetchBuses, createBus, updateBus, deleteBus, changeBusStatus, fetchTrips, type ApiBus, type ApiTrip
} from '../../services/adminService';
import { useRoutes } from '../../hooks/useRoutes';
import dayjs from 'dayjs';
import { busFormSchema } from '../../schemas/bus.schema';
import { getFieldErrors } from '../../schemas/common';

const EMPTY_FORM = {
  plateNumber: '',
  internalCode: '',
  seatCapacity: '',
  manufacturer: '',
  model: '',
  operationalStatus: 'OPERATIONAL',
};

const statusLabels: Record<string, string> = {
  OPERATIONAL: 'Operativo',
  MAINTENANCE: 'Mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio',
};

export function AdminBusesPage() {
  const { getToken } = useAuth();
  const { routes } = useRoutes();

  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiBus | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');

        const [pageData, tripsData] = await Promise.all([
          fetchBuses(token, 0, 500), // Fetch large amount to filter locally
          fetchTrips(token).catch(() => [])
        ]);

        if (!cancelled) {
          setBuses(pageData.content);
          setTrips(tripsData);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar los datos de los buses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [getToken, trigger]);

  function refresh() {
    setLoading(true);
    setError(null);
    setTrigger((t) => t + 1);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setFieldErrors({});
    setShowForm(true);
  }

  function openEdit(bus: ApiBus) {
    setEditing(bus);
    setForm({
      plateNumber: bus.plateNumber,
      internalCode: bus.internalCode,
      seatCapacity: String(bus.seatCapacity),
      manufacturer: bus.manufacturer,
      model: bus.model,
      operationalStatus: bus.operationalStatus,
    });
    setSaveError(null);
    setFieldErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    const result = busFormSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    try {
      const { operationalStatus, ...data } = result.data;
      if (editing) {
        await updateBus(token, editing.id, data);
        if (operationalStatus !== editing.operationalStatus) {
          await changeBusStatus(token, editing.id, operationalStatus);
        }
      } else {
        await createBus(token, { ...data, operationalStatus });
      }
      closeForm();
      refresh();
    } catch {
      setSaveError('No se pudo guardar el bus. Verifica los datos e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(bus: ApiBus) {
    if (!window.confirm(`¿Eliminar el bus "${bus.plateNumber}"?`)) return;
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;
      await deleteBus(token, bus.id);
      refresh();
    } catch {
      setError('No se pudo eliminar el bus.');
    }
  }

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchStatus = statusFilter === 'ALL' || bus.operationalStatus === statusFilter;
      const term = search.toLowerCase();
      const matchSearch = bus.plateNumber.toLowerCase().includes(term) || bus.internalCode.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [buses, statusFilter, search]);

  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const currentBuses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBuses.slice(start, start + itemsPerPage);
  }, [filteredBuses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Helper to get ALL active assignments
  function getBusAssignments(busId: string) {
    const activeTrips = trips.filter(t => t.busId === busId && (t.state === 'SCHEDULED' || t.state === 'IN_PROGRESS'));
    if (activeTrips.length === 0) return [];
    
    return activeTrips.map(trip => {
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
          <h1 className="text-2xl font-bold text-navy-900">Buses</h1>
          <p className="text-gray-500 text-sm mt-1">{buses.length} unidades en flota corporativa</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Recargar
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nuevo bus
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Barra de Filtros */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por placa o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white min-w-[160px]"
          >
            <option value="ALL">Todos los estados</option>
            <option value="OPERATIONAL">Operativos</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="OUT_OF_SERVICE">Fuera de servicio</option>
          </select>
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
          ) : currentBuses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No se encontraron buses con estos filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-6 py-4">Vehículo</th>
                    <th className="px-6 py-4">Capacidad / Modelo</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Asignación Actual</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentBuses.map((bus) => {
                    const assignments = getBusAssignments(bus.id);
                    const hasAssignments = assignments.length > 0;
                    const primaryAssignment = hasAssignments ? assignments[0] : null;

                    return (
                      <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                              <Truck size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-navy-900">{bus.plateNumber}</p>
                              <p className="text-[11px] text-gray-500 font-mono mt-0.5">Cod: {bus.internalCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 font-medium">{bus.seatCapacity} asientos</p>
                          <p className="text-xs text-gray-500 mt-0.5">{bus.manufacturer} {bus.model}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-fit ${bus.operationalStatus === 'OPERATIONAL'
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : bus.operationalStatus === 'MAINTENANCE'
                                ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                              }`}
                          >
                            <CheckCircle size={14} />
                            {statusLabels[bus.operationalStatus] ?? bus.operationalStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {primaryAssignment ? (
                            <div className="relative group">
                              <div className="inline-flex flex-col gap-1.5 p-2 rounded-lg border border-emerald-100 bg-emerald-50/50 min-w-[160px] cursor-help">
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
                                  <span className="flex items-center gap-1"><Route size={12} /> {primaryAssignment.route?.name || 'Ruta Desconocida'}</span>
                                  <span className="flex items-center gap-1"><Clock size={12} /> {primaryAssignment.timeFormatted}</span>
                                </div>
                              </div>

                              {/* Pantallita Flotante (Tooltip) */}
                              {assignments.length > 0 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-72 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wide mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <Truck size={14}/> Itinerario del Bus ({assignments.length})
                                  </h4>
                                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                    {assignments.map(asg => (
                                      <div key={asg.trip.id} className="bg-gray-50 border border-gray-100 rounded p-2 text-xs">
                                        <div className="flex justify-between font-bold text-navy-800 mb-1">
                                          <span>{asg.route?.name || 'Ruta Desconocida'}</span>
                                          <span className={`${asg.trip.state === 'IN_PROGRESS' ? 'text-amber-600' : 'text-blue-600'}`}>
                                            {asg.trip.state === 'IN_PROGRESS' ? 'EN CURSO' : 'PROGRAMADO'}
                                          </span>
                                        </div>
                                        <div className="text-gray-500 flex items-center gap-1">
                                          <Clock size={11}/> Salida: {asg.timeFormatted} | Chofer: {asg.trip.driverId.substring(0,6)}...
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Triangulito de la pantallita */}
                                  <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                              Disponible
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEdit(bus)}
                              className="text-navy-700 hover:text-navy-900 transition-colors p-1.5 rounded-lg hover:bg-navy-50"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(bus)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
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
              <h2 className="font-bold text-lg text-navy-900">{editing ? 'Editar bus' : 'Nuevo bus'}</h2>
              <button onClick={closeForm}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bus-plate" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Placa
                  </label>
                  <input
                    id="bus-plate"
                    name="plateNumber"
                    required
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
                    placeholder="PXX-0001"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.plateNumber && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.plateNumber}</p>}
                </div>
                <div>
                  <label htmlFor="bus-code" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Código interno
                  </label>
                  <input
                    id="bus-code"
                    name="internalCode"
                    required
                    type="text"
                    value={form.internalCode}
                    onChange={(e) => setForm((f) => ({ ...f, internalCode: e.target.value }))}
                    placeholder="BUS-001"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.internalCode && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.internalCode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bus-manufacturer" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Fabricante
                  </label>
                  <input
                    id="bus-manufacturer"
                    name="manufacturer"
                    required
                    type="text"
                    value={form.manufacturer}
                    onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
                    placeholder="Volkswagen"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.manufacturer && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.manufacturer}</p>}
                </div>
                <div>
                  <label htmlFor="bus-model" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Modelo
                  </label>
                  <input
                    id="bus-model"
                    name="model"
                    required
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="Volksbus"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.model && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.model}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bus-capacity" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Capacidad (asientos)
                  </label>
                  <input
                    id="bus-capacity"
                    name="seatCapacity"
                    required
                    type="number"
                    min={1}
                    value={form.seatCapacity}
                    onChange={(e) => setForm((f) => ({ ...f, seatCapacity: e.target.value }))}
                    placeholder="30"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.seatCapacity && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.seatCapacity}</p>}
                </div>
                <div>
                  <label htmlFor="bus-status" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Estado
                  </label>
                  <select
                    id="bus-status"
                    name="operationalStatus"
                    value={form.operationalStatus}
                    onChange={(e) => setForm((f) => ({ ...f, operationalStatus: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
                  >
                    <option value="OPERATIONAL">Operativo</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                    <option value="OUT_OF_SERVICE">Fuera de servicio</option>
                  </select>
                  {fieldErrors.operationalStatus && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.operationalStatus}</p>}
                </div>
              </div>

              {saveError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{saveError}</p>}

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
                  disabled={saving}
                  className="px-5 py-2 bg-navy-900 text-white text-sm font-bold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
