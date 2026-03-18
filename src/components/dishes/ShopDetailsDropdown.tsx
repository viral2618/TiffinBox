'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Star, MapPin, Navigation, ChevronDown, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as Collapsible from '@radix-ui/react-collapsible'

interface Shop {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  phone?: string | null
  address?: string | null
  contactPhone?: string | null
  whatsapp?: string | null
  openingHours?: {
    monday?: { open: { hour: number; minute: number }; close: { hour: number; minute: number }; isClosed: boolean } | null
    tuesday?: { open: { hour: number; minute: number }; close: { hour: number; minute: number }; isClosed: boolean } | null
    wednesday?: { open: { hour: number; minute: number }; close: { hour: number; minute: number }; isClosed: boolean } | null
    thursday?: { open: { hour: number; minute: number }; close: { hour: number; minute: number }; isClosed: boolean } | null
    friday?: { open: { hour: number; minute: number }; close: { hour: number; minute: number }; isClosed: boolean } | null
    saturday?: { open: { hour: number; minute: number }; close: { hour: number; minute: number }; isClosed: boolean } | null
    sunday?: { open: { hour: number; minute: number }; close: { hour: number; minute: number }; isClosed: boolean } | null
  } | null
}

interface ShopDetailsDropdownProps {
  shop: Shop
}

export default function ShopDetailsDropdown({ shop }: ShopDetailsDropdownProps) {
  const formatTime = (hour: number, minute: number) => {
    const time = new Date()
    time.setHours(hour, minute)
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const getTodayHours = () => {
    if (!shop.openingHours) return null
    const today = new Date().getDay()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = days[today] as keyof typeof shop.openingHours
    return shop.openingHours[dayName] || null
  }

  const todayHours = getTodayHours()

  return (
    <Collapsible.Root className="mt-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <Collapsible.Trigger className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-4">
          {shop.logoUrl ? (
            <Image
              src={shop.logoUrl}
              alt={shop.name}
              width={48}
              height={48}
              className="rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
              <span className="text-primary font-bold">{shop.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-left">{shop.name}</h3>
            {shop.address && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{shop.address}</span>
              </div>
            )}
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      
      <Collapsible.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <div className="px-5 pb-5">
          <div className="flex justify-end mb-4">
            <Link href={`/shops/${shop.slug}`}>
              <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-white">
                Visit Shop
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {todayHours && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span>
                  {!todayHours ? 'Hours not available' :
                    todayHours.isClosed ? 'Closed today' : 
                    `${formatTime(todayHours.open.hour, todayHours.open.minute)} - ${formatTime(todayHours.close.hour, todayHours.close.minute)}`
                  }
                </span>
              </div>
            )}
            
            {(shop.contactPhone || shop.phone) && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>{shop.contactPhone || shop.phone}</span>
              </div>
            )}
            
            {shop.address && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="flex-1">{shop.address}</span>
              </div>
            )}
            
            {shop.whatsapp && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <span className="block">WhatsApp: {shop.whatsapp}</span>
                </div>
              </div>
            )}
            
            {shop.openingHours && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Opening Hours</h4>
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                  {Object.entries(shop.openingHours).map(([day, hours]) => {
                    if (!hours) return null;
                    const isToday = new Date().getDay() === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
                    return (
                      <div key={day} className={`flex justify-between ${isToday ? 'font-medium text-gray-900' : ''}`}>
                        <span className="capitalize">{day}</span>
                        <span>
                          {hours.isClosed ? 'Closed' : 
                            `${formatTime(hours.open.hour, hours.open.minute)} - ${formatTime(hours.close.hour, hours.close.minute)}`
                          }
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}