import { useEffect, useState } from 'react';
import { HeroCarousel } from '../components/storefront/HeroCarousel';
import { ProductCard } from '../components/storefront/ProductCard';
import { api } from '../lib/api';
import type { Product, FAQ } from '../lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../app/components/ui/accordion';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    Promise.all([
      api.getProducts({ featured: true }),
      api.getProducts({ isNew: true }),
      api.getFAQs(true)
    ]).then(([featured, newProds, faqList]) => {
      setFeaturedProducts(featured);
      setNewProducts(newProds);
      setFaqs(faqList.slice(0, 5)); // Show only first 5
    });
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Carousel */}
      <section>
        <HeroCarousel />
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-3xl font-bold mb-8">الأكثر طلباً</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Products */}
      {newProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-8">وصل حديثاً</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ Preview */}
      <section className="bg-gray-50 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">الأسئلة الشائعة</h2>
          <Link 
            to="/faq"
            className="text-primary hover:underline flex items-center gap-2"
          >
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="bg-white rounded-lg px-4"
            >
              <AccordionTrigger className="text-right hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}