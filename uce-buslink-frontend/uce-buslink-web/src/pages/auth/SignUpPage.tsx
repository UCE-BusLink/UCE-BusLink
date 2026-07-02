import { SignUp } from '@clerk/clerk-react'
import heroImg from '../../assets/brand/FacePage.webp';
import brandLogo from '../../assets/brand/Logo.png';

export function SignUpPage() {
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
            Únete a la red de transporte universitario más segura
          </h2>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm py-6">
          {/* LOGO */}
          <div className="flex justify-center mb-8">
            <img
              src={brandLogo}
              alt="UCE Bus-Link"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* TITLE */}
          <h1 className="text-2xl font-bold text-navy-900 mb-1">
            Crear cuenta
          </h1>

          <p className="text-gray-500 text-sm mb-7">
            Regístrate con tu correo institucional
          </p>

          {/* CLERK */}
          <SignUp
            routing="path"
            path="/register"
            signInUrl="/login"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                card: 'shadow-none border-0 p-0',
                rootBox: 'w-full',

                headerTitle: 'hidden',
                headerSubtitle: 'hidden',

                footer: 'hidden',

                formButtonPrimary:
                  'bg-navy-900 hover:bg-navy-800 text-white rounded-xl h-11',

                formFieldInput:
                  'rounded-xl border-gray-200 focus:border-navy-800 focus:ring-0',

                socialButtonsBlockButton:
                  'rounded-full border-gray-200 hover:bg-gray-50',

                footerActionLink:
                  'text-navy-900 font-semibold hover:text-navy-700',

                formFieldLabel:
                  'text-gray-700 text-sm font-medium',

                identityPreviewText:
                  'text-sm',

                formResendCodeLink:
                  'text-navy-900 font-medium',
              },
            }}
          />

          {/* TERMS */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Al registrarte, aceptas nuestros{' '}
            <span className="underline cursor-pointer">
              Términos de Servicio
            </span>{' '}
            y{' '}
            <span className="underline cursor-pointer">
              Política de Privacidad
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}