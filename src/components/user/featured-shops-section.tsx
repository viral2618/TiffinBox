"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Clock, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import SectionTitle from "./section-title"
import ViewMoreButton from "./view-more-button"
import ShopSkeleton from "./shop-skeleton"
import ShopCard from "@/components/shops/ShopCard"
import { useLocation } from "@/hooks/use-location"

interface Shop {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  bannerImage?: string
  logoUrl?: string
  imageUrls?: string[]
  coordinates?: {
    lat: number
    lng: number
  }
  distance?: number
  isFavorite: boolean
  rating?: number
  contactPhone?: string
  priceRange?: string
  openingHours?: {
    monday?: {
      open: { hour: number; minute: number }
      close: { hour: number; minute: number }
      isClosed: boolean
    }
    tuesday?: {
      open: { hour: number; minute: number }
      close: { hour: number; minute: number }
      isClosed: boolean
    }
    wednesday?: {
      open: { hour: number; minute: number }
      close: { hour: number; minute: number }
      isClosed: boolean
    }
    thursday?: {
      open: { hour: number; minute: number }
      close: { hour: number; minute: number }
      isClosed: boolean
    }
    friday?: {
      open: { hour: number; minute: number }
      close: { hour: number; minute: number }
      isClosed: boolean
    }
    saturday?: {
      open: { hour: number; minute: number }
      close: { hour: number; minute: number }
      isClosed: boolean
    }
    sunday?: {
      open: { hour: number; minute: number }
      close: { hour: number; minute: number }
      isClosed: boolean
    }
    isOpenNow?: boolean
    displayText?: string
  }
  shopTags: {
    tag: {
      id: string
      name: string
    }
  }[]
}

