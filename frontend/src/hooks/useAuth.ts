import { useState } from 'react';
import { login as apiLogin } from '@/lib/api/auth';

interface AuthState {
  user: null | { email: string };
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null,
  });

  const Login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiLogin(email, password);
      setState(prev => ({
        ...prev,
        user: { email },
        token: response.token,
        loading: false,
      }));
      return response;
    } catch {
      setState(prev => ({
        ...prev,
        error: 'Credenciales Inválidas',
        loading: false,
      }));
      throw new Error('Credenciales Inválidas');
    }
  };

  return { ...state, Login };
};
