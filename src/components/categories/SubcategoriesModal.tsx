"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Category } from '@/lib/categories';

interface SubcategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export default function SubcategoriesModal({ 
  isOpen, 
  onClose, 
  category 
}: SubcategoriesModalProps) {
  const router = useRouter();

  if (!category) return null;

  const handleSubcategoryClick = (subcategoryId: string) => {
    router.push(`/dishes?categoryId=${category.id}&subcategoryId=${subcategoryId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            {category.imageUrl && (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.display = 'none';
                    }
                  }}
                />
              </div>
            )}
            {category.name} Subcategories
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-6">
            Choose from {category.subcategories?.length || 0} subcategories
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {category.subcategories?.map((subcategory) => (
              <motion.div
                key={subcategory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-300"
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={subcategory.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                            if (sibling) {
                              sibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-sm" style={{ display: category.imageUrl ? 'none' : 'flex' }}>
                        {subcategory.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-sm">{subcategory.name}</h4>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t bg-gray-50 rounded-b-lg">
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                router.push(`/dishes?categoryId=${category.id}`);
                onClose();
              }}
            >
              <div className="relative w-5 h-5 rounded overflow-hidden flex-shrink-0">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                    {category.name.charAt(0)}
                  </div>
                )}
              </div>
              View All {category.name} Products
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}