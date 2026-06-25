import { useState, useEffect } from 'react';
import { Truck, RefreshCw, CheckCircle, Plus, X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { fetchBuses, createBus, type ApiBus } from '../../services/adminService';

const EMPTY_FORM = {
  plateNumber: '',
  internalCode: '',
  seatCapacity: '',
  manufacturer: '',
  model: '',
};

export function AdminBusesPage() {
  const { getToken } = useAuth();
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSaveError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    await createBus(token, {
      plateNumber: form.plateNumber.trim(),
      internalCode: form.internalCode.trim(),
      seatCapacity: Number(form.seatCapacity),
      manufacturer: form.manufacturer.trim(),
      model: form.model.trim(),
      operationalStatus: 'OPERATIONAL',
    })
      .then(() => { closeForm(); refresh(); })
      .catch(() => setSaveError('No se pudo crear el bus. Verifica los datos e intenta de nuevo.'))
      .finally(() => setSaving(false));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Buses</h1>
          <p className="text-gray-500 text-sm mt-1">{total} unidades en flota</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
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
        ) : buses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No hay buses registrados.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Placa</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Fabricante / Modelo</th>
                <th className="px-5 py-3">Capacidad</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {buses.map((bus) => (
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
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full w-fit">
                      <CheckCircle size={12} />
                      {bus.operationalStatus}
                    </span>
                  </td>
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
              <h2 className="font-semibold text-navy-900">Nuevo bus</h2>
              <button onClick={closeForm}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
                  {saving ? 'Creando...' : 'Crear bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
