import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"

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
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
})

export function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {

    const { getToken, isSignedIn } = useAuth()

    const { user: clerkUser } = useUser()

    const [user, setUser] =
        useState<CurrentUser | null>(null)

    const [loading, setLoading] = useState(true)

    useEffect(() => {

        async function loadUser() {

            if (!isSignedIn || !clerkUser) {

                setLoading(false)

                return
            }

            try {

                const token = await getToken({
                    template: "uce-buslink",
                })

                // sync
                await fetch(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/sync`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                // me
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                const data = await response.json()

                setUser(data)

            } catch (error) {

                console.error(error)
            }

            setLoading(false)
        }

        loadUser()

    }, [isSignedIn, clerkUser])

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useCurrentUser() {

    return useContext(AuthContext)
}