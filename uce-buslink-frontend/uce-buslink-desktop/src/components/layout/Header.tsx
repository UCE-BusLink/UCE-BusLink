import { UserButton } from '@clerk/clerk-react'

export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">
        Mi App
      </h1>

      <UserButton afterSignOutUrl="/login" />
    </header>
  )
}