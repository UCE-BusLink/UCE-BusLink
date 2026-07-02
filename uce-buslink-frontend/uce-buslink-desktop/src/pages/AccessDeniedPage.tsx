import { useAuth } from '@clerk/clerk-react'
import { ShieldAlert } from 'lucide-react'
import { useCurrentUser } from '../context/AuthContext'

export function AccessDeniedPage() {
  const { signOut } = useAuth()
  const { user } = useCurrentUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldAlert size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-navy-900 mb-2">Acceso restringido</h1>
        <p className="text-sm text-gray-500 mb-6">
          Esta aplicación de escritorio es exclusiva para administradores de UCE Bus-Link.
          {user?.email ? ` La cuenta ${user.email} no tiene permisos de administrador.` : ''}
        </p>
        <button
          onClick={() => signOut()}
          className="w-full h-11 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
