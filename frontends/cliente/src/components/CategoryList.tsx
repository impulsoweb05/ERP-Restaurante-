'use client';

import Link from 'next/link';
import type { Category } from '@/types';

interface CategoryListProps {
  categories: Category[];
  activeCategory?: string;
}

export default function CategoryList({ categories, activeCategory }: CategoryListProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/menu"
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !activeCategory
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/menu?category=${category.id}`}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === category.id
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
