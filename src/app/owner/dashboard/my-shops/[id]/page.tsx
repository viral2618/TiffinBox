"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchShopDetail, fetchShopDishes, clearShopDetail } from "@/redux/features/shopDetailSlice";
import { createDish, fetchCategories, fetchTags } from "@/redux/features/dishSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Phone, Tag, Edit, Plus, Store, Package, Settings, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const dispatch = useAppDispatch();
  
  const { 
    shop, 
    dishes, 
    shopLoading, 
    dishesLoading, 
    shopError, 
    dishesError 
  } = useAppSelector((state) => state.shopDetail);

  useEffect(() => {
    if (shopId) {
      dispatch(fetchShopDetail(shopId));
      dispatch(fetchShopDishes(shopId));
    }
    
    return () => {
      dispatch(clearShopDetail());
    };
  }, [dispatch, shopId]);

  const handleEditShop = () => {
    router.push(`/owner/dashboard/my-shops/${shopId}/edit`);
  };

  const handleAddDish = () => {
    router.push(`/owner/dashboard/my-shops/${shopId}/dishes/create`);
  };

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (shopError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive">{shopError}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p>Shop not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </Button>
          <h1 className="text-xl sm:text-2xl font-semibold">Shop Details</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {shop.slug && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/shops/${shop.slug}`)} className="flex-1 sm:flex-none">
              <ExternalLink className="h-4 w-4 mr-1" /> Public View
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(`/owner/dashboard/my-shops/${shopId}/dishes/create`)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-1" /> Add Dish
          </Button>
          <Button size="sm" onClick={handleEditShop} className="flex-1 sm:flex-none bg-secondary text-foreground hover:bg-secondary/80">
            <Settings className="h-4 w-4 mr-1" /> Manage Shop
          </Button>
        </div>
      </div>

      {/* Shop Header */}
      <div className="relative mb-6">
        <div className="rounded-lg overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 border">
          {shop.bannerImage ? (
            <div className="h-48 sm:h-64 w-full overflow-hidden">
              <img 
                src={shop.bannerImage} 
                alt={shop.name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-32 sm:h-40 w-full flex items-center justify-center bg-muted/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
          )}
          
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-shrink-0 -mt-12 sm:-mt-16 ml-4 sm:ml-6 relative z-10">
              {shop.logoUrl ? (
                <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full overflow-hidden border-4 border-background bg-background shadow-md">
                  <img 
                    src={shop.logoUrl} 
                    alt={`${shop.name} logo`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full border-4 border-background bg-background shadow-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{shop.name}</h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">{shop.address}</span>
                </div>
                
                {shop.contactPhone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">{shop.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/owner/dashboard/my-shops/${shopId}/edit?tab=status`)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Shop Status</h3>
                <p className="text-sm text-muted-foreground">Currently Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/owner/dashboard/my-shops/${shopId}/edit?tab=inventory`)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Inventory</h3>
                <p className="text-sm text-muted-foreground">{dishes.length} items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/owner/dashboard/my-shops/${shopId}/edit`)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Edit className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Edit Details</h3>
                <p className="text-sm text-muted-foreground">Shop info & hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shop Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{shop.description || "No description provided."}</p>
            </CardContent>
          </Card>
          
          {/* Gallery Section */}
          {shop.imageUrls && shop.imageUrls.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {shop.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={imageUrl} 
                        alt={`${shop.name} - Image ${index + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Opening Hours */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shop.openingHours && Object.keys(shop.openingHours).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const dayHours = shop.openingHours?.[day as keyof typeof shop.openingHours];
                    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                    
                    return (
                      <div key={day} className="flex justify-between items-center py-1 border-b last:border-0">
                        <span className="font-medium">{dayName}</span>
                        <span>
                          {!dayHours ? "Not set" : 
                           dayHours.isClosed ? "Closed" : 
                           `${dayHours.open.hour % 12 || 12}:${String(dayHours.open.minute).padStart(2, '0')} ${dayHours.open.hour >= 12 ? 'PM' : 'AM'} - ${dayHours.close.hour % 12 || 12}:${String(dayHours.close.minute).padStart(2, '0')} ${dayHours.close.hour >= 12 ? 'PM' : 'AM'}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No opening hours set. <button onClick={() => router.push(`/owner/dashboard/my-shops/${shopId}/edit`)} className="text-primary hover:underline">Add opening hours</button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shop.contactPhone ? (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{shop.contactPhone}</span>
                  </div>
                ) : null}
                
                {(shop as any).contactPhone2 ? (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{(shop as any).contactPhone2}</span>
                  </div>
                ) : null}
                
                {(shop as any).contactPhone3 ? (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{(shop as any).contactPhone3}</span>
                  </div>
                ) : null}
                
                {shop.whatsapp ? (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                    <span className="text-sm">{shop.whatsapp}</span>
                  </div>
                ) : null}
                
                {(shop as any).establishedYear ? (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <span className="text-sm">Est. {(shop as any).establishedYear}</span>
                  </div>
                ) : null}
                
                {!shop.contactPhone && !(shop as any).contactPhone2 && !(shop as any).contactPhone3 && !shop.whatsapp && !(shop as any).establishedYear && (
                  <p className="text-sm text-muted-foreground">No contact information provided</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {shop.shopTags && shop.shopTags.length > 0 ? (
                  shop.shopTags.map((shopTag) => (
                    <Badge key={shopTag.tag.id} variant="outline">
                      {shopTag.tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No tags added</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dishes Section */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15h-8a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z"/></svg>
              Menu Items
            </h2>
            <p className="text-sm text-muted-foreground">Manage your shop's dishes and menu items</p>
          </div>
          <Button onClick={handleAddDish} size="sm" className="w-full sm:w-auto bg-secondary text-foreground hover:bg-secondary/80">
            <Plus className="h-4 w-4 mr-2" />
            Add New Dish
          </Button>
        </div>

        {dishesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : dishesError ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{dishesError}</p>
            <Button onClick={() => dispatch(fetchShopDishes(shopId))}>
              Try Again
            </Button>
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10 flex flex-col items-center">
            <div className="bg-muted/20 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15h-8a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2Z"/></svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No dishes yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">Start adding dishes to your shop menu. Dishes will appear here and be visible to your customers.</p>
            <Button onClick={handleAddDish} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Dish
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 w-full grid grid-cols-3 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-1 py-2">
                <span className="hidden sm:inline">All Dishes ({dishes.length})</span>
                <span className="sm:hidden">All ({dishes.length})</span>
              </TabsTrigger>
              <TabsTrigger value="veg" className="text-xs sm:text-sm px-1 py-2">
                <span className="hidden sm:inline">Veg Dishes ({dishes.filter(d => d.isVeg).length})</span>
                <span className="sm:hidden">Veg ({dishes.filter(d => d.isVeg).length})</span>
              </TabsTrigger>
              <TabsTrigger value="non-veg" className="text-xs sm:text-sm px-1 py-2">
                <span className="hidden sm:inline">Non-Vegetarian Dishes ({dishes.filter(d => !d.isVeg).length})</span>
                <span className="sm:hidden">Non-Veg ({dishes.filter(d => !d.isVeg).length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishes.map((dish) => (
                  <Card key={dish.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                    <div className="relative">
                      {dish.imageUrls.length > 0 ? (
                        <div className="h-36 w-full overflow-hidden">
                          <img 
                            src={dish.imageUrls[0]} 
                            alt={dish.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-36 w-full bg-muted/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50"><path d="M7 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="11.5" cy="8.5" r="1.5"/></svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {dish.isVeg && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Vegetarian</Badge>
                        )}
                        {dish.isOutOfStock && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>
                        )}
                        {dish.isMarketingEnabled && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Featured</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-base">{dish.name}</h3>
                        <div className="text-base font-bold">₹{dish.price}</div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {dish.description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center text-xs mb-2">
                        <span className="font-medium mr-1 text-muted-foreground">Category:</span> 
                        <span className="text-xs">{dish.category.name}</span>
                        {dish.subcategory && (
                          <span className="ml-1 text-xs">
                            &rsaquo; {dish.subcategory.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dish.dishTags && dish.dishTags.length > 0 ? dish.dishTags.map((dishTag) => (
                          <Badge key={dishTag.tag.id} variant="outline" className="text-xs px-1 py-0 h-5">
                            {dishTag.tag.name}
                          </Badge>
                        )) : null}
                      </div>
                      
                      <div className="flex justify-end border-t pt-3">
                        <Link href={`/owner/dashboard/my-shops/${shopId}/dishes/${dish.id}`}>
                          <Button variant="outline" size="sm" className="h-8">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Dish
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="veg" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishes.filter(dish => dish.isVeg).length > 0 ? dishes.filter(dish => dish.isVeg).map((dish) => (
                  <Card key={dish.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                    <div className="relative">
                      {dish.imageUrls.length > 0 ? (
                        <div className="h-36 w-full overflow-hidden">
                          <img 
                            src={dish.imageUrls[0]} 
                            alt={dish.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-36 w-full bg-muted/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50"><path d="M7 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="11.5" cy="8.5" r="1.5"/></svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {dish.isVeg && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Vegetarian</Badge>
                        )}
                        {dish.isOutOfStock && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>
                        )}
                        {dish.isMarketingEnabled && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Featured</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-base">{dish.name}</h3>
                        <div className="text-base font-bold">₹{dish.price}</div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {dish.description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center text-xs mb-2">
                        <span className="font-medium mr-1 text-muted-foreground">Category:</span> 
                        <span className="text-xs">{dish.category.name}</span>
                        {dish.subcategory && (
                          <span className="ml-1 text-xs">
                            &rsaquo; {dish.subcategory.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dish.dishTags && dish.dishTags.length > 0 ? dish.dishTags.map((dishTag) => (
                          <Badge key={dishTag.tag.id} variant="outline" className="text-xs px-1 py-0 h-5">
                            {dishTag.tag.name}
                          </Badge>
                        )) : null}
                      </div>
                      
                      <div className="flex justify-end border-t pt-3">
                        <Link href={`/owner/dashboard/my-shops/${shopId}/dishes/${dish.id}`}>
                          <Button variant="outline" size="sm" className="h-8">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Dish
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="col-span-full text-center py-8 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No vegetarian dishes found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="non-veg" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishes.filter(dish => !dish.isVeg).length > 0 ? dishes.filter(dish => !dish.isVeg).map((dish) => (
                  <Card key={dish.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                    <div className="relative">
                      {dish.imageUrls.length > 0 ? (
                        <div className="h-36 w-full overflow-hidden">
                          <img 
                            src={dish.imageUrls[0]} 
                            alt={dish.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-36 w-full bg-muted/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50"><path d="M7 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="11.5" cy="8.5" r="1.5"/></svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {dish.isVeg && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Vegetarian</Badge>
                        )}
                        {dish.isOutOfStock && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>
                        )}
                        {dish.isMarketingEnabled && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Featured</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-base">{dish.name}</h3>
                        <div className="text-base font-bold">₹{dish.price}</div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {dish.description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center text-xs mb-2">
                        <span className="font-medium mr-1 text-muted-foreground">Category:</span> 
                        <span className="text-xs">{dish.category.name}</span>
                        {dish.subcategory && (
                          <span className="ml-1 text-xs">
                            &rsaquo; {dish.subcategory.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dish.dishTags && dish.dishTags.length > 0 ? dish.dishTags.map((dishTag) => (
                          <Badge key={dishTag.tag.id} variant="outline" className="text-xs px-1 py-0 h-5">
                            {dishTag.tag.name}
                          </Badge>
                        )) : null}
                      </div>
                      
                      <div className="flex justify-end border-t pt-3">
                        <Link href={`/owner/dashboard/my-shops/${shopId}/dishes/${dish.id}`}>
                          <Button variant="outline" size="sm" className="h-8">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Dish
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="col-span-full text-center py-8 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No non-vegetarian dishes found</p>
                  </div>
                )}
              </div>
            </TabsContent>
            

            
            <TabsContent value="add-dish" className="mt-0">
              <AddDishForm shopId={shopId} onSuccess={() => {
                dispatch(fetchShopDishes(shopId));
              }} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Add Dish Form Component
interface AddDishFormProps {
  shopId: string;
  onSuccess: () => void;
}

function AddDishForm({ shopId, onSuccess }: AddDishFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error, success, categories, tags, categoriesLoading } = useAppSelector((state) => state.dish);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrls: [] as string[],
    price: 0,
    isVeg: true,
    isOutOfStock: false,
    isMarketingEnabled: true,
    categoryId: "",
    subcategoryId: null as string | null,
    selectedTags: [] as string[],
    timings: [
      {
        createdAt: { hour: 8, minute: 0 },
        preparedAt: { hour: 9, minute: 0 },
        servedFrom: { hour: 10, minute: 0 },
        servedUntil: { hour: 22, minute: 0 }
      }
    ]
  });
  
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Dish created successfully!");
      onSuccess();
      // Reset form
      setFormData({
        name: "",
        description: "",
        imageUrls: [],
        price: 0,
        isVeg: true,
        isOutOfStock: false,
        isMarketingEnabled: true,
        categoryId: "",
        subcategoryId: null,
        selectedTags: [],
        timings: [
          {
            createdAt: { hour: 8, minute: 0 },
            preparedAt: { hour: 9, minute: 0 },
            servedFrom: { hour: 10, minute: 0 },
            servedUntil: { hour: 22, minute: 0 }
          }
        ]
      });
      setSubcategories([]);
      setNewImageUrl("");
      setCustomTags([]);
    }
    
    if (error) {
      toast.error(error);
    }
  }, [success, error, onSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleCategoryChange = (value: string) => {
    const category = categories.find(cat => cat.id === value);
    setFormData({ 
      ...formData, 
      categoryId: value,
      subcategoryId: null
    });
    
    if (category) {
      setSubcategories(category.subcategories || []);
    } else {
      setSubcategories([]);
    }
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData({ ...formData, subcategoryId: value });
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => {
      const selectedTags = [...prev.selectedTags];
      
      if (selectedTags.includes(tagId)) {
        return { 
          ...prev, 
          selectedTags: selectedTags.filter(id => id !== tagId) 
        };
      } else {
        return { 
          ...prev, 
          selectedTags: [...selectedTags, tagId] 
        };
      }
    });
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }
    
    if (formData.imageUrls.length >= 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, newImageUrl.trim()]
    }));
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (formData.imageUrls.length + files.length > 4) {
      setUploadError(`You can only upload a maximum of 4 images. You can select ${4 - formData.imageUrls.length} more.`);
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'dishes');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to upload image');
        }
        
        return result.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...uploadedUrls]
      }));
      
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatTagSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const customTagsData = customTags.map(tagName => ({
      name: tagName,
      slug: formatTagSlug(tagName)
    }));
    
    const dishData = {
      ...formData,
      price: Number(formData.price),
      customTags: customTagsData
    };
    
    dispatch(createDish({ shopId, formData: dishData }));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Dish
        </CardTitle>
        <p className="text-sm text-muted-foreground">Create a new dish for your shop menu</p>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dish Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter dish name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={handleNumberChange}
                  className="pl-7"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              {categoriesLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading categories...</span>
                </div>
              ) : (
                <select 
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <select 
                className="w-full p-2 rounded-md border border-input bg-background"
                value={formData.subcategoryId || ""}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!formData.categoryId || subcategories.length === 0}
              >
                <option value="">Select subcategory</option>
                {subcategories?.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your dish..."
              className="w-full p-3 rounded-md border border-input bg-background min-h-[100px] resize-y"
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label>Images ({formData.imageUrls.length}/4)</Label>
            
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                disabled={formData.imageUrls.length >= 4}
              />
              <Button 
                type="button" 
                onClick={handleAddImage} 
                disabled={formData.imageUrls.length >= 4}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="border-2 border-dashed rounded-lg p-4">
              <label htmlFor="image-upload" className="cursor-pointer block">
                <div className="text-center">
                  <svg className="w-8 h-8 mb-2 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG or WebP (MAX. 4 images)</p>
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={formData.imageUrls.length >= 4 || isUploading}
                />
              </label>
              {isUploading && (
                <div className="flex items-center justify-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Uploading...</span>
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-destructive mt-2">{uploadError}</p>
              )}
            </div>
            
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <img 
                      src={url} 
                      alt={`Dish image ${index + 1}`} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attributes */}
          <div className="space-y-4">
            <Label>Dish Attributes</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Vegetarian</Label>
                  <p className="text-xs text-muted-foreground">Suitable for vegetarians</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => handleSwitchChange("isVeg", e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Out of Stock</Label>
                  <p className="text-xs text-muted-foreground">Currently unavailable</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isOutOfStock}
                  onChange={(e) => handleSwitchChange("isOutOfStock", e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Marketing Enabled</Label>
                  <p className="text-xs text-muted-foreground">Show in promotions</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isMarketingEnabled}
                  onChange={(e) => handleSwitchChange("isMarketingEnabled", e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label>Tags ({formData.selectedTags.length} selected)</Label>
            <div className="border rounded-lg p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags?.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      formData.selectedTags.includes(tag.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {customTags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                      <span>{tag}</span>
                      <span className="text-xs">(new)</span>
                      <button
                        type="button"
                        onClick={() => setCustomTags(prev => prev.filter((_, i) => i !== index))}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Add custom tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !customTags.includes(value)) {
                        setCustomTags(prev => [...prev, value]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    const value = input?.value.trim();
                    if (value && !customTags.includes(value)) {
                      setCustomTags(prev => [...prev, value]);
                      input.value = '';
                    }
                  }}
                >
                  Add Tag
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading}
              className="px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Dish
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}