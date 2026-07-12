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
    const syncedRef = useRef(false)
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
        if (!clerkUser) return
        if (syncedRef.current) return
        syncedRef.current = true

        async function syncToBackend() {
            try {
                const token = await getToken({ template: "uce-buslink" })
                if (!token) return
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/sync`,
                    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
                )
                if (res.ok) {
                    const data = await res.json()
                    if (data.role) {
                        setRole(data.role)
                        localStorage.setItem('buslink_role', data.role)
                    }
                    if (data.needsOnboarding !== undefined) {
                        setNeedsOnboarding(data.needsOnboarding)
                        localStorage.setItem('buslink_onboarding', data.needsOnboarding.toString())
                    }
                }
            } catch {
                // silencioso
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
