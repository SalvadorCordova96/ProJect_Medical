import { Toaster } from '@/components/ui/sonner'
import { setupAuthInterceptor } from '@/modules/auth/utils/authInterceptor'
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { AppRoutes } from '@/routes/AppRoutes'
import axios from 'axios'

setupAuthInterceptor()

const token = useAuthStore.getState().token
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  )
}

export default App