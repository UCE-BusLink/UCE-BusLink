import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth, useUser } from "@clerk/clerk-react"

interface CurrentUser {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
}

interface AuthContextType {
    user: CurrentUser | null
    loading: boolean
    syncDone: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    syncDone: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded } = useUser()
    const { getToken } = useAuth()
    const syncedRef = useRef(false)
    const [role, setRole] = useState<string>('STUDENT')
    const [syncComplete, setSyncComplete] = useState(false)
    const syncDone = isLoaded && (!clerkUser || syncComplete)

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
                    if (data.role) setRole(data.role)
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
          }
        : null

    return (
        <AuthContext.Provider value={{ user, loading: !isLoaded, syncDone }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useCurrentUser() {
    return useContext(AuthContext)
}
