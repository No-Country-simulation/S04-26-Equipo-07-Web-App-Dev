import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserAuthProvider } from '@/contexts/UserAuthContext'
import { WorkerAuthProvider } from '@/contexts/WorkerAuthContext'

import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserAuthProvider>
        <WorkerAuthProvider>
          <App />
        </WorkerAuthProvider>
      </UserAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
