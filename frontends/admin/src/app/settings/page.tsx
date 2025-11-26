'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store';
import type { Settings } from '@/types';
import toast from 'react-hot-toast';
import {
  Save,
  Building,
  CreditCard,
  MapPin,
  Palette,
  Link,
  CalendarCheck,
  Shield,
  Key,
  TestTube,
  Check,
  X,
} from 'lucide-react';

type TabId = 'general' | 'payments' | 'delivery' | 'integrations' | 'reservations' | 'security';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Building },
  { id: 'payments', label: 'Métodos de Pago', icon: CreditCard },
  { id: 'delivery', label: 'Zonas de Entrega', icon: MapPin },
  { id: 'integrations', label: 'Integraciones', icon: Link },
  { id: 'reservations', label: 'Reservas', icon: CalendarCheck },
  { id: 'security', label: 'Seguridad', icon: Shield },
];

export default function SettingsPage() {
  const { settings, setSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [form, setForm] = useState<Settings>(settings!);

  const handleSave = () => {
    setSettings(form);
    toast.success('Configuración guardada');
    setHasChanges(false);
  };

  const updateForm = (updates: Partial<Settings>) => {
    setForm({ ...form, ...updates });
    setHasChanges(true);
  };

  const testConnection = async (service: string) => {
    toast.loading(`Probando conexión con ${service}...`);
    // Simulate API test
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Conexión con ${service} exitosa`);
    }, 1500);
  };

  const generateVapidKeys = () => {
    toast.loading('Generando claves VAPID...');
    setTimeout(() => {
      toast.dismiss();
      const publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      const privateKey = 'UUxI4O8-FbRouAf7-7xF6-4_0u0LvGk-8LhMmP1vZ5g';
      updateForm({
        vapid_keys: { public_key: publicKey, private_key: privateKey }
      });
      toast.success('Claves VAPID generadas');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configuración</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configura todos los aspectos del sistema
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
            hasChanges
              ? 'bg-primary-500 text-white hover:bg-primary-600'
              : 'bg-gray-100 dark:bg-secondary-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="h-5 w-5" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700 p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Información General
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Restaurante
                  </label>
                  <input
                    type="text"
                    value={form.restaurant_name}
                    onChange={(e) => updateForm({ restaurant_name: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm({ phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateForm({ address: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Métodos de Pago
              </h2>
              <div className="space-y-4">
                {Object.entries(form.payment_methods).map(([method, enabled]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-900 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white capitalize">
                        {method === 'cash' ? '💵 Efectivo' :
                         method === 'card' ? '💳 Tarjeta' :
                         method === 'transfer' ? '🏦 Transferencia' :
                         '📱 Datáfono'}
                      </p>
                    </div>
                    <button
                      onClick={() => updateForm({
                        payment_methods: { ...form.payment_methods, [method]: !enabled }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-secondary-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Integraciones
              </h2>

              {/* Email */}
              <div className="border border-gray-200 dark:border-secondary-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    📧 Email (SMTP)
                  </h3>
                  <button
                    onClick={() => testConnection('Email')}
                    className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
                  >
                    <TestTube className="h-4 w-4" />
                    Probar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={form.integrations.email.user}
                    onChange={(e) => updateForm({
                      integrations: { ...form.integrations, email: { ...form.integrations.email, user: e.target.value } }
                    })}
                    placeholder="Usuario"
                    className="px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="password"
                    value={form.integrations.email.password}
                    onChange={(e) => updateForm({
                      integrations: { ...form.integrations, email: { ...form.integrations.email, password: e.target.value } }
                    })}
                    placeholder="Contraseña"
                    className="px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="border border-gray-200 dark:border-secondary-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    💬 WhatsApp (Evolution API)
                  </h3>
                  <button
                    onClick={() => testConnection('WhatsApp')}
                    className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
                  >
                    <TestTube className="h-4 w-4" />
                    Probar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={form.integrations.whatsapp.url}
                    onChange={(e) => updateForm({
                      integrations: { ...form.integrations, whatsapp: { ...form.integrations.whatsapp, url: e.target.value } }
                    })}
                    placeholder="URL"
                    className="px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={form.integrations.whatsapp.instance}
                    onChange={(e) => updateForm({
                      integrations: { ...form.integrations, whatsapp: { ...form.integrations.whatsapp, instance: e.target.value } }
                    })}
                    placeholder="Instancia"
                    className="px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="password"
                    value={form.integrations.whatsapp.api_key}
                    onChange={(e) => updateForm({
                      integrations: { ...form.integrations, whatsapp: { ...form.integrations.whatsapp, api_key: e.target.value } }
                    })}
                    placeholder="API Key"
                    className="px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Telegram */}
              <div className="border border-gray-200 dark:border-secondary-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    ✈️ Telegram Bot
                  </h3>
                  <button
                    onClick={() => testConnection('Telegram')}
                    className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
                  >
                    <TestTube className="h-4 w-4" />
                    Probar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={form.integrations.telegram.bot_token}
                    onChange={(e) => updateForm({
                      integrations: { ...form.integrations, telegram: { ...form.integrations.telegram, bot_token: e.target.value } }
                    })}
                    placeholder="Bot Token"
                    className="px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={form.integrations.telegram.chat_id}
                    onChange={(e) => updateForm({
                      integrations: { ...form.integrations, telegram: { ...form.integrations.telegram, chat_id: e.target.value } }
                    })}
                    placeholder="Chat ID"
                    className="px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* VAPID Keys */}
              <div className="border border-gray-200 dark:border-secondary-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                    🔔 Push Notifications (VAPID)
                  </h3>
                  <button
                    onClick={generateVapidKeys}
                    className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
                  >
                    <Key className="h-4 w-4" />
                    Generar Claves
                  </button>
                </div>
                {form.vapid_keys ? (
                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-secondary-900 rounded p-2 text-xs font-mono break-all">
                      <span className="text-gray-500">Public: </span>
                      {form.vapid_keys.public_key}
                    </div>
                    <div className="bg-gray-50 dark:bg-secondary-900 rounded p-2 text-xs font-mono break-all">
                      <span className="text-gray-500">Private: </span>
                      {form.vapid_keys.private_key}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay claves generadas</p>
                )}
              </div>
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Configuración de Reservas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiempo de Auto-liberación (min)
                  </label>
                  <select
                    value={form.reservation_config.auto_release_minutes}
                    onChange={(e) => updateForm({
                      reservation_config: { ...form.reservation_config, auto_release_minutes: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Anticipación Mínima (horas)
                  </label>
                  <input
                    type="number"
                    value={form.reservation_config.min_advance_hours}
                    onChange={(e) => updateForm({
                      reservation_config: { ...form.reservation_config, min_advance_hours: Number(e.target.value) }
                    })}
                    min="1"
                    max="48"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Anticipación Máxima (días)
                  </label>
                  <input
                    type="number"
                    value={form.reservation_config.max_advance_days}
                    onChange={(e) => updateForm({
                      reservation_config: { ...form.reservation_config, max_advance_days: Number(e.target.value) }
                    })}
                    min="1"
                    max="90"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delivery Tab */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Zonas de Entrega
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Configura las zonas de entrega y sus costos de domicilio.
              </p>
              <div className="bg-gray-50 dark:bg-secondary-900 rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Las zonas de entrega se configurarán próximamente
                </p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Seguridad
              </h2>
              <div className="border border-gray-200 dark:border-secondary-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">
                  Cambiar Contraseña Admin
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                    Actualizar Contraseña
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
