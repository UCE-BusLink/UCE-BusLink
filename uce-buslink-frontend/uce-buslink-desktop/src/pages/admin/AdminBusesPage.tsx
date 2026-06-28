import { useState, useEffect } from 'react';
import { Truck, RefreshCw, CheckCircle, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  fetchBuses, createBus, updateBus, deleteBus, changeBusStatus, type ApiBus,
} from '../../services/adminService';

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
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiBus | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBuses = buses.filter((bus) =>
    statusFilter === 'ALL'
      ? true
      : bus.operationalStatus === statusFilter
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        const page = await fetchBuses(token, 0, 50);
        setBuses(page.content);
        setTotal(page.totalElements);
        setError(null);
      } catch {
        setError('No se pudieron cargar los buses');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    try {
      const data = {
        plateNumber: form.plateNumber.trim(),
        internalCode: form.internalCode.trim(),
        seatCapacity: Number(form.seatCapacity),
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
      };
      if (editing) {
        await updateBus(token, editing.id, data);
        if (form.operationalStatus !== editing.operationalStatus) {
          await changeBusStatus(token, editing.id, form.operationalStatus);
        }
      } else {
        await createBus(token, { ...data, operationalStatus: form.operationalStatus });
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

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Buses</h1>
          <p className="text-gray-500 text-sm mt-1">{total} unidades en flota</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
          >
            <option value="ALL">Todos</option>
            <option value="OPERATIONAL">Operativos</option>
            <option value="MAINTENANCE">Mantenimiento</option>
            <option value="OUT_OF_SERVICE">Fuera de servicio</option>
          </select>

          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Recargar
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <Plus size={15} />
            Nuevo bus
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
        ) : filteredBuses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No hay buses registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3">Placa</th>
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Fabricante / Modelo</th>
                  <th className="px-5 py-3">Capacidad</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                          <Truck size={14} className="text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold text-navy-900">{bus.plateNumber}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{bus.internalCode}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {bus.manufacturer} {bus.model}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{bus.seatCapacity} asientos</td>
                    <td className="px-5 py-4">
                      <span
                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${bus.operationalStatus === 'OPERATIONAL'
                            ? 'bg-green-50 text-green-600'
                            : bus.operationalStatus === 'MAINTENANCE'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-red-50 text-red-600'
                          }`}
                      >
                        <CheckCircle size={12} />
                        {statusLabels[bus.operationalStatus] ?? bus.operationalStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(bus)}
                          className="flex items-center gap-1 text-xs font-medium text-navy-700 hover:text-navy-900 transition-colors px-2 py-1 rounded-lg hover:bg-navy-50"
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(bus)}
                          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-navy-900">{editing ? 'Editar bus' : 'Nuevo bus'}</h2>
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bus-capacity" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Capacidad de asientos
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  >
                    <option value="OPERATIONAL">Operativo</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                    <option value="OUT_OF_SERVICE">Fuera de servicio</option>
                  </select>
                </div>
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
                  disabled={saving}
                  className="px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