export default function FeaturedShopsSection() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const { isEnabled: isLocationEnabled } = useLocation()

  useEffect(() => {
    const calculateDistance = (userLat: number, userLng: number, shopLat: number, shopLng: number) => {
      const R = 6371; // Earth radius in km
      const dLat = (shopLat - userLat) * Math.PI / 180;
      const dLng = (shopLng - userLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLat * Math.PI / 180) * Math.cos(shopLat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      return R * c; // Distance in km
    };

    const fetchShops = async () => {
      try {
        const response = await fetch("/api/shops?limit=6")
        if (response.ok) {
          const data = await response.json()
          
          // Get user location first
          const getUserLocation = (): Promise<GeolocationPosition | null> => {
            return new Promise((resolve) => {
              if (!navigator.geolocation) {
                resolve(null);
                return;
              }
              
              navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                () => resolve(null),
                { timeout: 5000 }
              );
            });
          };
          
          const userPosition = await getUserLocation();
          
          // Process shops to add distance and opening hours
          const processedShops = data.shops.map((shop: Shop) => {
            // Calculate distance if user location is available and shop has coordinates
            let distance = undefined;
            if (userPosition && shop.coordinates) {
              console.log(`Shop: ${shop.name}`);
              console.log(`Shop coordinates: lat=${shop.coordinates.lat}, lng=${shop.coordinates.lng}`);
              console.log(`User coordinates: lat=${userPosition.coords.latitude}, lng=${userPosition.coords.longitude}`);
              
              distance = calculateDistance(
                userPosition.coords.latitude,
                userPosition.coords.longitude,
                shop.coordinates.lat,
                shop.coordinates.lng
              );
              
              console.log(`Calculated distance: ${distance} km`);
            } else {
              console.log(`Shop: ${shop.name} - No coordinates or user position`);
            }
            
            // Create mock opening hours with actual times
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const today = new Date();
            const currentDay = days[today.getDay()];
            const currentHour = today.getHours();
            const currentMinute = today.getMinutes();
            
            // Generate mock opening hours for each day
            const mockOpeningHours: any = {};
            days.forEach(day => {
              // 80% chance the shop is open on this day
              const isClosed = Math.random() > 0.8;
              
              mockOpeningHours[day] = {
                open: { hour: 9, minute: 0 },
                close: { hour: 20, minute: 0 },
                isClosed
              };
            });
            
            // Determine if shop is currently open
            const todayHours = mockOpeningHours[currentDay];
            let isOpenNow = false;
            let displayText = '';
            
            if (todayHours && !todayHours.isClosed) {
              const openTime = todayHours.open.hour * 60 + todayHours.open.minute;
              const closeTime = todayHours.close.hour * 60 + todayHours.close.minute;
              const currentTime = currentHour * 60 + currentMinute;
              
              isOpenNow = currentTime >= openTime && currentTime < closeTime;
              
              if (isOpenNow) {
                const closeHour = todayHours.close.hour > 12 ? 
                  (todayHours.close.hour - 12) : todayHours.close.hour;
                const amPm = todayHours.close.hour >= 12 ? 'PM' : 'AM';
                displayText = `Open until ${closeHour}:${todayHours.close.minute.toString().padStart(2, '0')} ${amPm}`;
              } else {
                // Find next open day
                let nextOpenDay = currentDay;
                let daysChecked = 0;
                
                while (daysChecked < 7) {
                  const dayIndex = (today.getDay() + daysChecked + 1) % 7;
                  nextOpenDay = days[dayIndex];
                  
                  if (!mockOpeningHours[nextOpenDay].isClosed) {
                    break;
                  }
                  
                  daysChecked++;
                }
                
                if (daysChecked < 7) {
                  const openHour = mockOpeningHours[nextOpenDay].open.hour > 12 ? 
                    (mockOpeningHours[nextOpenDay].open.hour - 12) : mockOpeningHours[nextOpenDay].open.hour;
                  const amPm = mockOpeningHours[nextOpenDay].open.hour >= 12 ? 'PM' : 'AM';
                  
                  if (daysChecked === 0) {
                    displayText = `Opens today at ${openHour}:${mockOpeningHours[nextOpenDay].open.minute.toString().padStart(2, '0')} ${amPm}`;
                  } else if (daysChecked === 1) {
                    displayText = `Opens tomorrow at ${openHour}:${mockOpeningHours[nextOpenDay].open.minute.toString().padStart(2, '0')} ${amPm}`;
                  } else {
                    displayText = `Opens ${nextOpenDay} at ${openHour}:${mockOpeningHours[nextOpenDay].open.minute.toString().padStart(2, '0')} ${amPm}`;
                  }
                } else {
                  displayText = 'Temporarily closed';
                }
              }
            } else {
              displayText = 'Closed today';
            }
            
            // Add isOpenNow and displayText to the opening hours
            mockOpeningHours.isOpenNow = isOpenNow;
            mockOpeningHours.displayText = displayText;
            
            return {
              ...shop,
              distance: distance,
              openingHours: mockOpeningHours,
              isOpen: isOpenNow,
              openUntil: displayText,
              category: shop.shopTags?.[0]?.tag?.name || "Bakery"
            };
          });
          
          setShops(processedShops);
        } else {
          setShops([])
        }
      } catch (error) {
        console.error("Error fetching shops:", error)
        setShops([])
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
      },
    },
  } as const

  if (loading) {
    return (
      <section className="py-4 bg-background relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Section Header with View More Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded-md w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-72"></div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="h-10 bg-gray-200 rounded-md w-32"></div>
            </div>
          </div>

          {/* Shops Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ShopSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="py-4bg-background relative z-10">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header with View More Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <SectionTitle 
            title="FEATURED SHOPS" 
            subtitle="Discover the best local bakeries and food products in your area" 
          />
          <div className="mt-4 md:mt-0">
            <ViewMoreButton href="/shops" text="View All Shops" />
          </div>
        </div>

        {/* Shops Carousel */}
        <Carousel
          className="w-full"
          opts={{
            loop: true,
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
        >
          <CarouselContent className="-ml-4">
            {shops.map((shop) => {
              return (
                <CarouselItem 
                  key={shop.id} 
                  className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <ShopCard shop={shop} />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex items-center justify-end mt-4 gap-2">
            <CarouselPrevious className="static transform-none mx-0 bg-background hover:bg-background/90" />
            <CarouselNext className="static transform-none mx-0 bg-background hover:bg-background/90" />
          </div>
        </Carousel>

        
      </div>
    </section>
  )
}