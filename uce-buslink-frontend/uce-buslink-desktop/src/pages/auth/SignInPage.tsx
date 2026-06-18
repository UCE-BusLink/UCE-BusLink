import { SignIn } from '@clerk/clerk-react'
import heroImg from '../../assets/brand/FacePage.webp';
import brandLogo from '../../assets/brand/Logo.png';

export function SignInPage() {
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


          {/* CLERK */}
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            afterSignInUrl="/dashboard"
            appearance={{
              elements: {
                card: 'shadow-none border-0 p-0',
                rootBox: 'w-full',
                formButtonPrimary:
                  'bg-navy-900 hover:bg-navy-800 text-white rounded-xl h-11',
                formFieldInput:
                  'rounded-xl border-gray-200 focus:border-navy-800 focus:ring-0',
                socialButtonsBlockButton:
                  'rounded-full border-gray-200 hover:bg-gray-50',
                footerActionLink:
                  'text-navy-900 font-semibold hover:text-navy-700',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}