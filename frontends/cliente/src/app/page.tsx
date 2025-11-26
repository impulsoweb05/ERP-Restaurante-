'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCategories, fetchProducts, checkSchedule } from '@/services/api';
import type { Category, MenuItem, Schedule } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<MenuItem[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, productsRes, scheduleRes] = await Promise.all([
          fetchCategories(),
          fetchProducts({ status: 'active' }),
          checkSchedule(),
        ]);

        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
        }
        if (productsRes.success) {
          // Get top 6 products as "popular"
          setPopularProducts(productsRes.data.slice(0, 6));
        }
        if (scheduleRes.success) {
          setSchedule(scheduleRes.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido!</h1>
        <p className="text-primary-100 mb-4">
          Deliciosa comida entregada en tu puerta
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
          <span
            className={`w-2 h-2 rounded-full ${
              schedule?.isOpen ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <span className="text-sm font-medium">
            {schedule?.isOpen
              ? `Abierto hasta las ${schedule.closing_time}`
              : schedule?.message || 'Cerrado'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href="/menu"
            className={`flex-1 bg-white text-primary-500 font-semibold py-3 px-4 rounded-xl text-center transition-transform hover:scale-105 ${
              !schedule?.isOpen ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            🍕 Pedir Ahora
          </Link>
          <Link
            href="/reservations/new"
            className="flex-1 bg-white/20 text-white font-semibold py-3 px-4 rounded-xl text-center transition-transform hover:scale-105"
          >
            🪑 Reservar Mesa
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Categorías</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/menu?category=${category.id}`}
                className="flex-shrink-0 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow min-w-[120px] text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    '🍽️'
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">🔥 Más Populares</h2>
            <Link
              href="/menu"
              className="text-primary-500 text-sm font-medium hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Información</h2>
        <div className="space-y-3 text-gray-600">
          <div className="flex items-center gap-3">
            <span className="text-xl">📍</span>
            <span>Calle Principal #123, Ciudad</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">📞</span>
            <span>(555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🕐</span>
            <span>Lun-Dom: 11:00 AM - 10:00 PM</span>
          </div>
        </div>
      </section>
    </div>
  );
}
