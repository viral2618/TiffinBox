"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { createDish, fetchCategories, fetchTags, resetDishState } from "@/redux/features/dishSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, Plus, X, Clock, Tag, Info, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Combobox } from "@/components/ui/combobox";

export default function CreateDishPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const dispatch = useAppDispatch();
  
  const { loading, error, success, categories, tags, categoriesLoading } = useAppSelector((state) => state.dish);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrls: [] as string[],
    price: 0,
    isVeg: true,
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
  
  // For AM/PM selection in the UI
  const [timeFormat, setTimeFormat] = useState({
    createdAt: "AM",
    preparedAt: "AM",
    servedFrom: "AM",
    servedUntil: "PM"
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTags());
    
    return () => {
      dispatch(resetDishState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Dish created successfully!");
      router.push(`/owner/dashboard/my-shops/${shopId}`);
    }
    
    if (error) {
      toast.error(error);
    }
  }, [success, error, router, shopId]);

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

  // Convert 12-hour format to 24-hour format for storage
  const to24Hour = (hour: number, ampm: string) => {
    if (ampm === "PM" && hour < 12) return hour + 12;
    if (ampm === "AM" && hour === 12) return 0;
    return hour;
  };
  
  // Convert 24-hour format to 12-hour format for display
  const to12Hour = (hour: number) => {
    if (hour === 0) return 12;
    if (hour > 12) return hour - 12;
    return hour;
  };
  
  // Determine if a time is AM or PM
  const getAmPm = (hour: number) => {
    return hour >= 12 ? "PM" : "AM";
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
  
  const handleTimingChange = (field: string, timeField: string, value: number) => {
    if (timeField === 'hour') {
      // For hour, ensure it's between 1-12 for display
      const validValue = Math.min(12, Math.max(1, value));
      
      // Convert to 24-hour format for storage
      const hour24 = to24Hour(validValue, timeFormat[field as keyof typeof timeFormat]);
      
      setFormData(prev => ({
        ...prev,
        timings: [{
          ...prev.timings[0],
          [field]: {
            ...prev.timings[0][field as keyof typeof prev.timings[0]],
            hour: hour24
          }
        }]
      }));
    } else {
      // For minutes, ensure it's between 0-59
      const validValue = Math.min(59, Math.max(0, value));
      
      setFormData(prev => ({
        ...prev,
        timings: [{
          ...prev.timings[0],
          [field]: {
            ...prev.timings[0][field as keyof typeof prev.timings[0]],
            minute: validValue
          }
        }]
      }));
    }
  };
  
  const handleAmPmChange = (field: string, value: string) => {
    // Update the AM/PM state
    setTimeFormat(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Convert the current hour to 24-hour format with the new AM/PM value
    const currentHour = formData.timings[0][field as keyof typeof formData.timings[0]].hour;
    const hour12 = to12Hour(currentHour);
    const hour24 = to24Hour(hour12, value);
    
    // Update the form data with the new 24-hour value
    setFormData(prev => ({
      ...prev,
      timings: [{
        ...prev.timings[0],
        [field]: {
          ...prev.timings[0][field as keyof typeof prev.timings[0]],
          hour: hour24
        }
      }]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the limit of 4
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
      // Clear the input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  const removeImageUrl = (url: string) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter(item => item !== url)
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

  // Format tag name to slug format (e.g., "Spicy Food" -> "spicy-food")
  const formatTagSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  const handleTagSelect = (tagId: string) => {
    setSelectedTagId(tagId);
  };
  
  const handleAddSelectedTag = () => {
    if (!selectedTagId) return;
    
    // Check if tag is already selected
    if (formData.selectedTags.includes(selectedTagId)) {
      toast.error("This tag is already selected");
      return;
    }
    
    // Add the selected tag
    handleTagToggle(selectedTagId);
    
    // Find the tag name for the toast message
    const selectedTag = tags.find(tag => tag.id === selectedTagId);
    if (selectedTag) {
      toast.success(`Added tag: ${selectedTag.name}`);
    }
    
    // Reset the selected tag
    setSelectedTagId("");
  };
  
  const handleAddNewTag = () => {
    if (!newTagName.trim()) return;
    
    // Check if tag already exists in custom tags
    if (customTags.includes(newTagName.trim())) {
      toast.error("This tag already exists");
      return;
    }
    
    // Check if tag already exists in available tags
    const tagExists = tags.some(tag => 
      tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    
    if (tagExists) {
      // Find the existing tag and toggle it
      const existingTag = tags.find(tag => 
        tag.name.toLowerCase() === newTagName.trim().toLowerCase()
      );
      
      if (existingTag && !formData.selectedTags.includes(existingTag.id)) {
        handleTagToggle(existingTag.id);
        toast.success(`Added existing tag: ${existingTag.name}`);
      } else {
        toast.error("This tag is already selected");
      }
    } else {
      // Add as custom tag
      setCustomTags(prev => [...prev, newTagName.trim()]);
      toast.success(`Created new tag: ${newTagName.trim()}`);
    }
    
    setNewTagName("");
  };
  
  const handleRemoveCustomTag = (index: number) => {
    setCustomTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Process custom tags if any
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
    <div className="container mx-auto py-6">
      {/* Breadcrumb and Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/owner/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/owner/dashboard/my-shops" className="hover:text-foreground">
            My Shops
          </Link>
          <span>/</span>
          <Link href={`/owner/dashboard/my-shops/${shopId}`} className="hover:text-foreground">
            Shop Details
          </Link>
          <span>/</span>
          <Link href={`/owner/dashboard/my-shops/${shopId}/dishes`} className="hover:text-foreground">
            Dishes
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Add New Dish</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Add New Dish</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dish Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Basic Information</Label>
              </div>
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <p className="text-sm text-gray-600">Enter the basic details about your dish including name, price, and category.</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-medium">Dish Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter dish name"
                        className="h-10"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price" className="font-medium">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price || ""}
                          onChange={handleNumberChange}
                          className="pl-7 h-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category" className="font-medium">Category</Label>
                      {categoriesLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading categories...</span>
                        </div>
                      ) : (
                        <Combobox
                          options={categories?.map(category => ({ value: category.id, label: category.name })) || []}
                          value={formData.categoryId || ""}
                          onChange={handleCategoryChange}
                          placeholder="Select category"
                          emptyMessage="No categories found"
                          className="h-10"
                        />
                      )}
                      {categories?.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">No categories available</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subcategory" className="font-medium">Subcategory <span className="text-gray-500 text-sm">(Optional)</span></Label>
                      <Combobox
                        options={subcategories?.map(subcategory => ({ value: subcategory.id, label: subcategory.name })) || []}
                        value={formData.subcategoryId || ""}
                        onChange={handleSubcategoryChange}
                        placeholder="Select subcategory"
                        emptyMessage="No subcategories found"
                        className="h-10"
                        disabled={!formData.categoryId || subcategories.length === 0}
                      />
                      {formData.categoryId && subcategories?.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">No subcategories available for this category</p>
                      )}
                      {!formData.categoryId && (
                        <p className="text-xs text-gray-500 mt-1">Select a category first</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Dish Description</Label>
                <span className="text-sm text-gray-500">{formData.description.length} characters</span>
              </div>
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <p className="text-sm text-gray-600">Provide a detailed description of the dish including ingredients, preparation method, and flavor profile.</p>
                </div>
                <div className="p-4">
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your dish in detail..."
                    className="min-h-[120px] resize-y"
                    rows={4}
                  />
                  <p className="mt-2 text-xs text-gray-500">A good description helps customers understand what makes this dish special.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Dish Images</Label>
                <span className="text-sm text-gray-500">{formData.imageUrls.length}/4 images</span>
              </div>
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <p className="text-sm text-gray-600">Add up to 4 high-quality images of your dish. Good photos increase customer interest.</p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      disabled={formData.imageUrls.length >= 4}
                      className="h-10"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddImage} 
                      disabled={formData.imageUrls.length >= 4}
                      className={`flex-shrink-0 ${formData.imageUrls.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Image
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG or WebP (MAX. 4 images)</p>
                      </div>
                      <input 
                        id="image-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        multiple
                        onChange={handleImageUpload}
                        disabled={formData.imageUrls.length >= 4 || isUploading}
                      />
                    </label>
                    {isUploading && (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Uploading...</span>
                      </div>
                    )}
                    {uploadError && (
                      <p className="text-sm text-destructive">{uploadError}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.imageUrls && formData.imageUrls.length > 0 ? (
                      formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 z-10 hover:bg-red-600 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <img 
                            src={url} 
                            alt={`Dish image ${index + 1}`} 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Error";
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 border border-dashed rounded-md border-gray-300 bg-gray-50">
                        <p className="text-gray-500 mb-2">No images added yet</p>
                        <p className="text-xs text-gray-400">Add images to showcase your dish</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Tip: Use square images (1:1 ratio) for best results. Recommended size: 600x600 pixels.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-lg font-medium">Dish Type</Label>
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <p className="text-sm text-gray-600">Specify whether this dish is vegetarian or non-vegetarian.</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.isVeg 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, isVeg: true }))}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <h3 className="font-medium text-center">Vegetarian</h3>
                      {/* <p className="text-sm text-center mt-1 text-gray-600">Does not contain egg</p> */}
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        !formData.isVeg 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, isVeg: false }))}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <h3 className="font-medium text-center">Non-Vegetarian</h3>
                      {/* <p className="text-sm text-center mt-1 text-gray-600">Contains egg</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Dish Tags</Label>
                <span className="text-sm text-gray-500">{formData.selectedTags.length} selected</span>
              </div>
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <p className="text-sm text-gray-600">Select existing tags or create new ones to describe this dish. Tags help customers find dishes based on their preferences.</p>
                </div>
                
                {/* Tag Selection with Combobox */}
                <div className="p-4 border-b">
                  <div className="mb-2">
                    <Label className="text-sm font-medium">Select or Create Tags</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Combobox
                        options={tags?.map(tag => ({ value: tag.id, label: tag.name })) || []}
                        value={selectedTagId}
                        onChange={handleTagSelect}
                        placeholder="Search or select a tag"
                        emptyMessage="No matching tags found"
                        className="h-10"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleAddSelectedTag} 
                      className="flex-shrink-0"
                      disabled={!selectedTagId}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select from existing tags or type to search</p>
                </div>
                
                {/* New Tag Creation */}
                <div className="p-4 border-b">
                  <div className="mb-2">
                    <Label className="text-sm font-medium">Create New Tag</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter a new tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewTag();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddNewTag} 
                      className="flex-shrink-0"
                      disabled={!newTagName.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Create
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Create a new tag if it doesn't exist</p>
                </div>
                  
                {/* Selected and Custom Tags */}
                <div className="p-4">
                  <div className="mb-2">
                    <Label className="text-sm font-medium">Selected Tags</Label>
                  </div>
                  
                  {/* Display selected tags from existing tags */}
                  {formData.selectedTags.length > 0 || customTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {/* Display selected tags from existing tags */}
                      {formData.selectedTags.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <div 
                            key={tag.id} 
                            className="flex items-center space-x-1 p-2 rounded-md border border-blue-200 bg-blue-50"
                          >
                            <span className="text-sm">{tag.name}</span>
                            <button
                              type="button"
                              onClick={() => handleTagToggle(tag.id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              aria-label="Remove tag"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                      
                      {/* Display custom tags */}
                      {customTags.map((tag, index) => (
                        <div 
                          key={`custom-${index}`} 
                          className="flex items-center space-x-1 p-2 rounded-md border border-green-200 bg-green-50"
                        >
                          <span className="text-sm">{tag}</span>
                          <span className="text-xs text-gray-500">(new)</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTag(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            aria-label="Remove tag"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No tags selected yet</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Dish Timings */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Dish Timings</Label>
              </div>
              <div className="border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <p className="text-sm text-gray-600">Set the preparation and serving schedule for this dish. This helps customers know when the dish will be available.</p>
                </div>
                <div className="p-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Created At */}
                    <div className="space-y-3 bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Created At</Label>
                        <span className="text-xs text-gray-500">When the dish preparation begins</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            placeholder="Hour"
                            value={to12Hour(formData.timings[0].createdAt.hour)}
                            onChange={(e) => handleTimingChange('createdAt', 'hour', parseInt(e.target.value) || 1)}
                            className="w-full text-center"
                          />
                          <span className="text-xl font-medium">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Min"
                            value={formData.timings[0].createdAt.minute.toString().padStart(2, '0')}
                            onChange={(e) => handleTimingChange('createdAt', 'minute', parseInt(e.target.value) || 0)}
                            className="w-full text-center"
                          />
                          <Select 
                            value={timeFormat.createdAt} 
                            onValueChange={(value) => handleAmPmChange('createdAt', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder={timeFormat.createdAt} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Prepared At */}
                    <div className="space-y-3 bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Prepared At</Label>
                        <span className="text-xs text-gray-500">When the dish is ready</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            placeholder="Hour"
                            value={to12Hour(formData.timings[0].preparedAt.hour)}
                            onChange={(e) => handleTimingChange('preparedAt', 'hour', parseInt(e.target.value) || 1)}
                            className="w-full text-center"
                          />
                          <span className="text-xl font-medium">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Min"
                            value={formData.timings[0].preparedAt.minute.toString().padStart(2, '0')}
                            onChange={(e) => handleTimingChange('preparedAt', 'minute', parseInt(e.target.value) || 0)}
                            className="w-full text-center"
                          />
                          <Select 
                            value={timeFormat.preparedAt} 
                            onValueChange={(value) => handleAmPmChange('preparedAt', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder={timeFormat.preparedAt} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Served From */}
                    <div className="space-y-3 bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Served From</Label>
                        <span className="text-xs text-gray-500">When the dish becomes available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            placeholder="Hour"
                            value={to12Hour(formData.timings[0].servedFrom.hour)}
                            onChange={(e) => handleTimingChange('servedFrom', 'hour', parseInt(e.target.value) || 1)}
                            className="w-full text-center"
                          />
                          <span className="text-xl font-medium">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Min"
                            value={formData.timings[0].servedFrom.minute.toString().padStart(2, '0')}
                            onChange={(e) => handleTimingChange('servedFrom', 'minute', parseInt(e.target.value) || 0)}
                            className="w-full text-center"
                          />
                          <Select 
                            value={timeFormat.servedFrom} 
                            onValueChange={(value) => handleAmPmChange('servedFrom', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder={timeFormat.servedFrom} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Served Until */}
                    <div className="space-y-3 bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Served Until</Label>
                        <span className="text-xs text-gray-500">When the dish is no longer available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            placeholder="Hour"
                            value={to12Hour(formData.timings[0].servedUntil.hour)}
                            onChange={(e) => handleTimingChange('servedUntil', 'hour', parseInt(e.target.value) || 1)}
                            className="w-full text-center"
                          />
                          <span className="text-xl font-medium">:</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Min"
                            value={formData.timings[0].servedUntil.minute.toString().padStart(2, '0')}
                            onChange={(e) => handleTimingChange('servedUntil', 'minute', parseInt(e.target.value) || 0)}
                            className="w-full text-center"
                          />
                          <Select 
                            value={timeFormat.servedUntil} 
                            onValueChange={(value) => handleAmPmChange('servedUntil', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder={timeFormat.servedUntil} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-700">Tip: Set accurate serving times to help customers plan their orders. The dish will only appear as available during these hours.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Dish...
                  </>
                ) : "Create Dish"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}