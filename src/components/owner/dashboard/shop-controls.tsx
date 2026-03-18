"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Package, DollarSign, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Shop {
  id: string;
  name: string;
  isOpen: boolean;
  schedule: {
    [key: string]: { isOpen: boolean; openTime: string; closeTime: string };
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isOutOfStock: boolean;
  isMarketingEnabled: boolean;
  shopId: string;
}

const DAYS_OF_WEEK = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
];

export function ShopControls() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopsAndProducts();
  }, []);

  const fetchShopsAndProducts = async () => {
    try {
      const [shopsRes, productsRes] = await Promise.all([
        fetch("/api/owner/shop/my-shops"),
        fetch("/api/owner/products")
      ]);

      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        const shopsArray = shopsData.shops || shopsData || [];
        setShops(shopsArray);
        if (shopsArray && shopsArray.length > 0) {
          setSelectedShop(shopsArray[0].id);
        }
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setShops([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateShopStatus = async (shopId: string, isOpen: boolean) => {
    try {
      const response = await fetch(`/api/owner/shops/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen })
      });

      if (response.ok) {
        setShops(prev => prev.map(shop => 
          shop.id === shopId ? { ...shop, isOpen } : shop
        ));
      }
    } catch (error) {
      console.error("Error updating shop status:", error);
    }
  };

  const updateSchedule = async (shopId: string, day: string, field: string, value: any) => {
    try {
      const response = await fetch(`/api/owner/shops/${shopId}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, field, value })
      });

      if (response.ok) {
        setShops(prev => prev.map(shop => 
          shop.id === shopId 
            ? {
                ...shop,
                schedule: {
                  ...shop.schedule,
                  [day]: { ...shop.schedule[day], [field]: value }
                }
              }
            : shop
        ));
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/owner/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setProducts(prev => prev.map(product => 
          product.id === productId ? { ...product, ...updates } : product
        ));
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const selectedShopData = shops.find(shop => shop.id === selectedShop);
  const shopProducts = products.filter(product => product.shopId === selectedShop);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Shop
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shops.map((shop) => (
                <Button
                  key={shop.id}
                  variant={selectedShop === shop.id ? "default" : "outline"}
                  onClick={() => setSelectedShop(shop.id)}
                  className="justify-start"
                >
                  {shop.name}
                  <Badge variant={shop.isOpen ? "default" : "secondary"} className="ml-2">
                    {shop.isOpen ? "Open" : "Closed"}
                  </Badge>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shops found. Create a shop first to manage it here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedShopData && (
        <>
          {/* Shop Status Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Shop Status - {selectedShopData.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Shop is currently {selectedShopData.isOpen ? 'Open' : 'Closed'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedShopData.isOpen ? 'Customers can place orders' : 'Shop is closed to new orders'}
                  </p>
                </div>
                <Switch
                  checked={selectedShopData.isOpen || false}
                  onCheckedChange={(checked) => updateShopStatus(selectedShop, checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule - {selectedShopData.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = selectedShopData.schedule ? 
                  (typeof selectedShopData.schedule === 'string' ? 
                    JSON.parse(selectedShopData.schedule) : selectedShopData.schedule) : {};
                const daySchedule = schedule[day] || { isOpen: false, openTime: "09:00", closeTime: "17:00" };
                return (
                  <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={daySchedule.isOpen}
                        onCheckedChange={(checked) => 
                          updateSchedule(selectedShop, day, "isOpen", checked)
                        }
                      />
                      <Label className="capitalize font-medium">{day}</Label>
                    </div>
                    {daySchedule.isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={daySchedule.openTime}
                          onChange={(e) => 
                            updateSchedule(selectedShop, day, "openTime", e.target.value)
                          }
                          className="w-24"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={daySchedule.closeTime}
                          onChange={(e) => 
                            updateSchedule(selectedShop, day, "closeTime", e.target.value)
                          }
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Product Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Product Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shopProducts.map((product) => (
                  <div key={product.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.isOutOfStock ? "destructive" : "default"}>
                          {product.isOutOfStock ? "Out of Stock" : "In Stock"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => 
                            updateProduct(product.id, { 
                              isMarketingEnabled: !product.isMarketingEnabled 
                            })
                          }
                        >
                          {product.isMarketingEnabled ? (
                            <><Eye className="h-4 w-4 mr-1" /> Visible</>
                          ) : (
                            <><EyeOff className="h-4 w-4 mr-1" /> Hidden</>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`price-${product.id}`}>Price ($)</Label>
                        <Input
                          id={`price-${product.id}`}
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => 
                            updateProduct(product.id, { 
                              price: parseFloat(e.target.value) || 0 
                            })
                          }
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`quantity-${product.id}`}>Quantity</Label>
                        <Input
                          id={`quantity-${product.id}`}
                          type="number"
                          value={product.quantity}
                          onChange={(e) => 
                            updateProduct(product.id, { 
                              quantity: parseInt(e.target.value) || 0 
                            })
                          }
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          variant={product.isOutOfStock ? "default" : "destructive"}
                          size="sm"
                          onClick={() => 
                            updateProduct(product.id, { 
                              isOutOfStock: !product.isOutOfStock 
                            })
                          }
                          className="w-full"
                        >
                          {product.isOutOfStock ? "Mark In Stock" : "Mark Out of Stock"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {shopProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found for this shop
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}