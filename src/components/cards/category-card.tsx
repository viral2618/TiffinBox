"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubcategoriesModal from '@/components/categories/SubcategoriesModal';
import type { Category } from '@/lib/categories';

interface CategoryCardProps {
  category: Category;
  variants?: any;
  isHomePage?: boolean;
}

export default function CategoryCard({ 
  category, 
  variants,
  isHomePage = false
}: CategoryCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        variants={variants}
        className="flex flex-col category-card"
        style={{ backgroundColor: '#fef3e2', border: '1px solid rgba(69, 26, 3, 0.1)', borderRadius: '8px', padding: '12px' }}
      >
        <div
          className="cursor-pointer group"
          onClick={() => router.push(`/dishes?categoryId=${category.id}`)}
        >
          <div className="relative w-full aspect-[3/2] overflow-hidden rounded-lg" style={{ border: '2px solid rgba(252, 124, 124, 0.2)' }}>
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-115 transition-transform duration-300 ease-in-out"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                style={{ backgroundColor: '#ffffff' }}
              >
                <span className="text-4xl font-bold" style={{ color: '#fc7c7c' }}>{category.name.charAt(0)}</span>
              </div>
            )}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
              <div className="text-center text-white">
                <h4 className="text-lg font-bold mb-2">{category.name}</h4>
                <p className="text-sm font-semibold">View Products</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 
                className={`${isHomePage ? 'text-lg' : 'text-2xl'} font-bold uppercase tracking-wider hover:text-primary transition-colors`}
                style={{ color: '#451a03' }}
              >
                {category.name}
              </h3>
              <div className="flex items-center">
                <div className="w-12 h-0.5 mr-2" style={{ backgroundColor: '#fc7c7c' }}></div>
                {category.subcategories && category.subcategories.length > 0 && (
                  <span className="text-sm font-normal" style={{ color: '#451a03' }}>({category.subcategories.length})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories Button */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs flex items-center gap-1 hover:bg-accent/50"
              style={{ color: '#451a03' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              View {category.subcategories.length} Subcategories <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </motion.div>

      <SubcategoriesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={category}
      />
    </>
  );
}

export type { Category };