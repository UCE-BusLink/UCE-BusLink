import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ServerOff, RefreshCw } from 'lucide-react';
import heroImg from '../../assets/brand/FacePage.webp';
import brandLogo from '../../assets/brand/Logo.png';

const API_URL = import.meta.env.VITE_API_URL as string;

type ServerStatus = 'checking' | 'online' | 'offline';

async function checkServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_URL}/actuator/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export function SignInPage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');

  useEffect(() => {
    let active = true;
    checkServerHealth().then((ok) => {
      if (active) setServerStatus(ok ? 'online' : 'offline');
    });
    return () => {
      active = false;
    };
  }, []);

  const retryConnection = () => {
    setServerStatus('checking');
    checkServerHealth().then((ok) => setServerStatus(ok ? 'online' : 'offline'));
  };
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
          {/* LOGO */}
          <div className="flex justify-center mb-8">
            <img
              src={brandLogo}
              alt="UCE Bus-Link"
              className="h-24 w-auto object-contain"
            />
          </div>


          {serverStatus === 'checking' && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Verificando conexión con el servidor...</p>
            </div>
          )}

          {serverStatus === 'offline' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                <ServerOff size={26} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy-900 mb-1">
                  Servidor no disponible
                </h2>
                <p className="text-sm text-gray-500 max-w-xs">
                  No se pudo conectar con el servidor de UCE Bus-Link.
                  Verifica tu conexión a internet o intenta más tarde.
                </p>
              </div>
              <button
                onClick={retryConnection}
                className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors"
              >
                <RefreshCw size={15} />
                Reintentar
              </button>
            </div>
          )}

          {serverStatus === 'online' && (
            <>
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/register"
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    card: 'shadow-none border-0 p-0',
                    rootBox: 'w-full',
                    formButtonPrimary:
                      'bg-navy-900 hover:bg-navy-800 text-white rounded-xl h-11',
                    formFieldInput:
                      'rounded-xl border-gray-200 focus:border-navy-800 focus:ring-0',
                    socialButtons: 'hidden',
                    socialButtonsBlockButton: 'hidden',
                    dividerRow: 'hidden',
                    footerActionLink:
                      'text-navy-900 font-semibold hover:text-navy-700',
                  },
                }}
              />

              <p className="text-center text-sm text-gray-500 mt-4">
                <Link to="/forgot-password" className="text-navy-900 font-semibold hover:text-navy-700">
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}