"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DishPreparationToggle from "@/components/dishes/DishPreparationToggle";
import { getCurrencySymbol, type CurrencyCode } from "@/lib/currency";

interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  originalPrice?: number;
  discountPercentage?: number;
  prepTimeMinutes?: number;
  imageUrls: string[];
  isVeg: boolean;
  shopId: string;
  category: {
    name: string;
  };
  subcategory?: {
    name: string;
  };
  shop: {
    name: string;
  };
}

export default function MyDishesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const itemsPerPage = 12;

  const truncateToTwoSentences = (text: string) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ').trim() || text.substring(0, 100) + '...';
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetch('/api/owner/products');
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        setDishes(data || []);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Failed to fetch dishes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDish = async (dishId: string, shopId: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) {
      return;
    }

    try {
      const response = await fetch(`/api/owner/shop/${shopId}/dishes?dishId=${dishId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Dish deleted successfully!');
        fetchDishes(); // Refresh the list
      } else {
        throw new Error('Failed to delete dish');
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Failed to delete dish');
    }
  };

  const filteredDishes = dishes.filter(dish =>
    dish?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDishes = filteredDishes.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading dishes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">My Dishes</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your dishes and menu items</p>
        </div>
        <Button onClick={() => router.push('/owner/dashboard/add-dish')} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Dish
        </Button>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="hidden sm:block absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none z-10" />
          <Input
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:pl-10 pr-4"
          />
        </div>
        {filteredDishes.length > 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredDishes.length)} of {filteredDishes.length}
          </p>
        )}
      </div>

      {filteredDishes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No dishes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No dishes match your search.' : 'You haven\'t added any dishes yet.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/owner/dashboard/add-dish')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Dish
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {paginatedDishes.map((dish) => (
            <Card key={dish.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md cursor-pointer" onClick={() => setSelectedDish(dish)}>
              {dish.imageUrls && dish.imageUrls.length > 0 ? (
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={dish.imageUrls[0]}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <Badge 
                    variant={dish.isVeg ? "secondary" : "destructive"} 
                    className="absolute top-3 right-3 shadow-sm"
                  >
                    {dish.isVeg ? "Veg" : "Non-Veg"}
                  </Badge>
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-sm text-orange-600 font-medium">No image</p>
                  </div>
                  <Badge 
                    variant={dish.isVeg ? "secondary" : "destructive"} 
                    className="absolute top-3 right-3 shadow-sm"
                  >
                    {dish.isVeg ? "Veg" : "Non-Veg"}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3 px-3 sm:px-6">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">{dish.name}</CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                        </svg>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{dish.shop?.name}</p>
                      </div>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{dish.category?.name}{dish.subcategory ? ` • ${dish.subcategory.name}` : ''}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4 px-3 sm:px-6">
                {dish.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                    {truncateToTwoSentences(dish.description)}
                  </p>
                )}
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 sm:p-2 bg-green-50 rounded-md">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          {dish.originalPrice && dish.originalPrice > dish.price && (
                            <span className="text-xs text-muted-foreground line-through">{getCurrencySymbol((dish.currency || 'INR') as CurrencyCode)}{dish.originalPrice.toFixed(2)}</span>
                          )}
                          <p className="text-base sm:text-lg font-bold text-green-600">{getCurrencySymbol((dish.currency || 'INR') as CurrencyCode)}{dish.price.toFixed(2)}</p>
                          {dish.discountPercentage && dish.discountPercentage > 0 && (
                            <Badge variant="destructive" className="text-xs">{dish.discountPercentage.toFixed(0)}% OFF</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {dish.prepTimeMinutes && (
                    <div className="mt-3">
                      <DishPreparationToggle dishId={dish.id} dishName={dish.name} />
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 pb-3 sm:pb-4 px-3 sm:px-6">
                <div className="flex gap-2 w-full">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs sm:text-sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/owner/dashboard/edit-dish?id=${dish.id}&shopId=${dish.shopId}`);
                    }}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs sm:text-sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDish(dish.id, dish.shopId);
                    }}
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 mt-6 sm:mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1 overflow-x-auto max-w-full px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm flex-shrink-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Next
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedDish} onOpenChange={() => setSelectedDish(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedDish && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{selectedDish.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4">
                {selectedDish.imageUrls && selectedDish.imageUrls.length > 0 && (
                  <div className="relative h-48 sm:h-64 md:h-80 w-full rounded-lg overflow-hidden">
                    <img src={selectedDish.imageUrls[0]} alt={selectedDish.name} className="w-full h-full object-cover" />
                    <Badge variant={selectedDish.isVeg ? "secondary" : "destructive"} className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs">
                      {selectedDish.isVeg ? "Veg" : "Non-Veg"}
                    </Badge>
                  </div>
                )}
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Shop</p>
                    <p className="font-medium text-sm sm:text-base">{selectedDish.shop?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Category</p>
                    <p className="font-medium text-sm sm:text-base">{selectedDish.category?.name}{selectedDish.subcategory ? ` • ${selectedDish.subcategory.name}` : ''}</p>
                  </div>
                  {selectedDish.description && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-xs sm:text-sm">{truncateToTwoSentences(selectedDish.description)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Price</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedDish.originalPrice && selectedDish.originalPrice > selectedDish.price && (
                        <span className="text-xs sm:text-sm text-muted-foreground line-through">{getCurrencySymbol((selectedDish.currency || 'INR') as CurrencyCode)}{selectedDish.originalPrice.toFixed(2)}</span>
                      )}
                      <p className="text-lg sm:text-xl font-bold text-green-600">{getCurrencySymbol((selectedDish.currency || 'INR') as CurrencyCode)}{selectedDish.price.toFixed(2)}</p>
                      {selectedDish.discountPercentage && selectedDish.discountPercentage > 0 && (
                        <Badge variant="destructive" className="text-xs">{selectedDish.discountPercentage.toFixed(0)}% OFF</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {selectedDish.prepTimeMinutes && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Prep Time</p>
                        <p className="font-medium text-sm sm:text-base">{selectedDish.prepTimeMinutes} mins</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-4">
                  <Button className="flex-1 text-sm" size="sm" onClick={() => {
                    setSelectedDish(null);
                    router.push(`/owner/dashboard/edit-dish?id=${selectedDish.id}&shopId=${selectedDish.shopId}`);
                  }}>
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1 text-sm" size="sm" onClick={() => {
                    setSelectedDish(null);
                    handleDeleteDish(selectedDish.id, selectedDish.shopId);
                  }}>
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}