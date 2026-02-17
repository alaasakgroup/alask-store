'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { FAQ } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    api.getFAQs(true).then(setFaqs);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">الأسئلة الشائعة</h1>
      
      {faqs.length === 0 ? (
        <p className="text-center text-gray-600">لا توجد أسئلة شائعة حالياً</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="bg-white border rounded-lg px-6"
            >
              <AccordionTrigger className="text-right hover:no-underline text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
