"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import Link from "next/link";
import { getCurrencySymbol, type CurrencyCode } from "@/lib/currency";


interface DashboardData {
  owner: {
    id: string;
    name: string;
    email: string;
    isOnboarded: boolean;
  };
  shops: {
    id: string;
    name: string;
    slug: string;
    address: string;
    logoUrl: string | null;
    dishCount: number;
    tags: { id: string; name: string }[];
  }[];
  stats: {
    totalShops: number;
    totalDishes: number;
    premiumDishes: number;
    specialToday: number;
  };
  recentDishes: {
    id: string;
    name: string;
    shopName: string;
    price: number;
    currency?: string;
    imageUrl: string | null;
    createdAt: string;
    isPremium?: boolean;
    isSpecialToday?: boolean;
  }[];
}

export default function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/owner/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError('Error loading dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500">Error</h2>
        <p>{error || 'Failed to load dashboard data'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-2 py-4 sm:px-4 sm:py-6 space-y-4">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Welcome back, {dashboardData.owner.name}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <StatsCard title="Total Shops" value={dashboardData.stats.totalShops} description="Across all locations" />  
        <StatsCard title="Total Dishes" value={dashboardData.stats.totalDishes} description="In your menu" />
      </div>

      {/* Quick Notifications Section */}
      <Card className="w-full">
        <CardHeader className="px-3 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-base sm:text-lg">Dish Notifications</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <Link href="/owner/dashboard/notifications">
                <Button variant="outline" size="sm" className="text-xs">
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Get real-time updates on your dish preparation stages. Click the bell icon to see recent notifications.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="shops" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="shops" className="text-xs sm:text-sm px-2 py-2">My Shops</TabsTrigger>
          <TabsTrigger value="dishes" className="text-xs sm:text-sm px-2 py-2">Recent Dishes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shops" className="space-y-4 mt-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardData.shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="dishes" className="space-y-4 mt-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardData.recentDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6">
        <div className="text-lg sm:text-xl md:text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground leading-tight">{description}</p>
      </CardContent>
    </Card>
  );
}

function ShopCard({ shop }: { shop: DashboardData['shops'][0] }) {
  return (
    <Link href={`/owner/dashboard/my-shops/${shop.id}`}>
      <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            {shop.logoUrl && (
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden flex-shrink-0">
                <img src={shop.logoUrl} alt={shop.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base md:text-lg truncate">{shop.name}</CardTitle>
              <CardDescription className="text-xs sm:text-sm line-clamp-2">{shop.address}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-sm font-medium">{shop.dishCount} Dishes</p>
            </div>
            <div className="flex gap-1 flex-wrap">
              {shop.tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {shop.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">+{shop.tags.length - 2}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DishCard({ dish }: { dish: DashboardData['recentDishes'][0] }) {
  return (
    <Card className="w-full">
      <div className="relative h-32 sm:h-40 w-full overflow-hidden rounded-t-lg">
        {dish.imageUrl ? (
          <img src={dish.imageUrl} alt={dish.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No Image</p>
          </div>
        )}
        {dish.isPremium && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Premium
          </div>
        )}
        {dish.isSpecialToday && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Special
          </div>
        )}
      </div>
      <CardHeader className="pb-2 px-3 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-sm sm:text-base md:text-lg truncate">{dish.name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm truncate">{dish.shopName}</CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="flex justify-between items-center">
          <p className="font-bold text-sm sm:text-base">{getCurrencySymbol((dish.currency || 'INR') as CurrencyCode)}{dish.price.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(dish.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2">
        <div>
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mb-2" />
              <Skeleton className="h-2 sm:h-3 w-20 sm:w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Skeleton className="h-8 sm:h-10 w-32 sm:w-48 mb-4" />
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-32 sm:h-40 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                <Skeleton className="h-2 sm:h-3 w-16 sm:w-24 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
