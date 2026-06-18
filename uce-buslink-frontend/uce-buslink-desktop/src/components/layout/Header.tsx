import { UserButton } from '@clerk/clerk-react'
import logoHorizontal from '../../assets/brand/LogoHorizontal.png'

export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <img
        src={logoHorizontal}
        alt="UCE Bus-Link"
        className="h-16 w-auto object-contain"
      />

      <UserButton afterSignOutUrl="/login" />
    </header>
  )
}
