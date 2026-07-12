import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth, useUser } from "@clerk/clerk-react"
import { syncErrorSchema, syncResponseSchema } from "../schemas/auth.schema"

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
    syncError: string | null
    updateOnboardingStatus: (status: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    syncDone: false,
    syncError: null,
    updateOnboardingStatus: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded } = useUser()
    const { getToken, signOut } = useAuth()
    const syncedUserIdRef = useRef<string | null>(null)
    const [role, setRole] = useState<string>(() => localStorage.getItem('buslink_role') || 'STUDENT')
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(() => localStorage.getItem('buslink_onboarding') === 'true')
    const [syncComplete, setSyncComplete] = useState(false)
    const [syncError, setSyncError] = useState<string | null>(null)
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
        setSyncError(null)

        async function syncToBackend() {
            try {
                const token = await getToken({ template: "uce-buslink" })
                if (!token) throw new Error('No se pudo obtener el token de Clerk')
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/sync`,
                    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
                )

                if (!res.ok) {
                    const body = await res.json().catch(() => null)
                    const parsedError = syncErrorSchema.safeParse(body)

                    // La cuenta existe en Clerk pero no en la BD de este ambiente:
                    // cerrar sesión y devolver al login con el error visible.
                    if (parsedError.success && parsedError.data.error === 'user_not_found') {
                        setSyncError(parsedError.data.message)
                        localStorage.removeItem('buslink_role')
                        localStorage.removeItem('buslink_onboarding')
                        await signOut({ redirectUrl: '/login?error=account_not_found' })
                        return
                    }

                    throw new Error(`Sync falló con status ${res.status}`)
                }

                const data = syncResponseSchema.parse(await res.json())
                setRole(data.role)
                setNeedsOnboarding(data.needsOnboarding)
                localStorage.setItem('buslink_role', data.role)
                localStorage.setItem('buslink_onboarding', data.needsOnboarding.toString())
                setSyncComplete(true)
            } catch {
                // La cuenta no se pudo validar contra el backend: no confiar en
                // un rol cacheado de una sesión anterior en este navegador.
                setRole('STUDENT')
                setNeedsOnboarding(false)
                localStorage.removeItem('buslink_role')
                localStorage.removeItem('buslink_onboarding')
                setSyncComplete(true)
            }
        }

        syncToBackend()
    }, [isLoaded, clerkUser, getToken, signOut])

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
        <AuthContext.Provider value={{ user, loading: !isLoaded, syncDone, syncError, updateOnboardingStatus }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useCurrentUser() {
    return useContext(AuthContext)
}
