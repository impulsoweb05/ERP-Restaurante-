'use client';

import { useState } from 'react';
import type { Category, Subcategory } from '@/types';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Platos Principales', display_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: '2', name: 'Ensaladas', display_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: '3', name: 'Bebidas', display_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: '4', name: 'Postres', display_order: 4, is_active: true, created_at: '', updated_at: '' },
];

const mockSubcategories: Subcategory[] = [
  { id: '1', category_id: '1', name: 'Hamburguesas', display_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: '2', category_id: '1', name: 'Pizzas', display_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: '3', category_id: '1', name: 'Pastas', display_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: '4', category_id: '3', name: 'Jugos Naturales', display_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: '5', category_id: '3', name: 'Gaseosas', display_order: 2, is_active: true, created_at: '', updated_at: '' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(mockSubcategories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const toggleExpand = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleToggleCategoryStatus = (category: Category) => {
    setCategories(categories.map(c => 
      c.id === category.id ? { ...c, is_active: !c.is_active } : c
    ));
    toast.success(`Categoría ${category.is_active ? 'desactivada' : 'activada'}`);
  };

  const handleToggleSubcategoryStatus = (subcategory: Subcategory) => {
    setSubcategories(subcategories.map(s => 
      s.id === subcategory.id ? { ...s, is_active: !s.is_active } : s
    ));
    toast.success(`Subcategoría ${subcategory.is_active ? 'desactivada' : 'activada'}`);
  };

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`¿Eliminar "${category.name}"? Se eliminarán también sus subcategorías.`)) {
      setCategories(categories.filter(c => c.id !== category.id));
      setSubcategories(subcategories.filter(s => s.category_id !== category.id));
      toast.success('Categoría eliminada');
    }
  };

  const handleDeleteSubcategory = (subcategory: Subcategory) => {
    if (confirm(`¿Eliminar "${subcategory.name}"?`)) {
      setSubcategories(subcategories.filter(s => s.id !== subcategory.id));
      toast.success('Subcategoría eliminada');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Categorías</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organiza el menú con categorías y subcategorías
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowCategoryModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-gray-100 dark:border-secondary-700">
        <div className="divide-y divide-gray-100 dark:divide-secondary-700">
          {categories.map((category) => {
            const categorySubcategories = subcategories.filter(s => s.category_id === category.id);
            const isExpanded = expandedCategories.includes(category.id);

            return (
              <div key={category.id}>
                {/* Category Row */}
                <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-secondary-700/50">
                  <button className="text-gray-400 cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </button>
                  
                  {categorySubcategories.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}

                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-secondary-700 flex items-center justify-center">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">{category.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {categorySubcategories.length} subcategorías
                    </p>
                  </div>

                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    #{category.display_order}
                  </span>

                  <button
                    onClick={() => handleToggleCategoryStatus(category)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      category.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-secondary-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        category.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setEditingSubcategory(null);
                        setShowSubcategoryModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                      title="Agregar subcategoría"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {isExpanded && categorySubcategories.length > 0 && (
                  <div className="bg-gray-50 dark:bg-secondary-900/50">
                    {categorySubcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center gap-4 p-4 pl-20 hover:bg-gray-100 dark:hover:bg-secondary-700/50"
                      >
                        <button className="text-gray-400 cursor-grab">
                          <GripVertical className="h-4 w-4" />
                        </button>

                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-secondary-700 flex items-center justify-center">
                          {subcategory.image_url ? (
                            <img
                              src={subcategory.image_url}
                              alt={subcategory.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-gray-700 dark:text-gray-200">{subcategory.name}</p>
                        </div>

                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          #{subcategory.display_order}
                        </span>

                        <button
                          onClick={() => handleToggleSubcategoryStatus(subcategory)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            subcategory.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-secondary-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              subcategory.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedCategoryId(subcategory.category_id);
                              setEditingSubcategory(subcategory);
                              setShowSubcategoryModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(subcategory)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No hay categorías</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={(category) => {
            if (editingCategory) {
              setCategories(categories.map(c => c.id === category.id ? category : c));
              toast.success('Categoría actualizada');
            } else {
              setCategories([...categories, { ...category, id: Date.now().toString() }]);
              toast.success('Categoría creada');
            }
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          nextOrder={categories.length + 1}
        />
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <SubcategoryModal
          subcategory={editingSubcategory}
          categoryId={selectedCategoryId}
          categories={categories}
          onClose={() => {
            setShowSubcategoryModal(false);
            setEditingSubcategory(null);
          }}
          onSave={(subcategory) => {
            if (editingSubcategory) {
              setSubcategories(subcategories.map(s => s.id === subcategory.id ? subcategory : s));
              toast.success('Subcategoría actualizada');
            } else {
              setSubcategories([...subcategories, { ...subcategory, id: Date.now().toString() }]);
              toast.success('Subcategoría creada');
            }
            setShowSubcategoryModal(false);
            setEditingSubcategory(null);
          }}
          nextOrder={subcategories.filter(s => s.category_id === selectedCategoryId).length + 1}
        />
      )}
    </div>
  );
}

// Category Modal
function CategoryModal({
  category,
  onClose,
  onSave,
  nextOrder,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (category: Category) => void;
  nextOrder: number;
}) {
  const [form, setForm] = useState<Partial<Category>>(
    category || {
      name: '',
      display_order: nextOrder,
      is_active: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Orden
            </label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              min="1"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-secondary-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {category ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcategory Modal
function SubcategoryModal({
  subcategory,
  categoryId,
  categories,
  onClose,
  onSave,
  nextOrder,
}: {
  subcategory: Subcategory | null;
  categoryId: string;
  categories: Category[];
  onClose: () => void;
  onSave: (subcategory: Subcategory) => void;
  nextOrder: number;
}) {
  const [form, setForm] = useState<Partial<Subcategory>>(
    subcategory || {
      category_id: categoryId,
      name: '',
      display_order: nextOrder,
      is_active: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form as Subcategory);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-100 dark:border-secondary-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {subcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría Padre *
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Orden
            </label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              min="1"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-secondary-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {subcategory ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
