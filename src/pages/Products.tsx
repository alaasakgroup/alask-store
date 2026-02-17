import { useEffect, useState } from 'react';
import { ProductCard } from '../components/storefront/ProductCard';
import { api } from '../lib/api';
import type { Product, Category } from '../lib/types';
import { Button } from '../app/components/ui/button';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts()
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-4">جميع المنتجات</h1>
        <p className="text-gray-600">استكشف مجموعتنا الكاملة من إكسسوارات المطبخ عالية الجودة</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
        >
          الكل
        </Button>
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">لا توجد منتجات في هذه الفئة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
