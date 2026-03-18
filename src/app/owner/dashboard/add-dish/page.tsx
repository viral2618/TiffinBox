"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function AddDishPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("INR");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [prepTimeMinutes, setPrepTimeMinutes] = useState("");
  const [shopId, setShopId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [isVeg, setIsVeg] = useState("true");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [timings, setTimings] = useState<Array<{
    servedFrom: { hour: number; minute: number };
    servedUntil: { hour: number; minute: number };
  }>>([]);

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/owner/shops');
      if (response.ok) {
        const data = await response.json();
        const shopsList = data.shops || [];
        setShops(shopsList);
        // Auto-select first shop if only one exists
        if (shopsList.length === 1) {
          setShopId(shopsList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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
      setSubcategoryId(""); // Reset subcategory when category changes
    } else {
      setSubcategories([]);
      setSubcategoryId("");
    }
  }, [categoryId]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || !shopId || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      let imageUrls: string[] = [];
      
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

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const dishData = {
        name,
        slug,
        description,
        price: parseFloat(price),
        currency,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
        prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes) : undefined,
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dishData),
      });

      if (!response.ok) {
        throw new Error('Failed to create dish');
      }

      toast.success("Dish added successfully!");
      router.push('/owner/dashboard/my-dishes');
    } catch (error) {
      console.error('Error creating dish:', error);
      toast.error('Failed to add dish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Dish</h1>
        <p className="text-muted-foreground">Create a new dish for your shop</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dish Details</CardTitle>
          <CardDescription>Enter the details for your new dish</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name" className="mb-2 block">Dish Name*</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter dish name"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description" className="mb-2 block">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your dish"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="price" className="mb-2 block">Price*</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency" className="mb-2 block">Currency*</Label>
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
                <Label htmlFor="originalPrice" className="mb-2 block">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="discountPercentage" className="mb-2 block">Discount %</Label>
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
                <Label htmlFor="prepTimeMinutes" className="mb-2 block">Preparation Time (minutes)</Label>
                <Input
                  id="prepTimeMinutes"
                  type="number"
                  min="0"
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(e.target.value)}
                  placeholder="e.g., 90"
                />
              </div>

              <div>
                <Label htmlFor="shop" className="mb-2 block">Shop*</Label>
                <Input
                  id="shop"
                  value={shops.find(shop => shop.id === shopId)?.name || "Loading..."}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="category" className="mb-2 block">Category*</Label>
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
                <Label htmlFor="subcategory" className="mb-2 block">Subcategory</Label>
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

              <div className="sm:col-span-2">
                <Label className="mb-2 block">Food Type*</Label>
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

              <div className="sm:col-span-2">
                <ServeTimeInput timings={timings} onChange={setTimings} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="image" className="mb-2 block">Dish Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Dish preview"
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
                  ) : (
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click to upload dish image
                      </p>
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Dish...
                  </>
                ) : (
                  "Add Dish"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}