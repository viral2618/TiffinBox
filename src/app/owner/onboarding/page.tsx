"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CountrySelector, countries } from "@/components/ui/country-selector";
import AddressAutocomplete from "@/components/ui/address-autocomplete";

interface TimeSlot {
  hour: number;
  minute: number;
}

interface DayHours {
  open: TimeSlot;
  close: TimeSlot;
  isClosed: boolean;
}

interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  [key: string]: DayHours | undefined;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // Form data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPhone2, setContactPhone2] = useState("");
  const [contactPhone3, setContactPhone3] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("IN");
  const [establishedYear, setEstablishedYear] = useState("");

  const currentConfig = countries[country];

  // Phone validation function
  const handlePhoneValidation = (value: string, setter: (value: string) => void) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= currentConfig.maxLength) {
      setter(digits);
    }
  };
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  // Image files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  
  // Opening hours
  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    tuesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    wednesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    thursday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    friday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
    saturday: { open: { hour: 10, minute: 0 }, close: { hour: 15, minute: 0 }, isClosed: false },
    sunday: { open: { hour: 0, minute: 0 }, close: { hour: 0, minute: 0 }, isClosed: true }
  });

  // Fetch tags and get location on component mount
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();
        setTags(data.tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    }
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    
    fetchTags();
  }, []);

  const handleDayToggle = (day: string) => {
    setOpeningHours((prev) => {
      const currentDay = prev[day] as DayHours;
      return {
        ...prev,
        [day]: {
          open: currentDay.open,
          close: currentDay.close,
          isClosed: !currentDay.isClosed,
        },
      };
    });
  };

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      if (selectedTags.length + newTags.length >= 10) {
        toast.error("You can only select up to 10 tags");
        return;
      }
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  const handleAddNewTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) {
      return;
    }
    
    if (selectedTags.length + newTags.length >= 10) {
      toast.error("You can only add up to 10 tags");
      return;
    }
    
    // Check if this tag already exists in the database
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === trimmedTag.toLowerCase()
    );
    
    if (existingTag) {
      // If it exists, just select it
      if (!selectedTags.includes(existingTag.id)) {
        if (selectedTags.length + newTags.length >= 10) {
          toast.error("You can only add up to 10 tags");
          return;
        }
        setSelectedTags([...selectedTags, existingTag.id]);
      }
    } else {
      // Check if we've already added this new tag
      if (!newTags.includes(trimmedTag) && 
          !newTags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())) {
        setNewTags([...newTags, trimmedTag]);
      }
    }
    
    setTagInput("");
  };
  
  const handleRemoveNewTag = (tagName: string) => {
    setNewTags(newTags.filter(tag => tag !== tagName));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGalleryFiles(Array.from(e.target.files));
    }
  };

  const handleImageUpload = async (file: File, type: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'shops');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }
      
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
      
      throw new Error(`No URL returned for ${type}`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!name || !address) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Upload images if provided
      let logoUrl: string | null = null;
      let bannerImage: string | null = null;
      let imageUrls: string[] = [];
      
      if (logoFile) {
        logoUrl = await handleImageUpload(logoFile, 'logo');
      }
      
      if (bannerFile) {
        bannerImage = await handleImageUpload(bannerFile, 'banner');
      }
      
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => handleImageUpload(file, 'gallery'));
        const results = await Promise.all(uploadPromises);
        imageUrls = results.filter(url => url !== null) as string[];
      }
      
      // Create new tags if needed
      let allTagIds = [...selectedTags];
      if (newTags.length > 0) {
        try {
          const createTagPromises = newTags.map(async (tagName) => {
            const response = await fetch('/api/tags', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: tagName }),
            });
            
            if (!response.ok) {
              throw new Error(`Failed to create tag: ${tagName}`);
            }
            
            const data = await response.json();
            return data.tag.id;
          });
          
          const newTagIds = await Promise.all(createTagPromises);
          allTagIds = [...allTagIds, ...newTagIds];
        } catch (error) {
          console.error('Error creating tags:', error);
          // Continue with shop creation even if some tags fail
        }
      }
      
      // Prepare shop data
      const shopData = {
        name,
        slug,
        description,
        address,
        coordinates,
        contactPhone,
        contactPhone2,
        contactPhone3,
        whatsapp,
        establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
        logoUrl,
        bannerImage,
        imageUrls,
        openingHours,
        shopTags: allTagIds.map(tagId => ({ tagId })),
        isOnboarded: true
      };
      
      // Create shop
      const response = await fetch('/api/owner/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create shop');
      }
      
      toast.success("Onboarding completed successfully!");
      
      // Update the session to reflect the onboarded status
      await update();
      
      router.push('/owner/dashboard');
    } catch (error) {
      console.error('Error creating shop:', error);
      toast.error((error as Error).message || 'An error occurred while creating the shop');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!name || !address)) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Complete Your Onboarding</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step === i ? 'bg-primary text-primary-foreground' : step > i ? 'bg-primary/80 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {i}
              </div>
              <span className="text-xs mt-1">
                {i === 1 ? 'Basic Info' : i === 2 ? 'Opening Hours' : i === 3 ? 'Images' : 'Tags'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details about your shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name" className="text-base">Shop Name*</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your shop, what makes it special, and what customers can expect"
                  rows={4}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">A good description helps customers understand what your shop offers</p>
              </div>
              
              <div className="sm:col-span-2">
                <Label htmlFor="address" className="text-base">Address*</Label>
                <AddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  onSelect={(selectedAddress, lat, lng) => {
                    setAddress(selectedAddress);
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
                      setContactPhone("");
                      setContactPhone2("");
                      setContactPhone3("");
                      setWhatsapp("");
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
                    value={contactPhone}
                    onChange={(e) => handlePhoneValidation(e.target.value, setContactPhone)}
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
                    value={contactPhone2}
                    onChange={(e) => handlePhoneValidation(e.target.value, setContactPhone2)}
                    placeholder={currentConfig.placeholder}
                    className="flex-1"
                    maxLength={currentConfig.maxLength}
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Additional phone number </p>
              </div>
              
              <div>
                <Label htmlFor="contactPhone3" className="text-base">Contact Phone 3</Label>
                <div className="flex gap-2 mt-1.5">
                  <div className="w-20 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm flex items-center justify-center">
                    {currentConfig.dialCode}
                  </div>
                  <Input
                    id="contactPhone3"
                    value={contactPhone3}
                    onChange={(e) => handlePhoneValidation(e.target.value, setContactPhone3)}
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
                    value={whatsapp}
                    onChange={(e) => handlePhoneValidation(e.target.value, setWhatsapp)}
                    placeholder={currentConfig.placeholder}
                    className="flex-1"
                    maxLength={currentConfig.maxLength}
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">WhatsApp number for customer communication </p>
              </div>
              
              <div>
                <Label htmlFor="establishedYear" className="text-base">Established Year</Label>
                <Input
                  id="establishedYear"
                  value={establishedYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const currentYear = new Date().getFullYear();
                    if (value.length <= 4) {
                      const year = parseInt(value);
                      if (value.length === 4 && year > currentYear) {
                        toast.error(`Year cannot be in the future (max: ${currentYear})`);
                        return;
                      }
                      setEstablishedYear(value);
                    }
                  }}
                  placeholder="e.g., 2020"
                  className="mt-1.5"
                  maxLength={4}
                  inputMode="numeric"
                />
                <p className="text-xs text-muted-foreground mt-1">Year your shop was established</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Opening Hours</CardTitle>
            <CardDescription>Set when your shop is open for customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Quick Set</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => {
                      setOpeningHours({
                        monday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                        tuesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                        wednesday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                        thursday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                        friday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: false },
                        saturday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: true },
                        sunday: { open: { hour: 9, minute: 0 }, close: { hour: 17, minute: 0 }, isClosed: true },
                      });
                    }}
                  >
                    Standard Business Hours
                  </Button>
                  <Button 
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setOpeningHours({
                        monday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                        tuesday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                        wednesday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                        thursday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                        friday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                        saturday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                        sunday: { open: { hour: 10, minute: 0 }, close: { hour: 22, minute: 0 }, isClosed: false },
                      });
                    }}
                  >
                    All Days (10 AM - 10 PM)
                  </Button>
                </div>
              </div>
              
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className={`border rounded-lg p-4 ${openingHours[day]?.isClosed ? 'bg-muted/30' : 'bg-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <h3 className="font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day}-toggle`} className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${openingHours[day]?.isClosed ? 'text-muted-foreground' : 'text-green-600'}`}>
                          {openingHours[day]?.isClosed ? "Closed" : "Open"}
                        </span>
                      </Label>
                      <Switch
                        id={`${day}-toggle`}
                        checked={!openingHours[day]?.isClosed}
                        onCheckedChange={() => handleDayToggle(day)}
                        style={{
                          backgroundColor: openingHours[day]?.isClosed ? '#f3e8d3' : '#fc7c7c'
                        }}
                      />
                    </div>
                  </div>

                  {!openingHours[day]?.isClosed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${day}-open`}>Opening Time</Label>
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Input
                                id={`${day}-open-hour`}
                                type="number"
                                min="1"
                                max="12"
                                value={(openingHours[day]?.open?.hour ?? 0) % 12 || 12}
                                onChange={(e) => {
                                  const numValue = parseInt(e.target.value, 10);
                                  if (isNaN(numValue) || numValue < 1 || numValue > 12) return;
                                  
                                  const currentDay = openingHours[day] as DayHours;
                                  const isPM = currentDay.open.hour >= 12;
                                  const newHour = isPM ? (numValue === 12 ? 12 : numValue + 12) : (numValue === 12 ? 0 : numValue);
                                  
                                  setOpeningHours(prev => {
                                    return {
                                      ...prev,
                                      [day]: {
                                        ...currentDay,
                                        open: {
                                          ...currentDay.open,
                                          hour: newHour
                                        }
                                      }
                                    };
                                  });
                                }}
                                className="w-14"
                              />
                              <span className="flex items-center">:</span>
                              <Input
                                id={`${day}-open-minute`}
                                type="number"
                                min="0"
                                max="59"
                                value={openingHours[day]?.open?.minute ?? 0}
                                onChange={(e) => {
                                  const numValue = parseInt(e.target.value, 10);
                                  if (isNaN(numValue) || numValue < 0 || numValue > 59) return;
                                  
                                  const currentDay = openingHours[day] as DayHours;
                                  setOpeningHours(prev => {
                                    return {
                                      ...prev,
                                      [day]: {
                                        ...currentDay,
                                        open: {
                                          ...currentDay.open,
                                          minute: numValue
                                        }
                                      }
                                    };
                                  });
                                }}
                                className="w-14"
                              />
                            </div>
                            <select
                              value={(openingHours[day]?.open?.hour ?? 0) >= 12 ? 'PM' : 'AM'}
                              onChange={(e) => {
                                const currentDay = openingHours[day] as DayHours;
                                const currentHour = currentDay.open.hour;
                                let newHour = currentHour;
                                
                                if (currentHour < 12 && e.target.value === 'PM') {
                                  newHour = currentHour === 0 ? 12 : currentHour + 12;
                                } else if (currentHour >= 12 && e.target.value === 'AM') {
                                  newHour = currentHour === 12 ? 0 : currentHour - 12;
                                }
                                
                                setOpeningHours(prev => {
                                  return {
                                    ...prev,
                                    [day]: {
                                      ...currentDay,
                                      open: {
                                        ...currentDay.open,
                                        hour: newHour
                                      }
                                    }
                                  };
                                });
                              }}
                              className="w-18 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                          
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`${day}-close`}>Closing Time</Label>
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Input
                                id={`${day}-close-hour`}
                                type="number"
                                min="1"
                                max="12"
                                value={(openingHours[day]?.close?.hour ?? 0) % 12 || 12}
                                onChange={(e) => {
                                  const numValue = parseInt(e.target.value, 10);
                                  if (isNaN(numValue) || numValue < 1 || numValue > 12) return;
                                  
                                  const currentDay = openingHours[day] as DayHours;
                                  const isPM = currentDay.close.hour >= 12;
                                  const newHour = isPM ? (numValue === 12 ? 12 : numValue + 12) : (numValue === 12 ? 0 : numValue);
                                  
                                  setOpeningHours(prev => {
                                    return {
                                      ...prev,
                                      [day]: {
                                        ...currentDay,
                                        close: {
                                          ...currentDay.close,
                                          hour: newHour
                                        }
                                      }
                                    };
                                  });
                                }}
                                className="w-14"
                              />
                              <span className="flex items-center">:</span>
                              <Input
                                id={`${day}-close-minute`}
                                type="number"
                                min="0"
                                max="59"
                                value={openingHours[day]?.close?.minute ?? 0}
                                onChange={(e) => {
                                  const numValue = parseInt(e.target.value, 10);
                                  if (isNaN(numValue) || numValue < 0 || numValue > 59) return;
                                  
                                  const currentDay = openingHours[day] as DayHours;
                                  setOpeningHours(prev => {
                                    return {
                                      ...prev,
                                      [day]: {
                                        ...currentDay,
                                        close: {
                                          ...currentDay.close,
                                          minute: numValue
                                        }
                                      }
                                    };
                                  });
                                }}
                                className="w-14"
                              />
                            </div>
                            <select
                              value={(openingHours[day]?.close?.hour ?? 0) >= 12 ? 'PM' : 'AM'}
                              onChange={(e) => {
                                const currentDay = openingHours[day] as DayHours;
                                const currentHour = currentDay.close.hour;
                                let newHour = currentHour;
                                
                                if (currentHour < 12 && e.target.value === 'PM') {
                                  newHour = currentHour === 0 ? 12 : currentHour + 12;
                                } else if (currentHour >= 12 && e.target.value === 'AM') {
                                  newHour = currentHour === 12 ? 0 : currentHour - 12;
                                }
                                
                                setOpeningHours(prev => {
                                  return {
                                    ...prev,
                                    [day]: {
                                      ...currentDay,
                                      close: {
                                        ...currentDay.close,
                                        hour: newHour
                                      }
                                    }
                                  };
                                });
                              }}
                              className="w-18 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                         
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Shop Images</CardTitle>
            <CardDescription>Upload images for your shop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="logoFile">Shop Logo</Label>
                <div className="mt-2">
                  {logoFile ? (
                    <div className="mb-4 flex items-center gap-4">
                      <img 
                        src={URL.createObjectURL(logoFile)} 
                        alt="Logo Preview" 
                        className="w-24 h-24 object-cover rounded-full border"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        type="button"
                        onClick={() => setLogoFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="logoFile" className="mb-4 p-6 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <p className="text-muted-foreground">Click to upload logo</p>
                    </label>
                  )}
                  <Input
                    id="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: Square image, at least 200x200 pixels</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bannerFile">Banner Image</Label>
                <div className="mt-2">
                  {bannerFile ? (
                    <div className="mb-4">
                      <img 
                        src={URL.createObjectURL(bannerFile)} 
                        alt="Banner Preview" 
                        className="w-full h-40 object-cover rounded-md border"
                      />
                      <div className="mt-2 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          type="button"
                          onClick={() => setBannerFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="bannerFile" className="mb-4 p-6 border-2 border-dashed rounded-md flex items-center justify-center h-40 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <p className="text-muted-foreground">Click to upload banner image</p>
                    </label>
                  )}
                  <Input
                    id="bannerFile"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: Wide image, at least 1200x400 pixels</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="galleryFiles">Shop images</Label>
                <div className="mt-2">
                  {galleryFiles.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {galleryFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Gallery preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-md border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <Button 
                              variant="outline" 
                              size="sm"
                              type="button"
                              className="bg-background"
                              onClick={() => {
                                const newFiles = [...galleryFiles];
                                newFiles.splice(index, 1);
                                setGalleryFiles(newFiles);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label htmlFor="galleryFiles" className="mb-4 p-6 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <p className="text-muted-foreground">Click to upload shop images</p>
                    </label>
                  )}
                  <Input
                    id="galleryFiles"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-1">You can select multiple images at once</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Shop Tags</CardTitle>
            <CardDescription>Add tags to help customers find your shop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="tagInput" className="text-base">Add Tags</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="relative flex-1">
                    <Input
                      id="tagInput"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Search or create new tag"
                      className="w-full"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewTag();
                        }
                      }}
                    />
                    {tagInput.trim() && (
                      <div className="absolute w-full bg-background border rounded-md mt-1 shadow-md max-h-60 overflow-auto z-10">
                        {/* Show matching existing tags */}
                        {tags
                          .filter(tag => tag.name.toLowerCase().includes(tagInput.toLowerCase()))
                          .map(tag => (
                            <div
                              key={tag.id}
                              className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                              onClick={() => {
                                handleTagSelect(tag.id);
                                setTagInput('');
                              }}
                            >
                              <span>{tag.name}</span>
                              {selectedTags.includes(tag.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                          ))
                        }
                        
                        {/* Option to create new tag if no exact match */}
                        {!tags.some(tag => tag.name.toLowerCase() === tagInput.toLowerCase()) && (
                          <div
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-primary flex items-center gap-2"
                            onClick={handleAddNewTag}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Create "{tagInput}"</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleAddNewTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Search for existing tags or create new ones</p>
              </div>
              
              <div>
                <Label className="text-base mb-2 block">Selected Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {/* Show selected existing tags */}
                  {selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <div 
                        key={tag.id} 
                        className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1"
                      >
                        {tag.name}
                        <button 
                          type="button"
                          className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                          onClick={() => handleTagSelect(tag.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null;
                  })}
                  
                  {/* Show new tags to be created */}
                  {newTags.map((tagName) => (
                    <div 
                      key={tagName} 
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      {tagName} (New)
                      <button 
                        type="button"
                        className="hover:bg-blue-600 rounded-full p-0.5"
                        onClick={() => handleRemoveNewTag(tagName)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  {selectedTags.length === 0 && newTags.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags selected yet</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        ) : (
          <div />
        )}
        
        {step < 4 ? (
          <Button type="button" onClick={nextStep}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing Onboarding...
              </>
            ) : (
              "Complete Onboarding"
            )}
          </Button>
        )}
      </div>
      </div>
  );
}
