'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginKitchen } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [stationCode, setStationCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePinClick = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!stationCode.trim()) {
      setError('Ingresa el código de estación');
      return;
    }
    if (pin.length !== 4) {
      setError('El PIN debe ser de 4 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await loginKitchen(stationCode.toUpperCase(), pin);
      if (response.success) {
        setAuth(response.data.token, response.data.user);
        router.replace('/queue');
      } else {
        setError(response.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Código o PIN incorrecto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <span className="text-6xl mb-4 block">🧑‍🍳</span>
        <h1 className="text-3xl font-bold text-white mb-2">Cocina</h1>
        <p className="text-gray-400">Sistema de comandas</p>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 shadow-xl">
        {/* Station Code Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Código de Estación
          </label>
          <input
            type="text"
            value={stationCode}
            onChange={(e) => {
              setStationCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Ej: COC001"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-xl font-mono placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            maxLength={10}
          />
        </div>

        {/* PIN Display */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">PIN</label>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                  pin.length > index
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-400'
                }`}
              >
                {pin.length > index ? '•' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(
            (key) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'C') handleClear();
                  else if (key === '⌫') handleBackspace();
                  else handlePinClick(key);
                }}
                disabled={isLoading}
                className={`h-16 rounded-xl text-2xl font-bold transition-all btn-press disabled:opacity-50 ${
                  key === 'C'
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    : key === '⌫'
                    ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {key}
              </button>
            )
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !stationCode || pin.length !== 4}
          className="w-full py-4 bg-orange-500 text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-press"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner w-6 h-6 border-2 border-white/30 border-t-white" />
              Ingresando...
            </span>
          ) : (
            'Ingresar'
          )}
        </button>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-400 text-center mb-2">
            Credenciales de prueba:
          </p>
          <div className="text-sm text-gray-300 text-center space-y-1">
            <p>
              <code className="bg-gray-600 px-2 py-0.5 rounded">COC001</code> / PIN:{' '}
              <code className="bg-gray-600 px-2 py-0.5 rounded">4567</code>
            </p>
            <p>
              <code className="bg-gray-600 px-2 py-0.5 rounded">COC002</code> / PIN:{' '}
              <code className="bg-gray-600 px-2 py-0.5 rounded">5678</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
