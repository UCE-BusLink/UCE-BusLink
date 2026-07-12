import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth, useUser } from "@clerk/clerk-react"

interface CurrentUser {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    needsOnboarding: boolean
}

interface AuthContextType {
    user: CurrentUser | null
    loading: boolean
    syncDone: boolean
    updateOnboardingStatus: (status: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    syncDone: false,
    updateOnboardingStatus: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded } = useUser()
    const { getToken } = useAuth()
    const syncedUserIdRef = useRef<string | null>(null)
    const [role, setRole] = useState<string>(() => localStorage.getItem('buslink_role') || 'STUDENT')
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(() => localStorage.getItem('buslink_onboarding') === 'true')
    const [syncComplete, setSyncComplete] = useState(false)
    const syncDone = isLoaded && (!clerkUser || syncComplete)

    const updateOnboardingStatus = (status: boolean) => {
        setNeedsOnboarding(status)
        localStorage.setItem('buslink_onboarding', status.toString())
    }

    useEffect(() => {
        if (!isLoaded) return

        if (!clerkUser) {
            syncedUserIdRef.current = null
            return
        }

        // Re-sincroniza si cambia la cuenta (logout + login de otra cuenta en la
        // misma pestaña), en vez de confiar en el rol cacheado de la sesión anterior.
        if (syncedUserIdRef.current === clerkUser.id) return
        syncedUserIdRef.current = clerkUser.id
        setSyncComplete(false)

        async function syncToBackend() {
            try {
                const token = await getToken({ template: "uce-buslink" })
                if (!token) throw new Error('No se pudo obtener el token de Clerk')
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/sync`,
                    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
                )
                if (!res.ok) throw new Error(`Sync falló con status ${res.status}`)
                const data = await res.json()
                const nextRole = data.role ?? 'STUDENT'
                const nextOnboarding = data.needsOnboarding ?? false
                setRole(nextRole)
                setNeedsOnboarding(nextOnboarding)
                localStorage.setItem('buslink_role', nextRole)
                localStorage.setItem('buslink_onboarding', nextOnboarding.toString())
            } catch {
                // La cuenta no se pudo validar contra el backend: no confiar en
                // un rol cacheado de una sesión anterior en este navegador.
                setRole('STUDENT')
                setNeedsOnboarding(false)
                localStorage.removeItem('buslink_role')
                localStorage.removeItem('buslink_onboarding')
            } finally {
                setSyncComplete(true)
            }
        }

        syncToBackend()
    }, [isLoaded, clerkUser, getToken])

    const user: CurrentUser | null = clerkUser
        ? {
              id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
              firstName: clerkUser.firstName ?? "",
              lastName: clerkUser.lastName ?? "",
              role,
              needsOnboarding,
          }
        : null

    return (
        <AuthContext.Provider value={{ user, loading: !isLoaded, syncDone, updateOnboardingStatus }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useCurrentUser() {
    return useContext(AuthContext)
}
