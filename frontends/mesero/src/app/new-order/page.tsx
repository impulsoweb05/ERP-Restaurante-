'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { fetchCategories, fetchProducts, createOrder, fetchTable } from '@/services/api';
import type { Category, MenuItem, OrderItem, Table } from '@/types';

interface LocalOrderItem extends Omit<OrderItem, 'id' | 'status'> {
  localId: string;
}

function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  
  const { waiter, isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<LocalOrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetchCategories(),
          fetchProducts({ status: 'active' }),
        ]);

        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
          if (categoriesRes.data.length > 0) {
            setSelectedCategory(categoriesRes.data[0].id);
          }
        }
        if (productsRes.success) {
          setProducts(productsRes.data);
        }

        if (tableId) {
          const tableRes = await fetchTable(tableId);
          if (tableRes.success) {
            setTable(tableRes.data);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tableId]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.menu_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProduct = (product: MenuItem) => {
    setSelectedProduct(product);
    setItemQuantity(1);
    setItemNotes('');
    setShowItemModal(true);
  };

  const handleConfirmItem = () => {
    if (!selectedProduct) return;

    const newItem: LocalOrderItem = {
      localId: `${Date.now()}-${Math.random()}`,
      menu_item_id: selectedProduct.id,
      name: selectedProduct.name,
      quantity: itemQuantity,
      unit_price: selectedProduct.price,
      special_instructions: itemNotes || undefined,
    };

    setOrderItems(prev => [...prev, newItem]);
    setShowItemModal(false);
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (localId: string, delta: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.localId === localId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (localId: string) => {
    setOrderItems(prev => prev.filter(item => item.localId !== localId));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const suggestedTip = Math.round(subtotal * 0.1);
  const total = subtotal;

  const handleSubmitOrder = async () => {
    if (!waiter?.id || !tableId || orderItems.length === 0) return;

    setSubmitting(true);

    try {
      const orderData = {
        waiter_id: waiter.id,
        table_id: tableId,
        order_type: 'dine_in' as const,
        items: orderItems.map(({ localId, ...item }) => item),
      };

      const response = await createOrder(orderData);

      if (response.success) {
        router.push(`/my-orders/${response.data.id}?success=true`);
      } else {
        alert(response.error || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ←
              </button>
              <div>
                <h1 className="font-bold text-gray-900">
                  {table ? `Mesa ${table.number}` : 'Nuevo Pedido'}
                </h1>
                <p className="text-sm text-gray-500">
                  {table?.zone || 'Selecciona productos'}
                </p>
              </div>
            </div>
            {orderItems.length > 0 && (
              <div className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                {orderItems.length} items
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Product Selection */}
        <div className="flex-1 p-4">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 border'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddProduct(product)}
                className="bg-white rounded-xl p-3 shadow-sm text-left hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-3xl">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    '🍽️'
                  )}
                </div>
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {product.name}
                </h3>
                <p className="text-primary-600 font-semibold text-sm">
                  ${product.price.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-gray-500">
                  ⏱️ {product.preparation_time} min
                </p>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No se encontraron productos
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-96 bg-white border-t lg:border-t-0 lg:border-l p-4 sticky bottom-0 lg:top-0 lg:h-screen lg:overflow-y-auto">
          <h2 className="font-bold text-lg text-gray-900 mb-4">
            🧾 Pedido Actual
          </h2>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">📋</span>
              <p>Agrega productos al pedido</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-60 lg:max-h-96 overflow-y-auto">
                {orderItems.map((item) => (
                  <div
                    key={item.localId}
                    className="bg-gray-50 rounded-xl p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          ${item.unit_price.toLocaleString('es-CO')} c/u
                        </p>
                        {item.special_instructions && (
                          <p className="text-xs text-gray-400 mt-1">
                            📝 {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.localId)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.localId, -1)}
                          className="w-8 h-8 rounded-full bg-gray-200 font-bold"
                        >
                          -
                        </button>
                        <span className="font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.localId, 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-primary-600">
                        ${(item.quantity * item.unit_price).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Propina sugerida (10%)</span>
                  <span>${suggestedTip.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary-600">${total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting || orderItems.length === 0}
                className="w-full mt-4 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="spinner border-white border-t-transparent"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>✅ Enviar a Cocina</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showItemModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-xl text-gray-900 mb-4">
              {selectedProduct.name}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {selectedProduct.description || 'Sin descripción'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  className="w-12 h-12 rounded-full bg-gray-200 font-bold text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-12 text-center">
                  {itemQuantity}
                </span>
                <button
                  onClick={() => setItemQuantity(itemQuantity + 1)}
                  className="w-12 h-12 rounded-full bg-gray-200 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas especiales
              </label>
              <textarea
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Ej: Sin cebolla, bien cocido..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmItem}
                className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium"
              >
                Agregar ${(selectedProduct.price * itemQuantity).toLocaleString('es-CO')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    }>
      <NewOrderContent />
    </Suspense>
  );
}
