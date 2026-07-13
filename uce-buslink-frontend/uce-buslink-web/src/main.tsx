import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createIDBPersister } from './services/queryPersister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep offline data longer)
      refetchOnWindowFocus: false,
      retry: 2,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 3,
    }
  },
});

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_c21hc2hpbmctdGVybWl0ZS0xOS5jbGVyay5hY2NvdW50cy5kZXYk'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <PersistQueryClientProvider 
        client={queryClient}
        persistOptions={{ persister: createIDBPersister(), buster: __BUILD_ID__ }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </PersistQueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)