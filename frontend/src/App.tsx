import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { roteador } from './rotas';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={roteador} />
    </AuthProvider>
  );
}
