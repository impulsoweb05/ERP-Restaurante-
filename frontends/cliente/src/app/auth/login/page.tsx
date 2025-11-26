'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isValidPhone } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone
    if (!isValidPhone(phone)) {
      setError('Ingresa un número de teléfono válido (10 dígitos)');
      return;
    }

    setLoading(true);

    try {
      const result = await login(phone);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🍕</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Iniciar Sesión
          </h1>
          <p className="text-gray-500 mt-2">
            Ingresa tu número de teléfono para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Número de teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="3001234567"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              autoComplete="tel"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <p className="text-sm text-gray-400 mt-2">
              Solo 10 dígitos, sin espacios ni guiones
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full bg-primary-500 text-white font-semibold py-3 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner !border-white/30 !border-t-white !w-5 !h-5"></span>
                Verificando...
              </span>
            ) : (
              'Continuar'
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Si no tienes cuenta, se creará automáticamente
          </p>
        </form>
      </div>
    </div>
  );
}
