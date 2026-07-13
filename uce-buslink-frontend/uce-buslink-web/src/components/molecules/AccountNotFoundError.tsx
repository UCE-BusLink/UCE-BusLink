import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AccountNotFoundError() {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-red-900 mb-1">No encontramos tu cuenta</h3>
        <p className="text-sm text-red-700 mb-3">
          Este correo no está registrado en el sistema. Si eres estudiante, regístrate con tu
          correo institucional. Si eres chofer, contacta al administrador.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800 transition"
        >
          Crear una cuenta
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
