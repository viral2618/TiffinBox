"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchShopDetail, updateShopOpeningHours, fetchShopDishes } from "@/redux/features/shopDetailSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Clock, Trash2, Store, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountrySelector, countries } from "@/components/ui/country-selector";
import AddressAutocomplete from "@/components/ui/address-autocomplete";

const days = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export default function EditShopPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { shop, shopLoading, shopError } = useAppSelector((state) => state.shopDetail);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    contactPhone: "",
    contactPhone2: "",
    contactPhone3: "",
    whatsapp: "",
    establishedYear: "",
  });
  
  const [country, setCountry] = useState("IN");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const currentConfig = countries[country];
  
  type ShopOpeningHours = {
    [key: string]: {
      open: { hour: number; minute: number };
      close: { hour: number; minute: number };
      isClosed: boolean;
    };
  };
  
  const [openingHours, setOpeningHours] = useState<ShopOpeningHours>({
    monday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    tuesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    wednesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    thursday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    friday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    saturday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    sunday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: true },
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [shopStatus, setShopStatus] = useState(true);
  const shopId = params.id as string;

  useEffect(() => {
    if (shopId) {
      dispatch(fetchShopDetail(shopId));
    }
  }, [dispatch, shopId]);

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || "",
        description: shop.description || "",
        address: shop.address || "",
        contactPhone: shop.contactPhone || "",
        contactPhone2: (shop as any).contactPhone2 || "",
        contactPhone3: (shop as any).contactPhone3 || "",
        whatsapp: shop.whatsapp || "",
        establishedYear: (shop as any).establishedYear?.toString() || "",
      });
      
      if (shop.openingHours) {
        const completeOpeningHours: ShopOpeningHours = {
          monday: shop.openingHours.monday || { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
          tuesday: shop.openingHours.tuesday || { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
          wednesday: shop.openingHours.wednesday || { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
          thursday: shop.openingHours.thursday || { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
          friday: shop.openingHours.friday || { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
          saturday: shop.openingHours.saturday || { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
          sunday: shop.openingHours.sunday || { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: true },
        };
        setOpeningHours(completeOpeningHours);
      }
    }
  }, [shop]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'contactPhone' || name === 'contactPhone2' || name === 'contactPhone3' || name === 'whatsapp') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= currentConfig.maxLength) {
        setFormData((prev) => ({
          ...prev,
          [name]: digitsOnly,
        }));
      }
    } else if (name === 'establishedYear') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
      const currentYear = new Date().getFullYear();
      const year = parseInt(digitsOnly);
      if (digitsOnly.length === 4 && year > currentYear) {
        toast.error(`Year cannot be in the future (max: ${currentYear})`);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isClosed: !prev[day]?.isClosed,
      },
    }));
  };

  const handleTimeChange = (day: string, type: 'open' | 'close', timeType: 'hour' | 'minute', value: string) => {
    const numValue = parseInt(value, 10);
    
    // Validate hour (0-23) and minute (0-59)
    if (timeType === 'hour' && (isNaN(numValue) || numValue < 0 || numValue > 23)) return;
    if (timeType === 'minute' && (isNaN(numValue) || numValue < 0 || numValue > 59)) return;
    
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: {
          ...prev[day]?.[type],
          [timeType]: numValue,
        },
      },
    }));
  };
  
  const handleAmPmChange = (day: string, type: 'open' | 'close', value: string) => {
    const currentHour = openingHours[day]?.[type]?.hour || 0;
    let newHour = currentHour;
    
    // If current hour is in AM range (0-11) and we're switching to PM
    if (currentHour < 12 && value === 'PM') {
      newHour = currentHour === 0 ? 12 : currentHour + 12;
    }
    // If current hour is in PM range (12-23) and we're switching to AM
    else if (currentHour >= 12 && value === 'AM') {
      newHour = currentHour === 12 ? 0 : currentHour - 12;
    }
    
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: {
          ...prev[day]?.[type],
          hour: newHour,
        },
      },
    }));
  };
  
  const handle12HourChange = (day: string, type: 'open' | 'close', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 12) return;
    
    const currentHour = openingHours[day]?.[type]?.hour || 0;
    const isPM = currentHour >= 12;
    let newHour = numValue;
    
    // Adjust for PM
    if (isPM) {
      newHour = numValue === 12 ? 12 : numValue + 12;
    } else {
      newHour = numValue === 12 ? 0 : numValue;
    }
    
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: {
          ...prev[day]?.[type],
          hour: newHour,
        },
      },
    }));
  };

  const handleSaveOpeningHours = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateShopOpeningHours({ shopId, openingHours })).unwrap();
      toast.success("Opening hours updated successfully");
    } catch (error) {
      toast.error("Failed to update opening hours");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveShopDetails = async () => {
    setIsSaving(true);
    try {
      const data = {
        ...formData,
        coordinates,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined
      };
      
      const response = await fetch(`/api/owner/shop/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update shop details');
      }
      
      toast.success("Shop details updated successfully");
      dispatch(fetchShopDetail(shopId));
    } catch (error) {
      toast.error("Failed to update shop details");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsSaving(true);
    
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shop-images'); // Specify folder for better organization
      
      // Upload the image
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { url } = await uploadResponse.json();
      
      // Update the shop with the new image URL
      const updateData = type === 'logo' ? { logoUrl: url } : { bannerImage: url };
      
      const updateResponse = await fetch(`/api/owner/shop/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update shop ${type}`);
      }
      
      toast.success(`Shop ${type} updated successfully`);
      // Refresh shop data
      dispatch(fetchShopDetail(shopId));
    } catch (error) {
      toast.error(`Failed to update shop ${type}`);
      console.error(error);
    } finally {
      setIsSaving(false);
      // Reset the file input to allow selecting the same file again
      e.target.value = '';
    }
  };
  
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  const handleGalleryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Convert FileList to array and store
    const filesArray = Array.from(e.target.files);
    setGalleryImages(filesArray);
  };
  
  const handleGalleryUpload = async () => {
    if (galleryImages.length === 0) {
      toast.error("Please select images to upload");
      return;
    }
    
    setUploadingGallery(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Upload each image one by one
      for (const file of galleryImages) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'shop-gallery');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image: ${file.name}`);
        }
        
        const { url } = await uploadResponse.json();
        uploadedUrls.push(url);
      }
      
      // Get current image URLs from shop
      const currentImageUrls = shop?.imageUrls || [];
      
      // Update shop with new Shop images
      const updateResponse = await fetch(`/api/owner/shop/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: [...currentImageUrls, ...uploadedUrls]
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update shop gallery');
      }
      
      toast.success(`${uploadedUrls.length} Shop images uploaded successfully`);
      // Refresh shop data
      dispatch(fetchShopDetail(shopId));
      // Clear selected files
      setGalleryImages([]);
      
      // Reset file input
      const fileInput = document.getElementById('galleryImages') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error("Failed to upload Shop images");
      console.error(error);
    } finally {
      setUploadingGallery(false);
    }
  };
  
  const handleRemoveGalleryImage = async (imageUrl: string, index: number) => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    
    setIsSaving(true);
    try {
      // Get current image URLs and remove the selected one
      const currentImageUrls = [...(shop?.imageUrls || [])];
      currentImageUrls.splice(index, 1);
      
      // Update shop with new Shop images
      const updateResponse = await fetch(`/api/owner/shop/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: currentImageUrls
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to remove gallery image');
      }
      
      toast.success("Gallery image removed successfully");
      // Refresh shop data
      dispatch(fetchShopDetail(shopId));
    } catch (error) {
      toast.error("Failed to remove gallery image");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Shop</h1>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Shop Details</TabsTrigger>
          <TabsTrigger value="status">Shop Status</TabsTrigger>
          <TabsTrigger value="hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name" className="text-base">Shop Name*</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter shop name"
                      className="mt-1.5"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">This is how customers will identify your shop</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="description" className="text-base">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your shop, what makes it special, and what customers can expect"
                      rows={4}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">A good description helps customers understand what your shop offers</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="text-base">Address*</Label>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={setFormData.bind(null, (prev: any) => ({ ...prev, address: formData.address }))}
                      onSelect={(selectedAddress, lat, lng) => {
                        setFormData((prev) => ({ ...prev, address: selectedAddress }));
                        setCoordinates({ lat, lng });
                      }}
                      placeholder="Start typing your address..."
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Start typing to search for your address</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="country" className="text-base">Country*</Label>
                    <div className="mt-1.5">
                      <CountrySelector
                        value={country}
                        onChange={(value) => {
                          setCountry(value);
                          setFormData((prev) => ({
                            ...prev,
                            contactPhone: "",
                            contactPhone2: "",
                            contactPhone3: "",
                            whatsapp: ""
                          }));
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Select your country for phone number validation</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone" className="text-base">Contact Phone</Label>
                    <div className="flex gap-2 mt-1.5">
                      <div className="w-20 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm flex items-center justify-center">
                        {currentConfig.dialCode}
                      </div>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder={currentConfig.placeholder}
                        className="flex-1"
                        maxLength={currentConfig.maxLength}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone2" className="text-base">Contact Phone 2</Label>
                    <div className="flex gap-2 mt-1.5">
                      <div className="w-20 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm flex items-center justify-center">
                        {currentConfig.dialCode}
                      </div>
                      <Input
                        id="contactPhone2"
                        name="contactPhone2"
                        value={formData.contactPhone2}
                        onChange={handleInputChange}
                        placeholder={currentConfig.placeholder}
                        className="flex-1"
                        maxLength={currentConfig.maxLength}
                        inputMode="numeric"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Additional phone number</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone3" className="text-base">Contact Phone 3</Label>
                    <div className="flex gap-2 mt-1.5">
                      <div className="w-20 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm flex items-center justify-center">
                        {currentConfig.dialCode}
                      </div>
                      <Input
                        id="contactPhone3"
                        name="contactPhone3"
                        value={formData.contactPhone3}
                        onChange={handleInputChange}
                        placeholder={currentConfig.placeholder}
                        className="flex-1"
                        maxLength={currentConfig.maxLength}
                        inputMode="numeric"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Additional phone number</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsapp" className="text-base">WhatsApp</Label>
                    <div className="flex gap-2 mt-1.5">
                      <div className="w-20 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm flex items-center justify-center">
                        {currentConfig.dialCode}
                      </div>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder={currentConfig.placeholder}
                        className="flex-1"
                        maxLength={currentConfig.maxLength}
                        inputMode="numeric"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">WhatsApp number for customer communication</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="establishedYear" className="text-base">Established Year</Label>
                    <Input
                      id="establishedYear"
                      name="establishedYear"
                      value={formData.establishedYear}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                      className="mt-1.5"
                      maxLength={4}
                      inputMode="numeric"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Year your shop was established</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveShopDetails} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Shop Details"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Status Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-lg">
                      {shopStatus ? 'Shop is Currently Open' : 'Shop is Currently Closed'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {shopStatus 
                        ? 'Customers can browse and place orders' 
                        : 'Orders are paused, customers cannot place new orders'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setShopStatus(!shopStatus)}
                    className={`p-2 rounded-full transition-colors ${
                      shopStatus 
                        ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {shopStatus ? <ToggleRight className="h-10 w-10" /> : <ToggleLeft className="h-10 w-10" />}
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Status Control Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Close your shop during breaks or when you're unable to fulfill orders</li>
                    <li>• Customers will see "Currently Closed" when your shop is offline</li>
                    <li>• You can still manage inventory and view orders when closed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
              <p className="text-sm text-muted-foreground">Set when your shop is open for customers</p>
            </CardHeader>
            <div className="px-6 py-3 bg-blue-50 border-l-4 border-blue-500 mb-6 mx-6">
              <h4 className="text-sm font-medium text-blue-800">Time Format Guide</h4>
              <p className="text-xs text-blue-700 mt-1">Enter times in 12-hour format with AM/PM selection:</p>
              <ul className="text-xs text-blue-700 mt-1 list-disc list-inside space-y-1">
                <li>Morning: 9:00 AM (9 in the morning)</li>
                <li>Afternoon: 2:00 PM (2 in the afternoon)</li>
                <li>Evening: 9:00 PM (9 in the evening)</li>
                <li>Midnight: 12:00 AM (beginning of the day)</li>
                <li>Noon: 12:00 PM (middle of the day)</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2 font-medium">Examples:</p>
              <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                <li>For a shop open from 11 AM to 9 PM: Set opening time to 11:00 AM and closing time to 9:00 PM</li>
                <li>For a shop open 24 hours: Set opening time to 12:00 AM and closing time to 11:59 PM</li>
              </ul>
            </div>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Quick Set</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Set standard business hours (9 AM - 5 PM) for weekdays, closed on weekends
                        setOpeningHours(prev => ({
                          ...prev,
                          monday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                          tuesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                          wednesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                          thursday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                          friday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                          saturday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: true },
                          sunday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: true },
                        }));
                      }}
                    >
                      Standard Business Hours
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Set all days to open (10 AM - 10 PM)
                        setOpeningHours(prev => ({
                          ...prev,
                          monday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                          tuesday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                          wednesday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                          thursday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                          friday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                          saturday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                          sunday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                        }));
                      }}
                    >
                      All Days (10 AM - 10 PM)
                    </Button>
                  </div>
                </div>
                {days.map((day) => (
                  <div key={day.id} className={`border rounded-lg p-4 ${openingHours[day.id]?.isClosed ? 'bg-muted/30' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <h3 className="font-medium">{day.label}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${day.id}-toggle`} className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${openingHours[day.id]?.isClosed ? 'text-muted-foreground' : 'text-green-600'}`}>
                            {openingHours[day.id]?.isClosed ? "Closed" : "Open"}
                          </span>
                        </Label>
                        <Switch
                          id={`${day.id}-toggle`}
                          checked={!openingHours[day.id]?.isClosed}
                          onCheckedChange={() => handleDayToggle(day.id)}
                        />
                      </div>
                    </div>

                    {!openingHours[day.id]?.isClosed && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${day.id}-open`}>Opening Time</Label>
                          <div className="flex flex-col gap-2 mt-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  id={`${day.id}-open-hour`}
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={openingHours[day.id]?.open?.hour % 12 || 12}
                                  onChange={(e) => handle12HourChange(day.id, 'open', e.target.value)}
                                  className="w-14"
                                />
                                <span className="flex items-center">:</span>
                                <Input
                                  id={`${day.id}-open-minute`}
                                  type="number"
                                  min="0"
                                  max="59"
                                  value={openingHours[day.id]?.open?.minute || 0}
                                  onChange={(e) => handleTimeChange(day.id, 'open', 'minute', e.target.value)}
                                  className="w-14"
                                />
                              </div>
                              <Select
                                value={openingHours[day.id]?.open?.hour >= 12 ? 'PM' : 'AM'}
                                onValueChange={(value) => handleAmPmChange(day.id, 'open', value)}
                              >
                                <SelectTrigger className="w-18">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AM">AM</SelectItem>
                                  <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`${day.id}-close`}>Closing Time</Label>
                          <div className="flex flex-col gap-2 mt-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  id={`${day.id}-close-hour`}
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={openingHours[day.id]?.close?.hour % 12 || 12}
                                  onChange={(e) => handle12HourChange(day.id, 'close', e.target.value)}
                                  className="w-14"
                                />
                                <span className="flex items-center">:</span>
                                <Input
                                  id={`${day.id}-close-minute`}
                                  type="number"
                                  min="0"
                                  max="59"
                                  value={openingHours[day.id]?.close?.minute || 0}
                                  onChange={(e) => handleTimeChange(day.id, 'close', 'minute', e.target.value)}
                                  className="w-14"
                                />
                              </div>
                              <Select
                                value={openingHours[day.id]?.close?.hour >= 12 ? 'PM' : 'AM'}
                                onValueChange={(value) => handleAmPmChange(day.id, 'close', value)}
                              >
                                <SelectTrigger className="w-18">
                                  <SelectValue />
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
                    )}
                  </div>
                ))}

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveOpeningHours} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Opening Hours"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Shop Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logoUrl">Shop Logo</Label>
                  <div className="mt-2">
                    {shop?.logoUrl ? (
                      <div className="mb-4 flex flex-col items-center gap-4 sm:flex-row">
                        <img 
                          src={shop.logoUrl} 
                          alt="Shop Logo" 
                          className="w-24 h-24 object-cover rounded-full border"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">Current logo</p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => shop.logoUrl && window.open(shop.logoUrl, '_blank')}
                            >
                              View Full Size
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-6 border border-dashed rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">No logo uploaded</p>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Input
                        id="logoUrl"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                      />
                      <p className="text-xs text-muted-foreground">Recommended: Square image, at least 200x200 pixels</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bannerImage">Banner Image</Label>
                  <div className="mt-2">
                    {shop?.bannerImage ? (
                      <div className="mb-4">
                        <img 
                          src={shop.bannerImage} 
                          alt="Banner" 
                          className="w-full h-40 object-cover rounded-md border"
                        />
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => shop.bannerImage && window.open(shop.bannerImage, '_blank')}
                          >
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-6 border border-dashed rounded-md flex items-center justify-center h-40">
                        <p className="text-muted-foreground">No banner image uploaded</p>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Input
                        id="bannerImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'banner')}
                      />
                      <p className="text-xs text-muted-foreground">Recommended: Wide image, at least 1200x400 pixels</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Shop Shop images</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add additional images to showcase your shop</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {shop?.imageUrls && shop.imageUrls.length > 0 ? (
                        shop.imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Shop image ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-md border"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-background"
                                onClick={() => window.open(url, '_blank')}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-background text-destructive hover:bg-destructive hover:text-white"
                                onClick={() => handleRemoveGalleryImage(url, index)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full p-6 border border-dashed rounded-md flex items-center justify-center">
                          <p className="text-muted-foreground">No Shop images uploaded</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Input
                        id="galleryImages"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImageSelect}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">You can select multiple images at once</p>
                        <div className="flex items-center gap-2">
                          {galleryImages.length > 0 && (
                            <span className="text-xs">{galleryImages.length} image(s) selected</span>
                          )}
                          <Button 
                            onClick={handleGalleryUpload} 
                            disabled={uploadingGallery || galleryImages.length === 0}
                            size="sm"
                          >
                            {uploadingGallery ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              "Upload Shop images"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

