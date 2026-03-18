"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import ServeTimeInput from "@/components/dishes/ServeTimeInput";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";

interface Shop {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrls: string[];
  isVeg: boolean;
  shopId: string;
  categoryId: string;
}

export default function EditDishPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dishId = searchParams.get('id');
  const shopId = searchParams.get('shopId');
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("INR");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [isOutOfStock, setIsOutOfStock] = useState("false");
  const [isMarketingEnabled, setIsMarketingEnabled] = useState("true");
  const [selectedShopId, setSelectedShopId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [isVeg, setIsVeg] = useState("true");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [timings, setTimings] = useState<Array<{
    servedFrom: { hour: number; minute: number };
    servedUntil: { hour: number; minute: number };
  }>>([]);

  useEffect(() => {
    if (!dishId || !shopId) {
      toast.error("Invalid dish or shop ID");
      router.push('/owner/dashboard/my-dishes');
      return;
    }
    
    fetchData();
  }, [dishId, shopId]);

  // Calculate discount percentage when price or originalPrice changes
  useEffect(() => {
    if (price && originalPrice) {
      const priceNum = parseFloat(price);
      const originalPriceNum = parseFloat(originalPrice);
      if (originalPriceNum > priceNum && priceNum > 0) {
        const discount = ((originalPriceNum - priceNum) / originalPriceNum * 100).toFixed(2);
        setDiscountPercentage(discount);
      } else {
        setDiscountPercentage("");
      }
    } else {
      setDiscountPercentage("");
    }
  }, [price, originalPrice]);

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/subcategories?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data.subcategories || []);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const fetchData = async () => {
    try {
      const [shopsRes, categoriesRes, dishRes] = await Promise.all([
        fetch('/api/owner/shops'),
        fetch('/api/categories'),
        fetch(`/api/owner/shop/${shopId}/dishes?dishId=${dishId}`)
      ]);

      if (shopsRes.ok) {
        const shopsData = await shopsRes.json();
        setShops(shopsData.shops || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (dishRes.ok) {
        const dishData = await dishRes.json();
        const dish = dishData.dishes?.[0];
        if (dish) {
          setName(dish.name);
          setOriginalName(dish.name);
          setDescription(dish.description || "");
          setPrice(dish.price.toString());
          setCurrency((dish.currency || 'INR') as CurrencyCode);
          setOriginalPrice(dish.originalPrice?.toString() || "");
          setQuantity(dish.quantity?.toString() || "0");
          setIsOutOfStock(dish.isOutOfStock ? "true" : "false");
          setIsMarketingEnabled(dish.isMarketingEnabled ? "true" : "false");
          setSelectedShopId(dish.shopId);
          setCategoryId(dish.categoryId);
          setSubcategoryId(dish.subcategoryId || "");
          setIsVeg(dish.isVeg ? "true" : "false");
          setCurrentImageUrls(dish.imageUrls || []);
          setTimings(dish.timings?.map((t: any) => ({
            servedFrom: t.servedFrom,
            servedUntil: t.servedUntil
          })) || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dish data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !selectedShopId || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      let imageUrls = [...currentImageUrls];
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('folder', 'dishes');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrls = [uploadData.url];
        }
      }

      const slug = name !== originalName ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') : undefined;

      const dishData = {
        dishId,
        name,
        ...(slug && { slug }),
        description,
        price: parseFloat(price),
        currency,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
        quantity: parseInt(quantity),
        isOutOfStock: isOutOfStock === "true",
        isMarketingEnabled: isMarketingEnabled === "true",
        categoryId,
        subcategoryId: subcategoryId || undefined,
        imageUrls,
        isVeg: isVeg === "true",
        timings: timings.map(t => ({
          createdAt: { hour: 0, minute: 0 },
          preparedAt: { hour: 0, minute: 0 },
          servedFrom: t.servedFrom,
          servedUntil: t.servedUntil
        }))
      };

      const response = await fetch(`/api/owner/shop/${shopId}/dishes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dishData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to update dish: ${response.status}`);
      }

      toast.success("Dish updated successfully!");
      router.push('/owner/dashboard/my-dishes');
    } catch (error) {
      console.error('Error updating dish:', error);
      toast.error('Failed to update dish');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading dish data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Dish</h1>
        <p className="text-muted-foreground">Update your dish details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dish Details</CardTitle>
          <CardDescription>Update the details for your dish</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Dish Name*</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter dish name"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your dish"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price">Price*</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency*</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                      <SelectItem key={code} value={code}>
                        {symbol} {code} - {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="discountPercentage">Discount %</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  step="0.01"
                  value={discountPercentage}
                  readOnly
                  className="bg-muted"
                  placeholder="Auto-calculated"
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="shop">Shop*</Label>
                <Input
                  id="shop"
                  value={shops.find(shop => shop.id === selectedShopId)?.name || "Loading..."}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="category">Category*</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder={!categoryId ? "Select a category first" : "Select a subcategory"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Food Type*</Label>
                <RadioGroup value={isVeg} onValueChange={setIsVeg} className="flex gap-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="veg" />
                    <Label htmlFor="veg" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-3 h-3 border-2 border-green-600 bg-green-100 rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      </div>
                      Vegetarian
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="non-veg" />
                    <Label htmlFor="non-veg" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-3 h-3 border-2 border-red-600 bg-red-100 rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                      </div>
                      Non-Vegetarian
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Stock Status</Label>
                <RadioGroup value={isOutOfStock} onValueChange={setIsOutOfStock} className="flex gap-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="in-stock" />
                    <Label htmlFor="in-stock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="out-of-stock" />
                    <Label htmlFor="out-of-stock">Out of Stock</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Marketing Enabled</Label>
                <RadioGroup value={isMarketingEnabled} onValueChange={setIsMarketingEnabled} className="flex gap-6 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="marketing-enabled" />
                    <Label htmlFor="marketing-enabled">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="marketing-disabled" />
                    <Label htmlFor="marketing-disabled">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="sm:col-span-2">
                <ServeTimeInput timings={timings} onChange={setTimings} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="image">Update Dish Image</Label>
                <div className="mt-2">
                  {currentImageUrls.length > 0 && !imagePreview && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Current image:</p>
                      <img
                        src={currentImageUrls[0]}
                        alt="Current dish"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                  
                  {imagePreview && (
                    <div className="relative inline-block mb-4">
                      <img
                        src={imagePreview}
                        alt="New dish preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to keep current image
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/owner/dashboard/my-dishes')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Dish...
                  </>
                ) : (
                  "Update Dish"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}