
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './Pages/Provider/AuthProvider'

/**
 * Protege rotas abaixo dela.
 * - Se NÃO houver token => redireciona para /signup
 * - Se houver token => renderiza as rotas-filhas (<Outlet />)
 */
export default function RequireAuth() {
  const { token } = useAuth()
  const location = useLocation()

  if (!token) {
    // volta para onde o usuário tentou ir depois que fizer signup/login
    return <Navigate to="/signup" replace state={{ from: location }} />
  }

  return <Outlet />
}
