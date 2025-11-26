'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWaiter } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

// Test credentials - for demonstration purposes
const TEST_CREDENTIALS = [
  { code: 'MES001', pin: '1234' },
  { code: 'MES002', pin: '2345' },
  { code: 'MES003', pin: '3456' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, loadFromStorage } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 3 && newPin.every(digit => digit !== '')) {
      handleLogin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleLogin = async (pinValue?: string) => {
    const pinCode = pinValue || pin.join('');
    
    if (!code.trim()) {
      setError('Ingrese su código de empleado');
      return;
    }

    if (pinCode.length !== 4) {
      setError('Ingrese los 4 dígitos del PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, try real API login
      const response = await loginWaiter(code.toUpperCase(), pinCode);
      
      if (response.success) {
        setAuth(response.data.token, response.data.waiter);
        router.push('/dashboard');
      } else {
        setError(response.error || 'Error al iniciar sesión');
        setPin(['', '', '', '']);
        pinRefs[0].current?.focus();
      }
    } catch (err) {
      // If API fails, check test credentials (for demo purposes)
      const isTestCredential = TEST_CREDENTIALS.some(
        cred => cred.code === code.toUpperCase() && cred.pin === pinCode
      );

      if (isTestCredential) {
        // Create mock waiter for demo
        const mockWaiter = {
          id: `waiter-${code.toLowerCase()}`,
          code: code.toUpperCase(),
          name: `Mesero ${code.slice(-1)}`,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setAuth('demo-token-' + code, mockWaiter);
        router.push('/dashboard');
      } else {
        setError('Código o PIN incorrecto');
        setPin(['', '', '', '']);
        pinRefs[0].current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNumpadClick = (digit: string) => {
    const emptyIndex = pin.findIndex(p => p === '');
    if (emptyIndex !== -1) {
      handlePinChange(emptyIndex, digit);
    }
  };

  const handleNumpadDelete = () => {
    const lastFilledIndex = pin.map((p, i) => p !== '' ? i : -1).filter(i => i !== -1).pop();
    if (lastFilledIndex !== undefined) {
      handlePinChange(lastFilledIndex, '');
      pinRefs[lastFilledIndex].current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👨‍🍳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acceso Meseros</h1>
          <p className="text-gray-500 mt-2">Ingresa tu código y PIN</p>
        </div>

        {/* Employee Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Empleado
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="MES001"
            className="w-full px-4 py-3 text-lg font-mono rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all uppercase"
            disabled={loading}
          />
        </div>

        {/* PIN Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PIN (4 dígitos)
          </label>
          <div className="flex gap-3 justify-center">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={pinRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="pin-input"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleNumpadClick(digit)}
              disabled={loading}
              className="h-14 text-2xl font-semibold bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleNumpadDelete}
            disabled={loading}
            className="h-14 text-xl bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
          >
            ⌫
          </button>
          <button
            onClick={() => handleNumpadClick('0')}
            disabled={loading}
            className="h-14 text-2xl font-semibold bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={() => handleLogin()}
            disabled={loading || pin.some(p => p === '')}
            className="h-14 text-xl bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : '✓'}
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleLogin()}
          disabled={loading || !code || pin.some(p => p === '')}
          className="w-full py-4 bg-primary-500 text-white text-lg font-semibold rounded-xl hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Ingresando...</span>
            </>
          ) : (
            <span>Ingresar</span>
          )}
        </button>

        {/* Test Credentials Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 text-center mb-2">Credenciales de prueba:</p>
          <div className="text-xs text-gray-600 space-y-1">
            {TEST_CREDENTIALS.map((cred) => (
              <div key={cred.code} className="flex justify-between">
                <span className="font-mono">{cred.code}</span>
                <span className="font-mono">PIN: {cred.pin}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
